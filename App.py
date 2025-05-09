from flask import Flask, request, jsonify
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

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


if __name__ == "__main__":
    app.run(debug=True)
