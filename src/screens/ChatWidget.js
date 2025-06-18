// import React, { useState, useEffect, useRef } from "react"
// import {
//     View,
//     Text,
//     TextInput,
//     ScrollView,
//     Pressable,
//     KeyboardAvoidingView,
//     Platform,
//     Image,
// } from "react-native"
// import { Ionicons } from "@expo/vector-icons"
// import { getSessionId } from "../utils/sessionHelper"
// import { PUBLIC_N8N_URL } from "@env"
// import { COLORS, images } from "../constants"
// import AsyncStorage from "@react-native-async-storage/async-storage"

// const ChatWidget = ({ navigation }) => {
//     const [messages, setMessages] = useState([
//         {
//             role: "assistant",
//             content:
//                 "Chào bạn! Tôi là trợ lý y tế của DNTrip: Giúp bạn trả lời các vấn đề về khách sạn và lịch trình du lịch.",
//         },
//     ])
//     const [userInput, setUserInput] = useState("")
//     const [loading, setLoading] = useState(false)
//     const [sessionId, setSessionId] = useState(null)
//     const scrollViewRef = useRef()

//     useEffect(() => {
//         const setupSession = async () => {
//             const sessionId = await getSessionId()
//             setSessionId(sessionId)
//         }
//         setupSession()
//     }, [])

//     const n8n_url = PUBLIC_N8N_URL || "https://your-n8n-url.com"

//     const sendMessage = async () => {
//         if (!userInput.trim() || loading) return

//         const newMessages = [...messages, { role: "user", content: userInput.trim() }]
//         console.log(n8n_url)

//         setMessages(newMessages)
//         setUserInput("")
//         setLoading(true)

//         try {
//             const token = await AsyncStorage.getItem("token")
//             const response = await fetch(n8n_url, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({
//                     sessionId,
//                     message: userInput.trim(),
//                     chat_history: messages,
//                     token,
//                 }),
//             })

//             const data = await response.json()
//             const reply = data?.response || "Xin lỗi, tôi không thể trả lời lúc này."

//             setMessages((prev) => [...prev, { role: "assistant", content: reply }])
//         } catch (error) {
//             setMessages((prev) => [
//                 ...prev,
//                 { role: "assistant", content: `Lỗi: ${error.message}` },
//             ])
//         } finally {
//             setLoading(false)
//         }
//     }

//     useEffect(() => {
//         scrollViewRef.current?.scrollToEnd({ animated: true })
//     }, [messages])

//     return (
//         <KeyboardAvoidingView
//             behavior={Platform.OS === "ios" ? "padding" : undefined}
//             style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
//             <View
//                 style={{
//                     padding: 16,
//                     paddingTop: 40,
//                     backgroundColor: COLORS.coralBlaze,
//                     flexDirection: "row",
//                     alignItems: "center",
//                 }}>
//                 <Ionicons
//                     name="arrow-back"
//                     size={28}
//                     color="white"
//                     onPress={() => navigation.goBack()}
//                 />
//                 <Image
//                     source={images.logo}
//                     style={{ width: 32, height: 32, borderRadius: 16, marginLeft: 12 }}
//                 />
//                 <Text style={{ color: "white", marginLeft: 8, fontWeight: "bold", fontSize: 16 }}>
//                     Trợ lý ảo DNTrip
//                 </Text>
//             </View>

//             <ScrollView
//                 ref={scrollViewRef}
//                 contentContainerStyle={{ padding: 16 }}
//                 style={{ flex: 1 }}>
//                 {messages.map((msg, index) => (
//                     <View
//                         key={index}
//                         style={{
//                             alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
//                             backgroundColor: msg.role === "user" ? COLORS.coralBlaze : "#fff",
//                             padding: 10,
//                             borderRadius: 12,
//                             marginVertical: 4,
//                             maxWidth: "80%",
//                         }}>
//                         <Text style={{ color: msg.role === "user" ? "#fff" : "#333" }}>
//                             {msg.content}
//                         </Text>
//                     </View>
//                 ))}
//                 {loading && <Text style={{ marginTop: 8 }}>Đang trả lời...</Text>}
//             </ScrollView>

