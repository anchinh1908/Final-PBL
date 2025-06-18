import { getSessionId } from "~/utils/sessionHelper"

const root = import.meta.env.VITE_API_URL
const n8n_url = import.meta.env.VITE_N8N_URL

export const add_Hotel_My_Trip = async (token, hotelId) => {
    try {
        const response = await fetch(`${root}/user/hotel-trip/add`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ hotelId }),
        })

        const json = await response.json()

        if (!response.ok) throw new Error(json.message || "Thêm khách sạn vào chuyến đi thất bại")

        return json
    } catch (error) {
        console.error("Lỗi khi thêm khách sạn vào chuyến đi:", error)
        throw error
    }
}

export const add_Place_My_Trip = async (token, placeId) => {
    try {
        const response = await fetch(`${root}/user/place-trip/add`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ placeId }),
        })

        const json = await response.json()

        if (!response.ok) throw new Error(json.message || "Thêm địa điểm vào chuyến đi thất bại")

        return json
    } catch (error) {
        console.error("Lỗi khi thêm địa điểm vào chuyến đi:", error)
        throw error
    }
}

export const delete_Hotel_My_Trip = async (token, hotelId) => {
    try {
        const response = await fetch(`${root}/user/hotel-trip/delete/${hotelId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
                // "Content-Type": "application/json",
            },
        })

        const json = await response.json()

        if (!response.ok) throw new Error(json.message || "Xoá khách sạn khỏi chuyến đi thất bại")

        return json
    } catch (error) {
        console.error("Lỗi khi xoá khách sạn khỏi chuyến đi:", error)
        throw error
    }
}

export const delete_Place_My_Trip = async (token, placeId) => {
    try {
        const response = await fetch(`${root}/user/place-trip/delete/${placeId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
                // "Content-Type": "application/json",
            },
        })

        const json = await response.json()

        if (!response.ok) throw new Error(json.message || "Xoá địa điểm khỏi chuyến đi thất bại")

        return json
    } catch (error) {
        console.error("Lỗi khi xoá địa điểm khỏi chuyến đi:", error)
        throw error
    }
}

export const hotel_Trip_List = async (token) => {
    try {
        const response = await fetch(`${root}/user/hotel-trip-list`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })

        const json = await response.json()

        if (!response.ok)
            throw new Error(json.message || "Lấy danh sách khách sạn của chuyến đi thất bại")

        return json
    } catch (error) {
        console.error("Lỗi lấy danh sách khách sạn của chuyến đi:", error)
        throw error
    }
}

export const place_Trip_List = async (token) => {
    try {
        const response = await fetch(`${root}/user/place-trip-list`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })

        const json = await response.json()

        if (!response.ok)
            throw new Error(json.message || "Lấy danh sách địa điểm của chuyến đi thất bại.")

        return json
    } catch (error) {
        console.error("Lỗi khi lấy danh sách địa điểm của chuyến đi:", error)
        throw error
    }
}

export const generate_Trip_Itinerary = async (hotels, places, preferences, day, number) => {
    const sessionId = getSessionId()

    const hotelStr = hotels.map((h) => h.hotel.name).join(", ")
    const placeStr = places.map((p) => p.title).join(", ")

    const prompt = `
Chúng tôi gồm ${number} người muốn đi du lịch tại Đà Nẵng trong ${day} ngày. Yêu cầu cá nhân: ${preferences}
Các khách sạn muốn ở: ${hotelStr}
Các địa điểm tham quan muốn đến: ${placeStr}

Hãy gợi ý một lịch trình ${day} ngày chi tiết, gồm:
- Chọn khách sạn phù hợp
- Lên kế hoạch mỗi ngày (sáng, chiều, tối)
- Lý do vì sao lịch trình này phù hợp`

    try {
        const token = localStorage.getItem("token") || ""
        const response = await fetch(n8n_url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                sessionId: sessionId,
                message: prompt,
                chat_history: [],
                token: token,
            }),
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || "Webhook Error")
        }

        const data = await response.json()

        if (data.response) {
            return data.response
        } else {
            throw new Error("Phản hồi không hợp lệ từ máy chủ.")
        }
    } catch (error) {
        console.error("Lỗi khi tạo chuyến đi:", error)
        throw error
    }
}
