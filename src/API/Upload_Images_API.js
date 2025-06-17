import axios from "axios"
import { UPLOAD_API_URL } from "@env"

export const upload_Images = async (files) => {
    try {
        if (files.length === 0) return []

        const formData = new FormData()
        files.forEach((file, index) =>
            formData.append("images", {
                uri: file.uri,
                name: file.fileName || `photo_${index}.jpg`,
                type: file.mimeType || "image/jpeg",
            })
        )

        const response = await axios.post(UPLOAD_API_URL, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })

        return response.data.data
    } catch (error) {
        console.log("Lỗi khi upload ảnh:", error)
        throw new Error(error.response?.data?.error || "Upload ảnh thất bại!")
    }
}
