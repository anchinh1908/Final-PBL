export const getSessionId = () => {
    let sessionId = localStorage.getItem("chat_session_id")
    if (!sessionId) {
        sessionId = crypto.randomUUID() // Hoặc dùng Date.now().toString()
        localStorage.setItem("chat_session_id", sessionId)
    }
    return sessionId
}
