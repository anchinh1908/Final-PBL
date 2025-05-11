# from flask import Flask, request, jsonify
# from openai import OpenAI
# from dotenv import load_dotenv
# import os
# from sentence_transformers import SentenceTransformer

# load_dotenv()
# client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
# model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-mpnet-base-v2')

# app = Flask(__name__)

# def plan_trip( days, preferences, hotels, places, places_wish):
#     hotel_str = "\n".join([f"- {h['name']}: {h['description']}" for h in hotels])
#     place_str = "\n".join([f"- {p['name']}: {p['description']}" for p in places])
#     place_wish_str = "\n".join([f"- {p['name']}: {p['description']}" for p in places_wish])

#     prompt = f"""
#     Người dùng muốn đi du lịch tại Đà Nẵng trong {days} ngày.

#     Yêu cầu cá nhân: {preferences}

#     Địa điểm tham quan ở Đà Nẵng muốn đi:
#     {place_wish_str}

#     Các khách sạn có sẵn:
#     {hotel_str}

#     Các địa điểm tham quan tại Đà Nẵng được gợi ý:
#     {place_str}

#     Hãy gợi ý một lịch trình {days} ngày chi tiết, gồm:
#     - Chọn khách sạn phù hợp
#     - Lên kế hoạch mỗi ngày (sáng, chiều, tối)
#     - Lý do vì sao lịch trình này phù hợp
#     """
#     response = client.chat.completions.create(
#         model="gpt-4o-mini",
#         store=True,
#         messages=[
#             {"role": "system", "content": "Bạn là một chuyên gia lên lịch trình du lịch chuyên nghiệp."},
#             {"role": "user", "content": prompt}
#         ]
#     )

#     return response.choices[0].message.content.strip()

# @app.route("/", methods=["GET"])
# def home():
#     return jsonify({"message": "Trip planner & embedding API running."})

# @app.route("/plan", methods=["POST"])
# def api_plan_trip():
#     data = request.get_json()
#     days = data.get("days", 3)
#     preferences = data.get("preferences", "")
#     hotels = data.get("hotels", [])
#     places = data.get("places", [])
#     places_wish = data.get("places_wish", [])

#     if not isinstance(hotels, list) or not isinstance(places, list) or not isinstance(places_wish, list):
#         return jsonify({"error": "Invalid input data"}), 400

#     trip_plan = plan_trip(days, preferences, hotels, places, places_wish)
#     return jsonify({"itinerary": trip_plan})

# @app.route('/embed', methods=['POST'])
# def create_embedding():
#     try:
#         data = request.get_json()
#         query = data.get("query", "")
#         if not query:
#             return jsonify({"error": "Missing 'query'"}), 400
        
#         embedding = model.encode([query])[0]
#         embedding_list = embedding.tolist()
#         return jsonify({"embedding": embedding_list})
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500
    

from flask import Flask, request, jsonify
from openai import OpenAI
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
import os
import logging
from pydantic import BaseModel, Field, ValidationError
from typing import List
from http import HTTPStatus

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Load environment variables
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    logger.error("OPENAI_API_KEY is not set")
    raise EnvironmentError("OPENAI_API_KEY is required")

# Initialize clients
try:
    client = OpenAI(api_key=openai_api_key)
    model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-mpnet-base-v2')
except Exception as e:
    logger.error(f"Failed to initialize clients: {str(e)}")
    raise

# Pydantic models for input validation
class Place(BaseModel):
    name: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)

class PlanTripRequest(BaseModel):
    days: int = Field(..., ge=1, le=30)
    preferences: str = Field(default="", max_length=1000)
    hotels: List[Place] = Field(default=[])
    places: List[Place] = Field(default=[])
    places_wish: List[Place] = Field(default=[])

class EmbedRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000)

def build_prompt(days: int, preferences: str, hotels: List[Place], places: List[Place], places_wish: List[Place]) -> str:
    """Build prompt for trip planning."""
    hotel_str = "\n".join([f"- {h.name}: {h.description}" for h in hotels])
    place_str = "\n".join([f"- {p.name}: {p.description}" for p in places])
    place_wish_str = "\n".join([f"- {p.name}: {p.description}" for p in places_wish])

    return f"""
    Người dùng muốn đi du lịch tại Đà Nẵng trong {days} ngày.

    Yêu cầu cá nhân: {preferences}

    Địa điểm tham quan ở Đà Nẵng muốn đi:
    {place_wish_str}

    Các khách sạn có sẵn:
    {hotel_str}

    Các địa điểm tham quan tại Đà Nẵng được gợi ý:
    {place_str}

    Hãy gợi ý một lịch trình {days} ngày chi tiết, gồm:
    - Chọn khách sạn phù hợp
    - Lên kế hoạch mỗi ngày (sáng, chiều, tối)
    - Lý do vì sao lịch trình này phù hợp
    """

def plan_trip(days: int, preferences: str, hotels: List[Place], places: List[Place], places_wish: List[Place]) -> str:
    """Plan a trip using OpenAI API."""
    try:
        prompt = build_prompt(days, preferences, hotels, places, places_wish)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            store=True,
            messages=[
                {"role": "system", "content": "Bạn là một chuyên gia lên lịch trình du lịch chuyên nghiệp."},
                {"role": "user", "content": prompt}
            ],
            timeout=30
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"OpenAI API error: {str(e)}")
        raise

@app.route("/", methods=["GET"])
def home():
    """Home endpoint to check API status."""
    return jsonify({"message": "Trip planner & embedding API running."})

@app.route("/plan", methods=["POST"])
def api_plan_trip():
    """Plan a trip based on user preferences."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing request body"}), HTTPStatus.BAD_REQUEST
        
        # Validate input with Pydantic
        request_data = PlanTripRequest(**data)
        
        trip_plan = plan_trip(
            request_data.days,
            request_data.preferences,
            request_data.hotels,
            request_data.places,
            request_data.places_wish
        )
        return jsonify({"itinerary": trip_plan})
    
    except ValidationError as e:
        logger.warning(f"Invalid input: {str(e)}")
        return jsonify({"error": str(e)}), HTTPStatus.BAD_REQUEST
    except Exception as e:
        logger.error(f"Error planning trip: {str(e)}")
        return jsonify({"error": "Internal server error"}), HTTPStatus.INTERNAL_SERVER_ERROR

@app.route('/embed', methods=['POST'])
def create_embedding():
    """Create embedding for a given query."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing request body"}), HTTPStatus.BAD_REQUEST
        
        # Validate input with Pydantic
        request_data = EmbedRequest(**data)
        
        embedding = model.encode([request_data.query])[0]
        embedding_list = embedding.tolist()
        return jsonify({"embedding": embedding_list})
    
    except ValidationError as e:
        logger.warning(f"Invalid input: {str(e)}")
        return jsonify({"error": str(e)}), HTTPStatus.BAD_REQUEST
    except Exception as e:
        logger.error(f"Error creating embedding: {str(e)}")
        return jsonify({"error": "Internal server error"}), HTTPStatus.INTERNAL_SERVER_ERROR