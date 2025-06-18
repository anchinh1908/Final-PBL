const root = import.meta.env.VITE_API_URL

export const get_All_Rooms_By_HotelID = async (hotelid) => {
    try {
        const response = await fetch(`${root}/hotels/${hotelid}/rooms`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
        const json = await response.json()

        if (!response.ok) throw new Error(json.message || "Lấy danh sách phòng thất bại")

        return json
    } catch (error) {
        console.log(error)
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

        const response = await fetch(`${root}/admin/add-room`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        })

        const json = await response.json()

        if (!response.ok) throw new Error(json.message || "Thêm phòng thất bại")

        return json
    } catch (error) {
        console.error("Lỗi khi thêm phòng mới:", error)
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

        const response = await fetch(`${root}/admin/update-room/${roomId}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        })

        const json = await response.json()

        if (!response.ok) throw new Error(json.message || "Thêm phòng thất bại")

        return json
    } catch (error) {
        console.error("Lỗi khi thêm phòng mới:", error)
        throw error
    }
}

export const delete_Rooms = async (token, roomIds) => {
    try {
        const formData = new FormData()
        if (roomIds.length > 0) formData.append("roomIds", roomIds.join(","))

        const response = await fetch(`${root}/admin/delete-rooms`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        })

        const json = await response.json()

        if (!response.ok) throw new Error(json.message || "Xoá các phòng thất bại")

        return json
    } catch (error) {
        console.error("Lỗi khi xoá các phòng:", error)
        throw error
    }
}
