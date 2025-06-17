import client from "./client"

export const add_Hotel_My_Trip = async (token, hotelId) => {
    try {
        const response = await client.post(
            "/user/hotel-trip/add",
            { hotelId },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )

        return response.data
    } catch (error) {
        console.log("Lỗi khi thêm khách sạn vào chuyến đi:", error)
        throw error
    }
}

export const add_Place_My_Trip = async (token, placeId) => {
    try {
        const response = await client.post(
            "/user/place-trip/add",
            { placeId },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )

        return response.data
    } catch (error) {
        console.log("Lỗi khi thêm địa điểm vào chuyến đi:", error)
        throw error
    }
}
