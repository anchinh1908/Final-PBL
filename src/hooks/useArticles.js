import { useEffect, useState } from "react"
import Article_API from "../API/Article_API"

const useArticles = () => {
    const [articlesHook, setArticlesHook] = useState([])
    const [firstArticle, setFirstArticle] = useState({})
    const [fourArticles, setFourArticles] = useState([])
    const [loading, isLoading] = useState(false)

    const filterFirstArticle = (data) => {
        if (data?.length > 0)
            return [...data].sort(
                (a, b) => new Date(b.date_published) - new Date(a.date_published)
            )[0]
        return {}
    }

    const filterFourArticles = (data) => {
        if (data?.length > 0)
            return [...data]
                .sort((a, b) => new Date(b.date_published) - new Date(a.date_published))
                .slice(1, 5)

        return []
    }

    const filterArticles = async () => {
        isLoading(true)
        try {
            const allArticles = await Article_API.get_All_Article()

            setArticlesHook(allArticles)
            setFirstArticle(filterFirstArticle(allArticles))
            setFourArticles(filterFourArticles(allArticles))
        } catch (error) {
            console.log("Failed to fetch articles:", error)
        } finally {
            isLoading(false)
        }
    }

    useEffect(() => {
        filterArticles()
    }, [])

    const getArticlesByDoctor = async (doctorEmail, article_id) => {
        const articleByDoctor = await Article_API.getArticlesByDoctor(doctorEmail)
        const filteredArticles = articleByDoctor.filter((article) => article._id !== article_id)
        return filteredArticles
    }

    const getArticlesBySpecialty = async (specialtyName, sortBy) => {
        const articleBySpecialty = await Article_API.getArticlesBySpecialty(specialtyName)
        if (!articleBySpecialty) return null
        if (!sortBy) return articleBySpecialty
        let filteredArticles
        if (sortBy && sortBy === "A-Z")
            filteredArticles = articleBySpecialty
                .slice()
                .sort((a, b) => a.article_title.localeCompare(b.article_title))
        else if (sortBy && sortBy === "Z-A")
            filteredArticles = articleBySpecialty
                .slice()
                .sort((a, b) => b.article_title.localeCompare(a.article_title))
        return filteredArticles
    }

    return [
        articlesHook,
        firstArticle,
        fourArticles,
        loading,
        getArticlesBySpecialty,
        getArticlesByDoctor,
        filterArticles,
    ]
}

export default useArticles