//             <View
//                 style={{
//                     flexDirection: "row",
//                     padding: 12,
//                     borderTopWidth: 1,
//                     borderColor: "#ccc",
//                 }}>
//                 <TextInput
//                     style={{
//                         flex: 1,
//                         backgroundColor: "#fff",
//                         borderRadius: 20,
//                         paddingHorizontal: 16,
//                         paddingVertical: 8,
//                     }}
//                     placeholder="Nhập tin nhắn..."
//                     value={userInput}
//                     onChangeText={setUserInput}
//                     onSubmitEditing={sendMessage}
//                 />
//                 <Pressable
//                     onPress={sendMessage}
//                     style={{
//                         backgroundColor: COLORS.coralBlaze,
//                         borderRadius: 24,
//                         width: 44,
//                         height: 44,
//                         marginLeft: 8,
//                         justifyContent: "center",
//                         alignItems: "center",
//                     }}>
//                     <Ionicons name="send" size={20} color="#fff" />
//                 </Pressable>
//             </View>
//         </KeyboardAvoidingView>
//     )
// }

// export default ChatWidget

import React, { useState, useEffect, useRef } from "react"
import {
    View,
    Text,
    TextInput,
    ScrollView,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    Image,
    StyleSheet,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { getSessionId } from "../utils/sessionHelper"
import { PUBLIC_N8N_URL, OPENAI_API_KEY } from "@env"
import { COLORS, images } from "../constants"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as FileSystem from "expo-file-system"
import { Audio } from "expo-av"
import AntDesign from "@expo/vector-icons/AntDesign"
import Waveform from "../components/Waveform"

const ChatWidget = ({ navigation }) => {
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content:
                "Chào bạn! Tôi là trợ lý của DNTrip: Giúp bạn trả lời các vấn đề về khách sạn và lịch trình du lịch.",
        },
    ])
    const [userInput, setUserInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [sessionId, setSessionId] = useState(null)
    const scrollViewRef = useRef()

    const [recording, setRecording] = useState(null)
    const [isRecording, setIsRecording] = useState(false)
    const [isSpeechToText, setIsSpeechToText] = useState(false)

    useEffect(() => {
        const setupSession = async () => {
            const sessionId = await getSessionId()
            setSessionId(sessionId)
        }
        setupSession()
    }, [])

    const sendMessage = async () => {
        if (!userInput.trim() || loading) return

        const newMessages = [
            ...messages,
            { role: "user", content: userInput.trim() },
        ]
        setMessages(newMessages)
        setUserInput("")
        setLoading(true)

        const token = (await AsyncStorage.getItem("token")) || ""

        try {
            console.log(PUBLIC_N8N_URL)

            const response = await fetch(PUBLIC_N8N_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId,
                    message: userInput.trim(),
                    chat_history: messages,
                    token,
                }),
            })

            const data = await response.json()

            const reply =
                data?.response || "Xin lỗi, tôi không thể trả lời lúc này."
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: reply },
            ])
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: `Lỗi: ${error.message}` },
            ])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true })
    }, [messages])

    const startRecording = async () => {
        try {
            const permission = await Audio.requestPermissionsAsync()
            if (!permission.granted) return alert("Bạn cần cấp quyền ghi âm!")

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            })

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            )

            setRecording(recording)
            setIsRecording(true)
            setIsSpeechToText(true)
        } catch (err) {
            console.log("Failed to start recording", err)
        }
    }

    const stopRecording = async () => {
        try {
            setIsRecording(false)
            await recording.stopAndUnloadAsync()
            const uri = recording.getURI()
            setRecording(null)

            // Gửi tới OpenAI Whisper
            const result = await transcribeWithOpenAI(uri)
            if (result?.text) {
                setUserInput(result.text)
            }
        } catch (err) {
            console.log("Failed to stop recording", err)
        } finally {
            setIsSpeechToText(false)
        }
    }

    const transcribeWithOpenAI = async (uri) => {
        const fileInfo = await FileSystem.getInfoAsync(uri)
        const formData = new FormData()
        formData.append("file", {
            uri,
            name: "voice.m4a",
            type: "audio/m4a",
        })
        formData.append("model", "whisper-1")

        try {
            const response = await fetch(
                "https://api.openai.com/v1/audio/transcriptions",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${OPENAI_API_KEY}`,
                        "Content-Type": "multipart/form-data",
                    },
                    body: formData,
                }
            )

            const data = await response.json()

            return data // chứa { text: "..." }
        } catch (error) {
            console.log("Whisper API error", error)
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.container}
        >
            <View style={styles.header}>
                <Ionicons
                    name="arrow-back"
                    size={28}
                    color="white"
                    onPress={() => navigation.goBack()}
                />
                <Image source={images.logo} style={styles.logo} />
                <Text style={styles.headerTitle}>Trợ lý ảo DNTrip</Text>
            </View>

            <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={styles.scrollContent}
                style={styles.scroll}
            >
                {messages.map((msg, index) => (
                    <View
                        key={index}
                        style={[
                            styles.messageContainer,
                            msg.role === "user"
                                ? styles.userMessage
                                : styles.assistantMessage,
                        ]}
                    >
                        <Text
                            style={[
                                styles.messageText,
                                msg.role === "user"
                                    ? styles.userText
                                    : styles.assistantText,
                            ]}
                        >
                            {msg.content}
                        </Text>
                    </View>
                ))}
                {loading && (
                    <Text style={styles.loadingText}>Đang trả lời...</Text>
                )}
            </ScrollView>

            <View style={styles.inputContainer}>
                {!isSpeechToText && (
                    <TextInput
                        style={styles.input}
                        placeholder="Nhập tin nhắn..."
                        value={userInput}
                        onChangeText={setUserInput}
                    />
                )}
                {isSpeechToText && <Waveform />}
                <Pressable
                    onPress={isRecording ? stopRecording : startRecording}
                    style={{
                        backgroundColor: isRecording
                            ? "#888"
                            : COLORS.slateGray,
                        borderRadius: 24,
                        width: 38,
                        height: 38,
                        marginLeft: 8,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Ionicons
                        name={isRecording ? "stop" : "mic"}
                        size={20}
                        color="#fff"
                    />
                </Pressable>
                <Pressable onPress={sendMessage} style={styles.sendButton}>
                    <AntDesign name="arrowup" size={24} color="white" />
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f3f4f6",
    },
    header: {
        padding: 16,
        paddingTop: 40,
        backgroundColor: COLORS.coralBlaze,
        flexDirection: "row",
        alignItems: "center",
    },
    logo: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginLeft: 12,
    },
    headerTitle: {
        color: "white",
        marginLeft: 8,
        fontWeight: "bold",
        fontSize: 16,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    messageContainer: {
        padding: 10,
        borderRadius: 12,
        marginVertical: 4,
        maxWidth: "80%",
    },
    userMessage: {
        alignSelf: "flex-end",
        backgroundColor: COLORS.coralBlaze,
    },
    assistantMessage: {
        alignSelf: "flex-start",
        backgroundColor: "#fff",
    },
    messageText: {
        fontSize: 14,
    },
    userText: {
        color: "#fff",
    },
    assistantText: {
        color: "#333",
    },
    loadingText: {
        marginTop: 8,
    },
    inputContainer: {
        flexDirection: "row",
        padding: 12,
        borderTopWidth: 1,
        borderColor: "#ccc",
        backgroundColor: "#fff",
    },
    input: {
        flex: 1,
        backgroundColor: COLORS.silverMist,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        height: 38,
    },
    sendButton: {
        backgroundColor: COLORS.deepBlack,
        borderRadius: 24,
        width: 38,
        height: 38,
        marginLeft: 8,
        justifyContent: "center",
        alignItems: "center",
    },
})

export default ChatWidget
