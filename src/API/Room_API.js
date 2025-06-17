import client from "./client"

export const get_All_Rooms_By_HotelID = async (hotelId) => {
    try {
        const response = await client.get(`/hotels/${hotelId}/rooms`)
        return response.data
    } catch (error) {
        // console.log("Lấy danh sách phòng theo hotelId thất bại:", error)
        throw error
    }
}

export const add_New_Room = async (token, hotelId, room) => {
    try {
        const formData = new FormData()
        if (hotelId) formData.append("hotelId", hotelId)
        if (room.name) formData.append("name", room.name)
        if (room.numberOfGuests) formData.append("numberOfGuests", room.numberOfGuests)
        if (room.price) formData.append("price", room.price)
        if (room.originalPrice) formData.append("originalPrice", room.originalPrice)
        if (room.taxesAndFeesUnderPrice)
            formData.append("taxesAndFeesUnderPrice", room.taxesAndFeesUnderPrice)

        const response = await client.post("/admin/add-room", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data", // FormData cần content-type này
            },
        })

        return response.data
    } catch (error) {
        console.log("Lỗi khi thêm phòng mới:", error)
        throw error
    }
}

export const update_Room = async (token, roomId, newRoom) => {
    try {
        const formData = new FormData()
        if (newRoom.hotelId) formData.append("hotelId", newRoom.hotelId)
        if (newRoom.name) formData.append("name", newRoom.name)
        if (newRoom.numberOfGuests) formData.append("numberOfGuests", newRoom.numberOfGuests)
        if (newRoom.price) formData.append("price", newRoom.price)
        if (newRoom.originalPrice) formData.append("originalPrice", newRoom.originalPrice)
        if (newRoom.taxesAndFeesUnderPrice)
            formData.append("taxesAndFeesUnderPrice", newRoom.taxesAndFeesUnderPrice)

        const response = await client.put(`/admin/update-room/${roomId}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        })

        return response.data
    } catch (error) {
        console.log("Lỗi khi cập nhật phòng:", error)
        throw error
    }
}

export const delete_Rooms = async (token, roomIds) => {
    try {
        const formData = new FormData()
        if (roomIds.length > 0) formData.append("roomIds", roomIds.join(","))

        const response = await client.delete("/admin/delete-rooms", {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
            data: formData, // axios dùng `data` để gửi body trong DELETE
        })

        return response.data
    } catch (error) {
        console.log("Lỗi khi xoá các phòng:", error)
        throw error
    }
}
