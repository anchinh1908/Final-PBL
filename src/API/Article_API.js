import client from "./client"

const get_All_Article = async () => {
    try {
        const res = await client.post("/article/get-all-article", {
            hidden_state: "false",
        })

        return res.data
    } catch (error) {
        if (error.response) console.log("Error get articles: ", error.response.data.error)
        else console.log("Error get articles: ", error.message)

        return null
    }
}

const add_Article = async (email, title, content, image) => {
    try {
        const data = new FormData()
        data.append("email", email)
        data.append("article_title", title)
        data.append("article_content", content)
        if (image?.uri)
            data.append("article_image", {
                uri: image.uri,
                type: image.mimeType || "image/jpeg",
                name: image.fileName || "anh.jpg",
            })

        const res = await client.post("/article/create-article", data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })

        return res.data
    } catch (error) {
        if (error.response) console.log("Error add article: ", error.response.data.error)
        else console.log("Error 1 add article: ", error.message)

        return null
    }
}

const update_Article = async (id, title, content, image) => {
    try {
        const data = new FormData()
        data.append("article_title", title)
        data.append("article_content", content)
        if (image?.uri)
            data.append("article_image", {
                uri: image.uri,
                type: image.mimeType || "image/jpeg",
                name: image.fileName || "anh.jpg",
            })

        const res = await client.post(`/article/update-article/${id}`, data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })

        return res.data
    } catch (error) {
        if (error.response) console.log("Error update article: ", error.response.data.error)
        else console.log("Error update article: ", error.message)

        return null
    }
}

const getArticlesByDoctor = async (doctorEmail) => {
    try {
        const res = await client.post("/article/get-all-article-by-doctor", {
            email: doctorEmail,
        })

        const data = res.data.filter((item) => !item.is_deleted)

        return data
    } catch (error) {
        if (error.response) console.log("Error getArticlesByDoctor: ", error.response.data.error)
        else console.log("Error getArticlesByDoctor: ", error.message)
        return null
    }
}

const get_Deleted_Article_By_Doctor = async (doctorEmail) => {
    try {
        const res = await client.post("/article/get-all-article-by-doctor", {
            email: doctorEmail,
        })

        const data = res.data.filter((item) => item.is_deleted)

        return data
    } catch (error) {
        if (error.response)
            console.log("Error get_Deleted_Article_By_Doctor: ", error.response.data.error)
        else console.log("Error get_Deleted_Article_By_Doctor: ", error.message)
        return null
    }
}

const getArticlesBySpecialty = async (specialtyName) => {
    try {
        const res = await client.post("/article/get-all-article-by-speciality", {
            speciality_name: specialtyName,
        })

        return res.data
    } catch (error) {
        if (error.response) console.log("Error getArticlesBySpecialty: ", error.response.data.error)
        else console.log("Error getArticlesBySpecialty: ", error.message)
        return null
    }
}

const search_Article = async (search_query) => {
    try {
        const res = await client.post("/article/search-article", {
            search_query: search_query,
        })
        const data = res.data.filter((item) => !item.is_deleted)
        if (data && Array.isArray(data)) {
            const sort = data
                .slice()
                .sort((a, b) => new Date(b.date_published) - new Date(a.date_published))
            return sort
        }
        return data
    } catch (error) {
        if (error.response) console.log("Error search_Article: ", error.response.data.error)
        else console.log("Error search_Article: ", error.message)
        return null
    }
}

const soft_Delete_Article = async (id) => {
    try {
        const res = await client.post("/article/soft-del-article", {
            article_ids: [id],
        })

        return res.data
    } catch (error) {
        if (error.response) console.log("Error soft_Delete_Article: ", error.response.data.error)
        else console.log("Error soft_Delete_Article: ", error.message)
        return null
    }
}

const perma_Delete_Article = async (ids) => {
    try {
        const res = await client.post("/article/perma-del-article", {
            article_Ids: ids,
        })

        return res.data
    } catch (error) {
        if (error.response) console.log("Error perma_Delete_Article: ", error.response.data.error)
        else console.log("Error perma_Delete_Article: ", error.message)
        return null
    }
}

const restore_Article = async (ids) => {
    try {
        const res = await client.post("/article/restore-article", {
            article_ids: ids,
        })

        return res.data
    } catch (error) {
        if (error.response) console.log("Error restore_Article: ", error.response.data.error)
        else console.log("Error restore_Article: ", error.message)
        return null
    }
}

export default {
    get_All_Article,
    getArticlesByDoctor,
    getArticlesBySpecialty,
    search_Article,
    add_Article,
    update_Article,
    get_Deleted_Article_By_Doctor,
    soft_Delete_Article,
    perma_Delete_Article,
    restore_Article,
}
