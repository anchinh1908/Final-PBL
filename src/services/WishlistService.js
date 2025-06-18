const root = import.meta.env.VITE_API_URL

export const add_My_Wishlist = async (token, hotelId) => {
    try {
        const response = await fetch(`${root}/user/wishlist/${hotelId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        })
        const json = await response.json()

        if (!response.ok) throw new Error(json.message || "Thêm vào danh sách yêu thích thất bại")

        return json
    } catch (error) {
        console.error("Lỗi khi thêm vào danh sách yêu thích:", error)
        throw error
    }
}

export const delete_My_Wishlist = async (token, hotelId) => {
    try {
        const response = await fetch(`${root}/user/wishlist/${hotelId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        })
        const json = await response.json()

        if (!response.ok) throw new Error(json.message || "Xóa khỏi danh sách yêu thích thất bại")

        return json
    } catch (error) {
        console.error("Lỗi khi xóa khỏi danh sách yêu thích:", error)
        throw error
    }
}

export const get_My_Wishlist = async (token, page = 1, size = 10) => {
    try {
        const response = await fetch(`${root}/user/wishlist?page=${page}&size=${size}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        })
        const json = await response.json()

        if (!response.ok) throw new Error(json.message || "Lấy danh sách yêu thích thất bại")

        return json
    } catch (error) {
        console.error("Lỗi khi lấy danh sách yêu thích:", error)
        throw error
    }
}
