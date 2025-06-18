import { useState, useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import logo from "~/assets/loopy1.jpg"
import ChatIcon from "@mui/icons-material/Chat"
import SendRoundedIcon from "@mui/icons-material/SendRounded"
import { getSessionId } from "~/utils/sessionHelper"

const n8n_url = import.meta.env.VITE_N8N_URL

const ChatWidget = () => {
    const [expanded, setExpanded] = useState(false)
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content:
                "Chào bạn! Tôi là trợ lý của DNTrip: Giúp bạn trả lời các vấn đề về khách sạn và lịch trình du lịch.",
        },
    ])
    const [userInput, setUserInput] = useState("")
    const [loading, setLoading] = useState(false)
    const chatHistoryRef = useRef(null)
    const chatInputRef = useRef(null)

    // ✅ Tạo sessionId cố định cho user
    const sessionId = getSessionId()

    const toggleChat = () => {
        setExpanded(!expanded)
        setTimeout(() => {
            if (!expanded && chatInputRef.current) {
                chatInputRef.current.focus()
            }
        }, 100)
    }

    const scrollToBottom = () => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight
        }
    }

    const sendMessage = async () => {
        if (!userInput.trim() || loading) return

        const newMessages = [...messages, { role: "user", content: userInput.trim() }]
        setMessages(newMessages)
        setUserInput("")
        setLoading(true)

        try {
            const token = localStorage.getItem("token") || ""
            const response = await fetch(n8n_url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    sessionId: sessionId,
                    message: userInput.trim(),
                    chat_history: messages,
                    token: token,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Webhook Error")
            }

            const data = await response.json()

            if (data.response) {
                setMessages((prev) => [...prev, { role: "assistant", content: data.response }])
            } else {
                throw new Error("Invalid response format from webhook.")
            }
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: `Xin lỗi, tôi không thể trả lời lúc này. Lỗi: ${error.message}`,
                },
            ])
        } finally {
            setLoading(false)
            setTimeout(scrollToBottom, 100)
        }
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    return (
        <div className="fixed bottom-5 right-5 z-50">
            {!expanded ? (
                <div
                    className="w-14 h-14 bg-gradient-to-r from-coralBlaze to-sunsetOrange rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition"
                    onClick={toggleChat}>
                    <ChatIcon className="text-pureWhite size-7" />
                </div>
            ) : (
                <div className="w-96 h-[550px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                    <header className="p-5 bg-gradient-to-r from-coralBlaze to-sunsetOrange text-white flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <img
                                src={logo}
                                alt="Logo"
                                className="w-9 h-9 rounded-full border-2 border-white/30"
                            />
                            <span className="text-lg font-semibold">Trợ lý ảo DNTrip</span>
                        </div>
                        <button
                            onClick={toggleChat}
                            className="text-white text-3xl hover:opacity-100 opacity-80">
                            ×
                        </button>
                    </header>

                    <div ref={chatHistoryRef} className="flex-1 p-5 overflow-y-auto bg-gray-100">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`mb-4 flex flex-col ${
                                    message.role === "user" ? "items-end" : "items-start"
                                }`}>
                                <div
                                    className={`max-w-[85%] px-4 py-3 rounded-xl shadow text-sm leading-relaxed text-justify ${
                                        message.role === "user"
                                            ? "bg-gradient-to-r from-coralBlaze to-sunsetOrange text-white rounded-br-sm"
                                            : "bg-white text-gray-800 rounded-bl-sm"
                                    }`}>
                                    {/* {message.content} */}
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {message.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="mb-4 flex items-center gap-1 animate-pulse">
                                <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                                <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                                <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                            </div>
                        )}
                    </div>

                    <div className="p-5 border-t flex gap-3 bg-white">
                        <input
                            ref={chatInputRef}
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                            placeholder="Nhập tin nhắn..."
                            disabled={loading}
                            className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-full outline-none focus:border-indigo-500 text-sm"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={loading || !userInput.trim()}
                            className="w-11 h-11 bg-gradient-to-r from-coralBlaze to-sunsetOrange text-white rounded-full flex items-center justify-center disabled:bg-gray-200">
                            <SendRoundedIcon className="text-pureWhite pl-" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ChatWidget
