import AsyncStorage from "@react-native-async-storage/async-storage"
import client from "./client"
import { upload_Images } from "./Upload_Images_API"

export const get_All_Hotels = async (
    page = 1,
    size = 20,
    facilities,
    maxPrice,
    minPrice,
    numberOfGuests,
    ratingStars
) => {
    try {
        const formData = new FormData()
        if (facilities && facilities.length > 0)
            formData.append("facilities", facilities.join(", "))
        if (minPrice > 100000) formData.append("minPrice", minPrice)
        if (maxPrice < 4000000) formData.append("maxPrice", maxPrice)
        if (numberOfGuests > 0) formData.append("numberOfGuests", numberOfGuests)
        if (ratingStars > 0) formData.append("ratingStars", ratingStars)
        formData.append("page", page)
        formData.append("size", size)

        const response = await client.post(`getAll/filter-hotel`, formData)
        return response.data
    } catch (error) {
        console.log("Lỗi khi lấy danh sách khách sạn:", error.response?.data)
        throw new Error(error.response?.data?.message || "Lấy danh sách khách sạn thất bại")
    }
}

// export const filter_Hotels = async (
//     facilities,
//     maxPrice,
//     minPrice,
//     numberOfGuests,
//     ratingStars,
//     page = 1,
//     size = 20
// ) => {
//     try {
//         const formData = new FormData()
//         if (facilities && facilities.length > 0)
//             formData.append("facilities", facilities.join(", "))
//         if (minPrice > 100000) formData.append("minPrice", minPrice)
//         if (maxPrice < 4000000) formData.append("maxPrice", maxPrice)
//         if (numberOfGuests > 0) formData.append("numberOfGuests", numberOfGuests)
//         if (ratingStars > 0) formData.append("ratingStars", ratingStars)
//         formData.append("page", page)
//         formData.append("size", size)

//         const response = await fetch(`${root}/getAll/filter-hotel`, {
//             method: "POST",
//             body: formData,
//         })

//         const json = await response.json()

//         if (!response.ok) throw new Error(json.message || "Tìm kiếm khách sạn thất bại")

//         return json
//     } catch (error) {
//         console.error("Lỗi khi tìm kiếm khách sạn:", error)
//         throw error
//     }
// }

export const search_Hotels = async (token, page = 1, size = 20, searchKey) => {
    try {
        const formData = new FormData()
        formData.append("page", page)
        formData.append("size", size)
        formData.append("name", searchKey)

        const response = await client.post("/admin/search-hotel", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        })

        return response.data
    } catch (error) {
        console.log("Tìm kiếm khách sạn thất bại:", error.response?.data)
        throw new Error(error.response?.data?.message || "Tìm kiếm khách sạn thất bại")
    }
}

export const get_Top_5_Hotels = async () => {
    try {
        const response = await client.get("/getAll/top-5-hotels-by-reviews")
        return response.data
    } catch (error) {
        console.log("Lấy danh sách top 5 khách sạn thất bại:", error.response?.data)
        throw new Error(error.response?.data?.message || "Lấy danh sách top 5 khách sạn thất bại")
    }
}

export const get_Hotel_By_Slug = async (slug) => {
    try {
        const response = await client.get(`/getAll/hotel/${slug}`)
        return response.data
    } catch (error) {
        console.log("Lỗi khi lấy khách sạn theo slug:", error.response?.data)
        throw new Error(error.response?.data?.message || "Lấy thông tin khách sạn thất bại")
    }
}

export const get_Hotel_By_ID = async (id) => {
    try {
        const response = await client.get(`/getAll/hotels/${id}`)
        return response.data
    } catch (error) {
        console.log("Lỗi khi lấy khách sạn theo ID:", error.response?.data)
        throw new Error(error.response?.data?.message || "Lấy thông tin khách sạn thất bại")
    }
}

export const get_Nearest_Place_By_HotelID = async (hotelId, maxDistance = 5000) => {
    try {
        const response = await client.get(`/hotels/${hotelId}/nearby-places`, {
            params: { maxDistance },
        })
        return response.data
    } catch (error) {
        console.log("Lỗi khi lấy địa điểm gần khách sạn:", error.response?.data)
        throw new Error(
            error.response?.data?.message || "Lấy danh sách địa điểm gần khách sạn thất bại"
        )
    }
}

export const search_Hotels_By_Filter = async (district, numberOfGuests, maxPrice, page) => {
    try {
        const text = getSearchHotelByFilterParams(district, numberOfGuests, maxPrice, page)
        const response = await client.get(`/hotels/search-by-price-guests-district?${text}`)
        return response.data
    } catch (error) {
        console.log("Lỗi khi tìm kiếm khách sạn:", error.response?.data)
        throw new Error(error.response?.data?.message || "Tìm kiếm khách sạn thất bại")
    }
}

