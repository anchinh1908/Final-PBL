import AsyncStorage from "@react-native-async-storage/async-storage"

export const transformUrlsToData = (urls) => {
    return urls.map((url, index) => ({
        id: (index + 1).toString(),
        uri: url,
    }))
}

export const calculateAverageReviewScore = (reviews) => {
    const values = Object.values(reviews)
    if (values.length === 0) return 0

    const total = values.reduce((sum, score) => sum + score, 0)
    return (total / values.length).toFixed(1)
}

export const getRatingText = (reviewsAvr) => {
    if (reviewsAvr > 9) return "Tuyệt vời"
    if (reviewsAvr > 8) return "Rất tốt"
    if (reviewsAvr > 7) return "Tốt"
    return "Dễ chịu"
}

export const splitParagraphBySentence = (paragraph) => {
    return paragraph
        .split(/(?<=[.!?])\s+/)
        .map((sentence) => sentence.trim())
        .filter(Boolean)
}

export const isDiscounted = (originalPrice, price) => {
    return originalPrice - price > 0
}

export const addViewedHotel = async (hotelId) => {
    try {
        const historyJson = await AsyncStorage.getItem("viewed_hotels")
        const history = historyJson ? JSON.parse(historyJson) : []

        // Đảm bảo hotelId không bị lặp
        const newHistory = [hotelId, ...history.filter((h) => h !== hotelId)]

        await AsyncStorage.setItem("viewed_hotels", JSON.stringify(newHistory))
    } catch (error) {
        console.log("Lỗi khi lưu lịch sử khách sạn đã xem:", error)
    }
}
