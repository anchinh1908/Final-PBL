import client from "./client"
import { upload_Images } from "./Upload_Images_API"

export const get_All_Places = async (page = 1, size = 20) => {
    try {
        const response = await client.get(`/getAll/places`, {
            params: { page, size },
        })
        return response.data
    } catch (error) {
        console.log("Lỗi khi lấy danh sách địa điểm:", error.response?.data)
        throw new Error(error.response?.data?.message || "Lấy thông tin địa điểm thất bại")
    }
}

export const search_Places = async (token, page = 1, size = 20, searchKey) => {
    try {
        // Với axios, để gửi FormData thì không cần thiết phải set content-type vì axios tự xử lý
        const formData = new FormData()
        formData.append("page", page)
        formData.append("size", size)
        formData.append("title", searchKey)

        const response = await client.post(`/admin/search-place`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        return response.data
    } catch (error) {
        console.log("Lỗi khi tìm kiếm địa điểm:", error.response?.data)
        throw new Error(error.response?.data?.message || "Tìm kiếm địa điểm thất bại")
    }
}

export const get_Place_By_Slug = async (slug) => {
    try {
        const response = await client.get(`/getAll/place/${slug}`)
        return response.data
    } catch (error) {
        console.log("Lấy địa điểm thất bại:", error.response?.data)
        throw new Error(error.response?.data?.message || "Lấy thông tin địa điểm thất bại")
    }
}

export const get_Nearest_Hotel_By_PlaceID = async (placeid, maxDistance = 5000) => {
    try {
        const response = await client.get(`/hotels/${placeid}/nearby-hotels`, {
            params: { maxDistance },
        })
        return response.data
    } catch (error) {
        console.log("Lấy khách sạn gần nhất theo placeId thất bại:", error.response?.data)
        throw new Error(
            error.response?.data?.message || "Lấy danh sách khách sạn gần địa điểm thất bại"
        )
    }
}

export const add_New_Place = async (token, place) => {
    try {
        const formData = new FormData()
        if (place.title) formData.append("title", place.title)
        if (place.address) formData.append("address", place.address)
        if (place.rating) formData.append("rating", place.rating)
        if (place.review) formData.append("review", place.review)
        if (place.slug) formData.append("slug", place.slug)
        if (place.latitude) formData.append("latitude", place.latitude)
        if (place.longitude) formData.append("longitude", place.longitude)
        if (place.description) formData.append("description", place.description)
        if (place.services) formData.append("services", JSON.stringify(place.services))
        if (place.imageUrl) formData.append("images", place.imageUrl)

        const response = await client.post("/admin/add-place", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                // 'Content-Type' để axios tự set đúng cho FormData
            },
        })

        return response.data
    } catch (error) {
        console.log("Lỗi khi thêm địa điểm mới:", error.response?.data)
        throw new Error(error.response?.data?.message || "Thêm địa điểm mới thất bại")
    }
}

export const update_Place = async (token, placeId, newPlace) => {
    try {
        let image = ""
        if (typeof newPlace.imageUrl === "object") {
            const res = await upload_Images([newPlace.imageUrl])
            if (res.length > 0) image = res[0]
        } else image = newPlace.imageUrl

        const formData = new FormData()
        if (newPlace.title) formData.append("title", newPlace.title)
        if (newPlace.address) formData.append("address", newPlace.address)
        if (newPlace.rating) formData.append("rating", newPlace.rating)
        if (newPlace.review) formData.append("review", newPlace.review)
        if (newPlace.slug) formData.append("slug", newPlace.slug)
        if (newPlace.latitude) formData.append("latitude", newPlace.latitude)
        if (newPlace.longitude) formData.append("longitude", newPlace.longitude)
        if (newPlace.description) formData.append("description", newPlace.description)
        if (newPlace.services) formData.append("services", JSON.stringify(newPlace.services))
        formData.append("images", image)

        const response = await client.put(`/admin/update-place/${placeId}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        return response.data
    } catch (error) {
        console.log("Lỗi khi cập nhật địa điểm:", error.response?.data)
        throw new Error(error.response?.data?.message || "Cập nhật địa điểm thất bại")
    }
}

export const delete_Places = async (token, placeIds) => {
    try {
        const formData = new FormData()
        if (placeIds.length > 0) formData.append("placeIds", placeIds.join(","))

        const response = await client.delete("/admin/delete-places", {
            headers: {
                Authorization: `Bearer ${token}`,
                // 'Content-Type' tự động bởi axios khi dùng FormData
            },
            data: formData, // axios dùng 'data' để gửi body cho DELETE request
        })

        return response.data
    } catch (error) {
        console.log("Lỗi khi xoá các địa điểm:", error.response?.data)
        throw new Error(error.response?.data?.message || "Xoá các địa điểm thất bại")
    }
}

export const search_Places_By_District = async (district) => {
    try {
        const response = await client.get(
            `/getAll/filter-by-district?district=${encodeURIComponent(district)}&page=1&size=100`
        )

        return response.data
    } catch (error) {
        console.error("Lỗi khi tìm kiếm địa điểm:", error.response?.data)
        throw new Error(error.response?.data?.message || "Fetch địa điểm thất bại.")
    }
}
