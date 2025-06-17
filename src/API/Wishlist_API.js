import client from "./client"

export const add_My_Wishlist = async (token, hotelId) => {
    try {
        const response = await client.post(`/user/wishlist/${hotelId}`, null, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        return response.data
    } catch (error) {
        console.log("Lỗi khi thêm vào danh sách yêu thích:", error)
        throw error
    }
}

export const delete_My_Wishlist = async (token, hotelId) => {
    try {
        const response = await client.delete(`/user/wishlist/${hotelId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        return response.data
    } catch (error) {
        console.log("Lỗi khi xóa khỏi danh sách yêu thích:", error)
        throw error
    }
}

export const get_My_Wishlist = async (token, page = 1, size = 10) => {
    try {
        const response = await client.get(`/user/wishlist`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: { page, size },
        })
        return response.data
    } catch (error) {
        console.log("Lỗi khi lấy danh sách yêu thích:", error)
        throw error
    }
}
