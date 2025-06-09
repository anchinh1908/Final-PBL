from flask import Flask, request, jsonify
from openai import OpenAI
from dotenv import load_dotenv
from flask_cors import CORS
import os
import cloudinary
import cloudinary.uploader
# import cloudinary.api
import psycopg2
from psycopg2.extras import RealDictCursor
import json
import numpy as np
import logging

# Cấu hình logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Cấu hình kết nối PostgreSQL
db_config = {
    "dbname": os.getenv("DATABASE_NAME"),
    "user": os.getenv("DATABASE_USER"),
    "password": os.getenv("DATABASE_PASSWORD"),
    "host": os.getenv("DATABASE_HOST"),
    "port": os.getenv("DATABASE_PORT")
}

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_SECRET_KEY"),
    secure=True
)

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "https://final-pbl.onrender.com", "http://localhost:8080", "https://final-pbl-8czd.onrender.com"])

def get_db_connection():
    return psycopg2.connect(**db_config)

def plan_trip( days, preferences, hotels, places):
    hotel_str = "\n".join([f"- {h['name']}: {h['description']}" for h in hotels])
    place_str = "\n".join([f"- {p['name']}: {p['description']}" for p in places])

    prompt = f"""
    Người dùng muốn đi du lịch tại Đà Nẵng trong {days} ngày.

    Yêu cầu cá nhân: {preferences}

    Các khách sạn có sẵn:
    {hotel_str}

    Các địa điểm tham quan tại Đà Nẵng:
    {place_str}

    Hãy gợi ý một lịch trình {days} ngày chi tiết, gồm:
    - Chọn khách sạn phù hợp
    - Lên kế hoạch mỗi ngày (sáng, chiều, tối)
    - Lý do vì sao lịch trình này phù hợp
    """
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        store=True,
        messages=[
            {"role": "system", "content": "Bạn là một chuyên gia lên lịch trình du lịch chuyên nghiệp."},
            {"role": "user", "content": prompt}
        ]
    )

    return response.choices[0].message.content.strip()

@app.route("/plan", methods=["POST"])
def api_plan_trip():
    data = request.get_json()
    days = data.get("days", 3)
    preferences = data.get("preferences", "")
    hotels = data.get("hotels", [])
    places = data.get("places", [])
    trip_plan = plan_trip(days, preferences, hotels, places)
    return jsonify({"itinerary": trip_plan})

