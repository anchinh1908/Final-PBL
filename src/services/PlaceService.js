const root = import.meta.env.VITE_API_URL

export const get_All_Places = async (page = 1, size = 20) => {
    try {
        const response = await fetch(`${root}/getAll/places?page=${page}&size=${size}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
        const json = await response.json()

        if (!response.ok) throw new Error(json.message || "Lấy danh sách địa điểm thất bại")

        return json
    } catch (error) {
        console.error("Lỗi khi lấy danh sách địa điểm:", error)
        throw error
    }
}

export const search_Places = async (token, page = 1, size = 20, searchKey) => {
    try {
        const formData = new FormData()
        formData.append("page", page)
        formData.append("size", size)
        formData.append("title", searchKey)

        const response = await fetch(`${root}/admin/search-place`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        })

        const json = await response.json()

        if (!response.ok) throw new Error(json.message || "Tìm kiếm địa điểm thất bại")

        return json
    } catch (error) {
        console.error("Lỗi khi tìm kiếm địa điểm:", error)
        throw error
    }
}

export const search_Places_By_District = async (district) => {
    try {
        const response = await fetch(
            `${root}/getAll/filter-by-district?district=${encodeURIComponent(
                district
            )}&page=1&size=100`,
            {
                method: "GET",
            }
        )

        const json = await response.json()

        if (!response.ok) throw new Error(json.message || "Tìm kiếm địa điểm thất bại")

        return json
    } catch (error) {
        console.error("Lỗi khi tìm kiếm địa điểm:", error)
        throw error
    }
}

export const get_Place_By_Slug = async (slug) => {
    try {
        const response = await fetch(`${root}/getAll/place/${slug}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
        const json = await response.json()

        if (!response.ok) throw new Error(json.message || "Lấy địa điểm thất bại")

        return json
    } catch (error) {
        console.error("Lấy địa điểm thất bại:", error)
        throw error
    }
}

export const get_Nearest_Hotel_By_PlaceID = async (placeid, maxDistance = 5000) => {
    try {
        const response = await fetch(
            `${root}/hotels/${placeid}/nearby-hotels?maxDistance=${maxDistance}`,
            {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            }
        )
        const json = await response.json()

        if (!response.ok) throw new Error(json.message || "Lấy khách sạn gần nhất thất bại")

        return json
    } catch (error) {
        console.error("Lấy khách sạn gần nhất theo placeId thất bại:", error)
        throw error
    }
}

export const add_New_Place = async (token, place) => {
    try {
        console.log(place)

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

        const response = await fetch(`${root}/admin/add-place`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        })

        const json = await response.json()

        if (!response.ok) throw new Error(json.message || "Thêm địa điểm thất bại")

        return json
    } catch (error) {
        console.error("Lỗi khi thêm địa điểm mới:", error)
        throw error
    }
}

const upload_Place_Image = async (file) => {
    try {
        if (typeof file === "object") {
            const formData = new FormData()
            formData.append("images", file)

            const response = await fetch(
                "https://final-pbl-flaskapi.onrender.com/upload-multiple",
                {
                    method: "POST",
                    body: formData,
                }
            )
            const json = await response.json()

            if (!response.ok) throw new Error(json.error || "Upload ảnh khách sạn thất bại!")
            return json.data[0]
        }
        return file
    } catch (error) {
        console.error("Lỗi khi upload ảnh khách sạn:", error)
        throw error
    }
}

export const update_Place = async (token, placeId, newPlace) => {
    try {
        const image = await upload_Place_Image(newPlace.imageUrl)

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

        const response = await fetch(`${root}/admin/update-place/${placeId}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        })

        const json = await response.json()

        if (!response.ok) throw new Error(json.message || "Cập nhật địa điểm thất bại")

        return json
    } catch (error) {
        console.error("Lỗi khi cập nhật địa điểm:", error)
        throw error
    }
}

export const delete_Places = async (token, placeIds) => {
    try {
        const formData = new FormData()
        if (placeIds.length > 0) formData.append("placeIds", placeIds.join(","))

        const response = await fetch(`${root}/admin/delete-places`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        })

        const json = await response.json()

        if (!response.ok) throw new Error(json.message || "Xoá các địa điểm thất bại")

        return json
    } catch (error) {
        console.error("Lỗi khi xoá các địa điểm:", error)
        throw error
    }
}

export const get_Top_5_Places = async () => {
    try {
        const response = await fetch(`${root}/getAll/top-5-places-by-ratings`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
        const json = await response.json()

        if (!response.ok) throw new Error(json.message || "Lấy danh sách top 5 địa điểm thất bại")

        return json
    } catch (error) {
        console.error("Lấy danh sách top 5 địa điểm thất bại:", error)
        throw error
    }
}
