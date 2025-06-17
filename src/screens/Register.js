import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"
import { COLORS } from "../constants"
import { useState } from "react"
import { InputPassword } from "../components"
import Entypo from "@expo/vector-icons/Entypo"
import { AntDesign, FontAwesome } from "@expo/vector-icons"
import Loading from "../components/Loading"
import { useSignup } from "../hooks/useSignup"
import { sendOTP } from "../API/Account_API"

const Register = ({ navigation }) => {
    const [confirmPassword, setConfirmPassword] = useState(null)
    const [message, setMessage] = useState(null)
    const [isVerified, setIsVerified] = useState(false)

    const { signup, isLoading: signupLoading } = useSignup()

    const [account, setAccount] = useState({
        fullName: "",
        email: "",
        password: "",
    })
    const [isOtpOpen, setIsOtpOpen] = useState(false)
    const [otp, setOtp] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleRegister = () => {
        setIsVerified(true)
        if (!otp) {
            setMessage("otp")
            return
        }
        if (!account.password) {
            setMessage("password")
            return
        }
        if (!confirmPassword) {
            setMessage("confirmPassword")
            return
        }
        if (account.password !== confirmPassword) {
            setMessage("notMatch")
            return
        }
        setIsVerified(false)
        reqSignup()
    }

    const handleFocus = (field) => {
        if (message === field) {
            setIsVerified(false)
        }
    }

    const reqSignup = async () => {
        const res = await signup(account.email, account.password, account.fullName, otp)

        if (!res.success) Alert.alert("Lỗi", res.error)
        else {
            Alert.alert(
                "Thông báo",
                "Đăng ký tài khoản thành công. Vui lòng đăng nhập tài khoản để sử dụng.",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            navigation.navigate("Login")
                        },
                    },
                ]
            )
        }
    }

    const handleSendOtp = () => {
        setIsVerified(true)
        if (!account.fullName) {
            setMessage("fullname")
            return
        }
        if (!account.email) {
            setMessage("email")
            return
        }
        setIsVerified(false)
        send_OTP()
    }

    const send_OTP = async () => {
        setLoading(true)

        try {
            const result = await sendOTP(account.email)
            if (result) setIsOtpOpen(true)
        } catch (error) {
            Alert.alert("Lỗi", error.message || "Không thể gửi mã xác thực.")
            // setErrorMessage(error.message || "Không thể gửi mã xác thực.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.pureWhite }}>
            {signupLoading || (loading && <Loading />)}

            <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
                <View style={styles.header}>
                    <TouchableOpacity>
                        <Ionicons
                            onPress={() => {
                                navigation.goBack()
                            }}
                            name="arrow-back-outline"
                            size={48}
                            color={COLORS.pureWhite}
                        />
                    </TouchableOpacity>
                    <Text style={styles.title}>ĐĂNG KÝ TÀI KHOẢN</Text>
                </View>

                {!isOtpOpen && (
                    <View>
                        <View style={styles.iconRow}>
                            <TouchableOpacity
                                style={[styles.iconButton, { backgroundColor: COLORS.github }]}>
                                <FontAwesome name="github" size={20} color={COLORS.pureWhite} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.iconButton, { backgroundColor: COLORS.google }]}>
                                <AntDesign name="google" size={20} color={COLORS.pureWhite} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.iconButton, { backgroundColor: COLORS.facebook }]}>
                                <Entypo name="facebook" size={20} color={COLORS.pureWhite} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.dividerContainer}>
                            <View style={styles.divider} />
                            <Text style={styles.orText}>hoặc</Text>
                            <View style={styles.divider} />
                        </View>

                        <View style={{ flex: 1, marginHorizontal: 20, marginTop: 10 }}>
                            <Text style={styles.label}>Họ và tên</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Fullname"
                                value={account.fullName}
                                onChangeText={(value) => {
                                    setAccount({ ...account, fullName: value })
                                }}
                                onFocus={() => {
                                    handleFocus("fullname")
                                }}
                            />
                            {isVerified && message === "fullname" ? (
                                <Text style={styles.message}>* Chưa nhập họ tên</Text>
                            ) : null}

                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Email"
                                inputMode="email"
                                keyboardType="email-address"
                                value={account.email}
                                onChangeText={(value) => {
                                    // setEmail(value);
                                    setAccount({ ...account, email: value })
                                }}
                                onFocus={() => {
                                    handleFocus("email")
                                }}
                            />
                            {isVerified && message === "email" ? (
                                <Text style={styles.message}>* Chưa nhập email</Text>
                            ) : null}

                            <Pressable
                                onPress={() => handleSendOtp()}
                                style={({ pressed }) => [
                                    {
                                        backgroundColor: pressed
                                            ? COLORS.sunsetOrange
                                            : COLORS.coralBlaze,
                                    },
                                    styles.button,
                                ]}>
                                <Text
                                    style={{
                                        color: COLORS.pureWhite,
                                        textAlign: "center",
                                        fontWeight: "bold",
                                        fontSize: 15,
                                    }}>
                                    Xác thực
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                )}

                {isOtpOpen && (
                    <View style={{marginHorizontal: 20, marginTop: 50}}>
                        <Text style={styles.label}>OTP</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Mã OTP"
                            value={otp}
                            onChangeText={(value) => setOtp(value)}
                            onFocus={() => {
                                handleFocus("otp")
                            }}
                        />
                        {isVerified && message === "otp" ? (
                            <Text style={styles.message}>* Chưa nhập mã OTP</Text>
                        ) : null}

                        <Text style={styles.label}>Mật khẩu</Text>
                        <InputPassword
                            value={account.password}
                            onChangeText={(value) => {
                                // setPassword(value);
                                setAccount({ ...account, password: value })
                            }}
                            onFocus={() => {
                                handleFocus("password")
                            }}
                        />
                        {isVerified && message === "password" ? (
                            <Text style={styles.message}>* Chưa nhập mật khẩu</Text>
                        ) : null}

                        <Text style={styles.label}>Xác nhận lại mật khẩu</Text>
                        <InputPassword
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            onFocus={() => {
                                handleFocus("confirmPassword")
                                handleFocus("notMatch")
                            }}
                        />
                        {isVerified && message === "confirmPassword" ? (
                            <Text style={styles.message}>* Chưa nhập mật khẩu xác thực</Text>
                        ) : null}
                        {isVerified && message === "notMatch" ? (
                            <Text style={styles.message}>* Mật khẩu không trùng khớp</Text>
                        ) : null}

                        <Pressable
                            onPress={() => {
                                handleRegister()
                            }}
                            style={({ pressed }) => [
                                {
                                    backgroundColor: pressed
                                        ? COLORS.sunsetOrange
                                        : COLORS.coralBlaze,
                                },
                                styles.button,
                            ]}>
                            <Text
                                style={{
                                    color: COLORS.pureWhite,
                                    textAlign: "center",
                                    fontWeight: "bold",
                                    fontSize: 15,
                                }}>
                                Đăng ký
                            </Text>
                        </Pressable>
                    </View>
                )}

                {/* {errorMessage ? <Text style={styles.message}>* {errorMessage}</Text> : null} */}
            </ScrollView>
        </View>
    )
}

export default Register

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 10,
        paddingTop: 40,
        backgroundColor: COLORS.sunsetOrange,
        borderBottomRightRadius: 30,
        borderBottomLeftRadius: 30,
    },
    title: {
        marginVertical: 15,
        color: COLORS.pureWhite,
        fontWeight: "bold",
        textAlign: "center",
        fontSize: 22,
    },
    textInput: {
        borderWidth: 1,
        borderColor: COLORS.silver,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 999,
    },
    button: {
        marginTop: 12,
        borderRadius: 999,
        color: COLORS.deepBlack,
        padding: 10,
    },
    message: {
        color: COLORS.coralBlaze,
        fontSize: 12,
    },
    import: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
    },
    label: {
        color: COLORS.deepBlack,
        marginVertical: 4,
    },
    buttonImport: {
        width: 30,
        height: 30,
        backgroundColor: COLORS.silver,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        marginLeft: 15,
    },
    iconRow: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 16, // hoặc dùng marginHorizontal cho mỗi button
        marginVertical: 16,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.silver, // gray-300
        width: 64,
    },
    orText: {
        color: COLORS.slateGray, // gray-500
    },
})