@app.route('/upload-multiple', methods=['POST'])
def upload_multiple():
    if 'images' not in request.files:
        return jsonify({'error': 'No images part in the request'}), 400

    files = request.files.getlist('images')  # Lấy danh sách file upload

    if len(files) == 0:
        return jsonify({'error': 'No images uploaded'}), 400

    uploaded_images = []
    folder_name = 'HotelProposal/hotels/'

    try:
        for file in files:
            # Upload từng ảnh lên Cloudinary
            result = cloudinary.uploader.upload(file, folder=folder_name)
            uploaded_images.append(result.get('secure_url'))

        return jsonify({
            'message': f'{len(uploaded_images)} images uploaded successfully',
            'data': uploaded_images
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route("/embed", methods=["POST"])
def create_embedding():
    try:
        data = request.get_json()
        query = data.get("query", "")

        if not query:
            return jsonify({"error": "Missing 'query' in request body"}), 400

        response = client.embeddings.create(
            model="text-embedding-3-large",
            input=query
        )

        embedding = response.data[0].embedding
        return jsonify({"embedding": embedding})

    except Exception as e:
        return jsonify({"error": f"Error creating embedding: {str(e)}"}), 500
    
@app.route("/hearth", methods=["GET"])
def hearth_check():
    return jsonify({"status": "alive"}), 200

@app.route('/saveHotel', methods=['POST'])
def save_hotel():
    
    data = request.get_json()
    hotel_data = data.get('hotel_data', [{}])[0]  # Lấy dữ liệu khách sạn đầu tiên
    
    # Log dữ liệu nhận được để debug
    logger.info("Received hotel data: %s", hotel_data)

    # Kiểm tra các trường bắt buộc
    required_fields = ["name", "address", "district"]
    for field in required_fields:
        if not hotel_data.get(field):
            return jsonify({"error": f"Missing required field: {field}"}), 400

    # Chuẩn bị dữ liệu để lưu vào bảng hotels
    hotel_dict = {
        "name": hotel_data.get("name"),
        "address": hotel_data.get("address"),
        "district": hotel_data.get("district"),
        "description": hotel_data.get("description", ""),
        "hotel_link": hotel_data.get("hotel_link", ""),
        "rating_stars": hotel_data.get("ratingStars"),
        "facilities": json.dumps(hotel_data.get("facilities", [])),
        "highlights": json.dumps(hotel_data.get("highlights", {})),
        "reviews": json.dumps(hotel_data.get("reviews", {})),
        "image_urls": json.dumps(hotel_data.get("imageUrls", [])),
        "room_services": json.dumps(hotel_data.get("roomServices", {})),
        "slug": hotel_data.get("slug", ""),
        "coordinates": None
    }
    if hotel_data.get("latitude") and hotel_data.get("longitude"):
        hotel_dict["coordinates"] = f"SRID=4326;POINT({hotel_data['longitude']} {hotel_data['latitude']})"

    # Tạo embedding với text-embedding-3-large
    description = hotel_data.get("description", "")
    try:
        response = client.embeddings.create(
            model="text-embedding-3-large",
            input=description
        )
        embedding = response.data[0].embedding
        if len(embedding) != 3072:
            raise ValueError("Embedding vector length must be 3072")
        embedding_str = "[" + ", ".join(map(str, embedding)) + "]"
    except Exception as e:
        logger.error("Error creating embedding: %s", str(e))
        return jsonify({"error": "Failed to create embedding"}), 500

    # Lưu vào cơ sở dữ liệu
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Lưu vào bảng hotels
        cursor.execute("""
            INSERT INTO hotels (name, address, district, description, hotel_link, rating_stars, 
                               facilities, highlights, reviews, image_urls, room_services, slug, coordinates)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, ST_GeomFromText(%s, 4326))
            RETURNING id
        """, (
            hotel_dict["name"], hotel_dict["address"], hotel_dict["district"], hotel_dict["description"],
            hotel_dict["hotel_link"], hotel_dict["rating_stars"], hotel_dict["facilities"],
            hotel_dict["highlights"], hotel_dict["reviews"], hotel_dict["image_urls"],
            hotel_dict["room_services"], hotel_dict["slug"], hotel_dict["coordinates"]
        ))
        hotel_id = cursor.fetchone()[0]

        # Lưu vào bảng hotel_embeddings
        cursor.execute("""
            INSERT INTO hotel_embeddings (hotel_id, embedding, is_validated, version)
            VALUES (%s, %s, %s, %s)
        """, (hotel_id, embedding_str, False, 0))

        conn.commit()
        return jsonify({"message": "Hotel and embedding saved successfully", "hotel_id": hotel_id})

    except psycopg2.Error as e:
        conn.rollback()
        logger.error("Database error: %s", str(e))
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        conn.rollback()
        logger.error("Unexpected error: %s", str(e))
        return jsonify({"error": "Internal server error"}), 500

    finally:
        cursor.close()
        conn.close()

@app.route('/updateHotel', methods=['POST'])
def update_hotel():
    if request.content_type.startswith('multipart/form-data'):
        hotel_data_json = request.form.get('hotel_data')
        if hotel_data_json:
            try:
                hotel_data = json.loads(hotel_data_json)
            except json.JSONDecodeError as e:
                logger.error("Failed to parse hotel_data: %s", str(e))
                return jsonify({"error": "Invalid JSON in hotel_data"}), 400
        else:
            hotel_data = request.json or {}
    else:
        hotel_data = request.get_json() or {}

    # Lấy hotel_data từ EmbeddingRequest
    hotel_list = hotel_data.get("hotel_data", [])
    if not hotel_list:
        return jsonify({"error": "Missing hotel_data field"}), 400

    hotel_data = hotel_list[0] if hotel_list else {}
    
    logger.info("Received hotel data for update: %s", hotel_data)

    # Kiểm tra các trường bắt buộc
    required_fields = ["id", "name", "address", "district"]
    for field in required_fields:
        if not hotel_data.get(field):
            return jsonify({"error": f"Missing required field: {field}"}), 400

    # Lấy hotel_id
    hotel_id = hotel_data.get("id")

    # Xử lý image_urls (đã được gửi từ Java)
    image_urls = hotel_data.get("imageUrls", [])
    if isinstance(image_urls, str):
        try:
            image_urls = json.loads(image_urls)
        except json.JSONDecodeError:
            image_urls = [url.strip() for url in image_urls.split(",") if url.strip()]

    hotel_dict = {
        "id": hotel_id,
        "name": hotel_data.get("name"),
        "address": hotel_data.get("address"),
        "district": hotel_data.get("district"),
        "description": hotel_data.get("description", ""),
        "hotel_link": hotel_data.get("hotelLink", ""),
        "rating_stars": hotel_data.get("ratingStars"),
        "facilities": json.dumps(hotel_data.get("facilities", [])),
        "highlights": json.dumps(hotel_data.get("highlights", {})),
        "reviews": json.dumps(hotel_data.get("reviews", {})),
        "image_urls": json.dumps(image_urls if image_urls else hotel_data.get("image_urls", [])),
        "room_services": json.dumps(hotel_data.get("roomServices", {})),
        "slug": hotel_data.get("slug", "")
    }
    if hotel_data.get("latitude") and hotel_data.get("longitude"):
        hotel_dict["coordinates"] = f"SRID=4326;POINT({hotel_data['longitude']} {hotel_data['latitude']})"

    # Tạo embedding với text-embedding-3-large
    description = hotel_data.get("description", "")
    try:
        response = client.embeddings.create(
            model="text-embedding-3-large",
            input=description
        )
        embedding = response.data[0].embedding
        if len(embedding) != 3072:
            raise ValueError("Embedding vector length must be 3072")
        embedding_str = "[" + ", ".join(map(str, embedding)) + "]"
    except Exception as e:
        logger.error("Error creating embedding: %s", str(e))
        return jsonify({"error": "Failed to create embedding"}), 500

    # Cập nhật vào cơ sở dữ liệu
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            UPDATE hotels 
            SET name = %s, address = %s, district = %s, description = %s, hotel_link = %s, 
                rating_stars = %s, facilities = %s, highlights = %s, reviews = %s, 
                image_urls = %s, room_services = %s, slug = %s, coordinates = ST_GeomFromText(%s, 4326)
            WHERE id = %s
            RETURNING id
        """, (
            hotel_dict["name"], hotel_dict["address"], hotel_dict["district"], hotel_dict["description"],
            hotel_dict["hotel_link"], hotel_dict["rating_stars"], hotel_dict["facilities"],
            hotel_dict["highlights"], hotel_dict["reviews"], hotel_dict["image_urls"],
            hotel_dict["room_services"], hotel_dict["slug"], hotel_dict["coordinates"], hotel_id
        ))
        updated_id = cursor.fetchone()[0]

        cursor.execute("""
            UPDATE hotel_embeddings 
            SET embedding = %s, is_validated = %s, version = version + 1
            WHERE hotel_id = %s
        """, (embedding_str, False, hotel_id))

        conn.commit()
        return jsonify({"message": "Hotel updated successfully", "hotel_id": updated_id})

    except psycopg2.Error as e:
        conn.rollback()
        logger.error("Database error: %s", str(e))
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        conn.rollback()
        logger.error("Unexpected error: %s", str(e))
        return jsonify({"error": "Internal server error"}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/savePlace', methods=['POST'])
def save_place():
    place_data = request.get_json() or {}
    place_list = place_data.get("place_data", [])
    if not place_list:
        return jsonify({"error": "Missing place_data field"}), 400

    place_data = place_list[0] if place_list else {}
    
    logger.info("Received place data: %s", place_data)

    required_fields = ["title", "address"]
    for field in required_fields:
        if not place_data.get(field):
            return jsonify({"error": f"Missing required field: {field}"}), 400

    place_dict = {
        "title": place_data.get("title"),
        "rating": place_data.get("rating", 0),
        "address": place_data.get("address"),
        "review": place_data.get("review", 0),
        "slug": place_data.get("slug", ""),
        "image_url": place_data.get("imageUrl", ""),
        "description": place_data.get("description", ""),
        "services": json.dumps(place_data.get("services", []))
    }
    if place_data.get("latitude") and place_data.get("longitude"):
        place_dict["coordinates"] = f"SRID=4326;POINT({place_data['longitude']} {place_data['latitude']})"

    # Tạo embedding với text-embedding-3-large
    description = place_data.get("description", "")
    try:
        response = client.embeddings.create(
            model="text-embedding-3-large",
            input=description
        )
        embedding = response.data[0].embedding
        if len(embedding) != 3072:
            raise ValueError("Embedding vector length must be 3072")
        embedding_str = "[" + ", ".join(map(str, embedding)) + "]"
    except Exception as e:
        logger.error("Error creating embedding: %s", str(e))
        return jsonify({"error": "Failed to create embedding"}), 500

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO places (title, rating, address, review, slug, coordinates, image_url, description, service)
            VALUES (%s, %s, %s, %s, %s, ST_GeomFromText(%s, 4326), %s, %s, %s)
            RETURNING id
        """, (
            place_dict["title"], place_dict["rating"], place_dict["address"], place_dict["review"],
            place_dict["slug"], place_dict["coordinates"] if "coordinates" in place_dict else None,
            place_dict["image_url"], place_dict["description"], place_dict["services"]
        ))
        place_id = cursor.fetchone()[0]

        cursor.execute("""
            INSERT INTO place_embeddings (place_id, embedding)
            VALUES (%s, %s)
        """, (place_id, embedding_str))

        conn.commit()
        return jsonify({"message": "Place and embedding saved successfully", "place_id": place_id})

    except psycopg2.Error as e:
        conn.rollback()
        logger.error("Database error: %s", str(e))
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        conn.rollback()
        logger.error("Unexpected error: %s", str(e))
        return jsonify({"error": "Internal server error"}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/updatePlace', methods=['POST'])
def update_place():
    place_data = request.get_json() or {}
    place_list = place_data.get("place_data", [])
    if not place_list:
        return jsonify({"error": "Missing place_data field"}), 400

    place_data = place_list[0] if place_list else {}
    
    logger.info("Received place data for update: %s", place_data)

    # Kiểm tra các trường bắt buộc
    required_fields = ["id", "title", "address"]
    for field in required_fields:
        if not place_data.get(field):
            return jsonify({"error": f"Missing required field: {field}"}), 400

    # Lấy place_id
    place_id = place_data.get("id")

    # Xử lý image_urls (đã được gửi từ Java)
    image_urls = place_data.get("imageUrl", [])
    if isinstance(image_urls, str):
        try:
            image_urls = json.loads(image_urls)
        except json.JSONDecodeError:
            image_urls = [url.strip() for url in image_urls.split(",") if url.strip()]

    place_dict = {
        "id": place_id,
        "title": place_data.get("title"),
        "rating": place_data.get("rating", 0.0),
        "address": place_data.get("address"),
        "review": place_data.get("review", 0),
        "slug": place_data.get("slug", ""),  # Sẽ giữ nguyên từ Java
        "image_url": json.dumps(image_urls if image_urls else place_data.get("imageUrl", [])),
        "description": place_data.get("description", ""),
        "services": json.dumps(place_data.get("services", []))
    }
    if place_data.get("latitude") and place_data.get("longitude"):
        place_dict["coordinates"] = f"SRID=4326;POINT({place_data['longitude']} {place_data['latitude']})"

    # Tạo embedding với text-embedding-3-large
    description = place_data.get("description", "")
    try:
        response = client.embeddings.create(
            model="text-embedding-3-large",
            input=description
        )
        embedding = response.data[0].embedding
        if len(embedding) != 3072:
            raise ValueError("Embedding vector length must be 3072")
        embedding_str = "[" + ", ".join(map(str, embedding)) + "]"
    except Exception as e:
        logger.error("Error creating embedding: %s", str(e))
        return jsonify({"error": "Failed to create embedding"}), 500

    # Cập nhật vào cơ sở dữ liệu
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            UPDATE places 
            SET title = %s, rating = %s, address = %s, review = %s, image_url = %s, 
                description = %s, service = %s, coordinates = ST_GeomFromText(%s, 4326)
            WHERE id = %s
            RETURNING id
        """, (
            place_dict["title"], place_dict["rating"], place_dict["address"], place_dict["review"],
            place_dict["image_url"], place_dict["description"], place_dict["services"],
            place_dict["coordinates"] if "coordinates" in place_dict else None, place_id
        ))
        updated_id = cursor.fetchone()[0]

        cursor.execute("""
            UPDATE place_embeddings 
            SET embedding = %s
            WHERE place_id = %s
        """, (embedding_str, place_id))

        conn.commit()
        return jsonify({"message": "Place updated successfully", "place_id": updated_id})

    except psycopg2.Error as e:
        conn.rollback()
        logger.error("Database error: %s", str(e))
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        conn.rollback()
        logger.error("Unexpected error: %s", str(e))
        return jsonify({"error": "Internal server error"}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/saveRoom', methods=['POST'])
def save_room():
    room_data = request.get_json() or {}
    room_list = room_data.get("room_data", [])
    if not room_list:
        return jsonify({"error": "Missing room_data field"}), 400

    room_data = room_list[0] if room_list else {}
    
    logger.info("Received room data: %s", room_data)

    required_fields = ["hotelId", "name", "numberOfGuests", "price"]
    for field in required_fields:
        if not room_data.get(field):
            return jsonify({"error": f"Missing required field: {field}"}), 400

    room_dict = {
        "hotel_id": room_data.get("hotelId"),
        "name": room_data.get("name"),
        "number_of_guests": room_data.get("numberOfGuests"),
        "price": room_data.get("price"),
        "original_price": room_data.get("originalPrice", 0),
        "taxes_and_fees_under_price": room_data.get("taxesAndFeesUnderPrice", False),
        "status": room_data.get("status", "AVAILABLE")
    }

    # Tạo embedding với text-embedding-3-large (dựa trên name)
    description = room_data.get("name", "")
    try:
        response = client.embeddings.create(
            model="text-embedding-3-large",
            input=description
        )
        embedding = response.data[0].embedding
        if len(embedding) != 3072:
            raise ValueError("Embedding vector length must be 3072")
        embedding_str = "[" + ", ".join(map(str, embedding)) + "]"
    except Exception as e:
        logger.error("Error creating embedding: %s", str(e))
        return jsonify({"error": "Failed to create embedding"}), 500

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO room_types (hotel_id, name, number_of_guests, price, original_price, 
                                  taxes_and_fees_under_price, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            room_dict["hotel_id"], room_dict["name"], room_dict["number_of_guests"], room_dict["price"],
            room_dict["original_price"], room_dict["taxes_and_fees_under_price"], room_dict["status"]
        ))
        room_id = cursor.fetchone()[0]

        cursor.execute("""
            INSERT INTO room_embeddings (room_id, embedding)
            VALUES (%s, %s)
        """, (room_id, embedding_str))

        conn.commit()
        return jsonify({"message": "Room and embedding saved successfully", "room_id": room_id})

    except psycopg2.Error as e:
        conn.rollback()
        logger.error("Database error: %s", str(e))
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        conn.rollback()
        logger.error("Unexpected error: %s", str(e))
        return jsonify({"error": "Internal server error"}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/updateRoom', methods=['POST'])
def update_room():
    room_data = request.get_json() or {}
    room_list = room_data.get("room_data", [])
    if not room_list:
        return jsonify({"error": "Missing room_data field"}), 400

    room_data = room_list[0] if room_list else {}
    
    logger.info("Received room data for update: %s", room_data)

    # Kiểm tra các trường bắt buộc
    required_fields = ["id", "hotelId", "name", "numberOfGuests", "price"]
    for field in required_fields:
        if not room_data.get(field):
            return jsonify({"error": f"Missing required field: {field}"}), 400

    # Lấy room_id
    room_id = room_data.get("id")

    room_dict = {
        "id": room_id,
        "hotel_id": room_data.get("hotelId"),
        "name": room_data.get("name"),
        "number_of_guests": room_data.get("numberOfGuests"),
        "price": room_data.get("price"),
        "original_price": room_data.get("originalPrice", 0),
        "taxes_and_fees_under_price": room_data.get("taxesAndFeesUnderPrice", False),
        "status": room_data.get("status", "AVAILABLE")
    }

    # Tạo embedding với text-embedding-3-large (dựa trên name)
    description = room_data.get("name", "")
    try:
        response = client.embeddings.create(
            model="text-embedding-3-large",
            input=description
        )
        embedding = response.data[0].embedding
        if len(embedding) != 3072:
            raise ValueError("Embedding vector length must be 3072")
        embedding_str = "[" + ", ".join(map(str, embedding)) + "]"
    except Exception as e:
        logger.error("Error creating embedding: %s", str(e))
        return jsonify({"error": "Failed to create embedding"}), 500

    # Cập nhật vào cơ sở dữ liệu
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            UPDATE room_types 
            SET hotel_id = %s, name = %s, number_of_guests = %s, price = %s, 
                original_price = %s, taxes_and_fees_under_price = %s, status = %s
            WHERE id = %s
            RETURNING id
        """, (
            room_dict["hotel_id"], room_dict["name"], room_dict["number_of_guests"], room_dict["price"],
            room_dict["original_price"], room_dict["taxes_and_fees_under_price"], room_dict["status"],
            room_id
        ))
        updated_id = cursor.fetchone()[0]

        cursor.execute("""
            UPDATE room_embeddings 
            SET embedding = %s
            WHERE room_id = %s
        """, (embedding_str, room_id))

        conn.commit()
        return jsonify({"message": "Room updated successfully", "room_id": updated_id})

    except psycopg2.Error as e:
        conn.rollback()
        logger.error("Database error: %s", str(e))
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        conn.rollback()
        logger.error("Unexpected error: %s", str(e))
        return jsonify({"error": "Internal server error"}), 500
    finally:
        cursor.close()
        conn.close()