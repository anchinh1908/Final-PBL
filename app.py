from flask import Flask, request, jsonify
from openai import OpenAI
from dotenv import load_dotenv
import os
import cloudinary
import cloudinary.uploader
import cloudinary.api

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_SECRET_KEY"),
    secure=True
)

app = Flask(__name__)

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