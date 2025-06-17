import AsyncStorage from "@react-native-async-storage/async-storage"

export const getSessionId = async () => {
    try {
        let sessionId = await AsyncStorage.getItem("chat_session_id")

        if (!sessionId) {
            // Tạo ID ngẫu nhiên đơn giản
            sessionId = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`
            await AsyncStorage.setItem("chat_session_id", sessionId)
        }

        return sessionId
    } catch (error) {
        console.log("Lỗi khi lấy sessionId:", error)
        return null
    }
}