export const search_Hotels_By_Model = async (query, page) => {
    try {
        const token = await AsyncStorage.getItem("token")

        const response = await client.post(
            `/search?page=${page}`,
            { query },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
        return response.data
    } catch (error) {
        console.log("Lỗi khi tìm kiếm khách sạn:", error.response?.data)
        throw new Error(error.response?.data?.message || "Tìm kiếm khách sạn thất bại")
    }
}

export const add_New_Hotel = async (token, hotel, newImages) => {
    try {
        const formData = new FormData()
        if (hotel.name) formData.append("name", hotel.name)
        if (hotel.address) formData.append("address", hotel.address)
        if (hotel.district) formData.append("district", hotel.district)
        if (hotel.description) formData.append("description", hotel.description)
        if (hotel.hotelLink) formData.append("hotelLink", hotel.hotelLink)
        if (hotel.ratingStars > 0) formData.append("ratingStars", hotel.ratingStars)
        if (hotel.facilities.length > 0)
            formData.append("facilities", JSON.stringify(hotel.facilities))
        if (Object.keys(hotel.highlights).length > 0)
            formData.append("highlights", JSON.stringify(hotel.highlights))
        if (Object.keys(hotel?.reviews).length > 0)
            formData.append("reviews", JSON.stringify(hotel.reviews))
        if (newImages.length > 0)
            newImages.forEach((file, index) =>
                formData.append("images", {
                    uri: file.uri,
                    name: file.fileName || `photo_${index}.jpg`,
                    type: file.mimeType || "image/jpeg",
                })
            )
        if (Object.keys(hotel.roomServices).length > 0)
            formData.append("roomServices", JSON.stringify(hotel.roomServices))
        if (hotel.slug) formData.append("slug", hotel.slug)
        if (hotel.longitude) formData.append("longitude", hotel.longitude)
        if (hotel.latitude) formData.append("latitude", hotel.latitude)

        const response = await client.post("/admin/add-hotels", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        })

        return response.data
    } catch (error) {
        console.log("Lỗi khi thêm khách sạn mới:", error.response?.data)
        throw new Error(error.response?.data?.message || "Thêm khách sạn thất bại")
    }
}

export const update_Hotel = async (token, hotelId, newHotel, newImages) => {
    try {
        const images = await upload_Images(newImages)

        const formData = new FormData()
        if (newHotel.name) formData.append("name", newHotel.name)
        if (newHotel.address) formData.append("address", newHotel.address)
        if (newHotel.district) formData.append("district", newHotel.district)
        if (newHotel.description) formData.append("description", newHotel.description)
        if (newHotel.hotelLink) formData.append("hotelLink", newHotel.hotelLink)
        if (newHotel.ratingStars) formData.append("ratingStars", newHotel.ratingStars)
        if (newHotel.facilities) formData.append("facilities", JSON.stringify(newHotel.facilities))
        if (newHotel.highlights) formData.append("highlights", JSON.stringify(newHotel.highlights))
        if (newHotel.reviews) formData.append("reviews", JSON.stringify(newHotel.reviews))
        if (newHotel.imageUrls)
            formData.append("images", JSON.stringify([...newHotel.imageUrls, ...images]))
        if (newHotel.roomServices)
            formData.append("roomServices", JSON.stringify(newHotel.roomServices))
        if (newHotel.slug) formData.append("slug", newHotel.slug)
        if (newHotel.longitude) formData.append("longitude", newHotel.longitude)
        if (newHotel.latitude) formData.append("latitude", newHotel.latitude)

        const response = await client.put(`/admin/update-hotel/${hotelId}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        })

        return response.data
    } catch (error) {
        console.log("Lỗi khi cập nhật khách sạn:", error.response?.data)
        throw new Error(error.response?.data?.message || "Cập nhật khách sạn thất bại")
    }
}

export const delete_Hotels = async (token, hotelIds) => {
    try {
        const formData = new FormData()
        if (hotelIds.length > 0) formData.append("hotelIds", hotelIds.join(","))

        const response = await client.delete("/admin/delete-hotels", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            data: formData, // axios cho phép gửi body trong DELETE qua trường `data`
        })

        return response.data
    } catch (error) {
        console.log("Lỗi khi xoá các khách sạn:", error.response?.data)
        throw new Error(error.response?.data?.message || "Xoá các khách sạn thất bại")
    }
}
