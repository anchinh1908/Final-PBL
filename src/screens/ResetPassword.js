import { useNavigation, useRoute } from "@react-navigation/native"
import { useState } from "react"
import { resetPassword } from "../API/Account_API"
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import Loading from "../components/Loading"
import { COLORS } from "../constants"
import { HeaderBack, InputPassword } from "../components"

const ResetPassword = () => {
    const navigation = useNavigation()
    const route = useRoute()
    const { email } = route.params || {}

    const [otp, setOtp] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!otp.trim()) {
            setMessage("Vui lòng nhập mã OTP.")
            return
        }

        if (password !== confirmPassword) {
            setMessage("Mật khẩu không khớp!")
            return
        }

        setLoading(true)
        setMessage("")

        try {
            const result = await resetPassword(email, otp, password)
            if (result) {
                Alert.alert("Thành công", "Đổi mật khẩu thành công. Vui lòng đăng nhập!", [
                    {
                        text: "OK",
                        onPress: () => navigation.navigate("Login"),
                    },
                ])
            }
        } catch (error) {
            setMessage(error.message || "Đổi mật khẩu thất bại. Vui lòng thử lại.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.baseBackground, paddingTop: 16 }}>
            <View style={{ paddingHorizontal: 16 }}>
                <HeaderBack navigation={navigation} />
            </View>
            <View style={styles.container}>
                <View style={styles.card}>
                    <Text style={styles.title}>Đặt lại mật khẩu</Text>
                    <Text style={styles.subtitle}>
                        Nhập mã OTP và mật khẩu mới để khôi phục tài khoản của bạn.
                    </Text>

                    {message ? <Text style={styles.error}>{message}</Text> : null}

                    <Text style={styles.label}>Mã OTP</Text>
                    <TextInput
                        style={styles.input}
                        value={otp}
                        onChangeText={setOtp}
                        placeholder="Nhập mã OTP"
                    />

                    <Text style={styles.label}>Mật khẩu mới</Text>
                    <InputPassword value={password} onChangeText={setPassword} />

                    <Text style={styles.label}>Xác nhận mật khẩu</Text>
                    <InputPassword value={confirmPassword} onChangeText={setConfirmPassword} />

                    <TouchableOpacity
                        style={[styles.button, loading && { backgroundColor: "#ccc" }]}
                        onPress={handleSubmit}
                        disabled={loading}>
                        <Text style={styles.buttonText}>Đặt lại mật khẩu</Text>
                    </TouchableOpacity>

                    {loading && <Loading />}
                </View>
            </View>
        </View>
    )
}

export default ResetPassword

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "#f9fafb",
        paddingHorizontal: 20,
    },
    card: {
        backgroundColor: COLORS.pureWhite,
        borderRadius: 10,
        padding: 20,
        elevation: 3,
        marginBottom: 40,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 6,
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
        marginBottom: 6,
        marginTop: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 999,
        padding: 10,
    },
    button: {
        marginTop: 20,
        backgroundColor: COLORS.oceanSlate || "#2196f3",
        paddingVertical: 10,
        borderRadius: 999,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "600",
    },
    error: {
        color: "red",
        marginBottom: 10,
    },
})
