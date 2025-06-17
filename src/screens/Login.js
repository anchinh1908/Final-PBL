import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"
import { SafeAreaView } from "react-native-safe-area-context"
import { COLORS, images } from "../constants"
import { useState } from "react"
import { InputPassword } from "../components"
import { AntDesign, Entypo, FontAwesome } from "@expo/vector-icons"
import Loading from "../components/Loading"
import { useLogin } from "../hooks/useLogin"
import { useAuthContext } from "../hooks/useAuthContext"

const Login = ({ navigation }) => {
    // const [account, setAccount] = useState({ email: "", password: "123qwe!@#QWE" })
    const [email, setEmail] = useState("lehue18022003@gmail.com")
    const [password, setPassword] = useState("LeHue02@")
    const { user, dispatch } = useAuthContext()

    const { login, isLoading: loginLoading } = useLogin()

    const handleLogin = async () => {
        const res = await login(email, password)

        if (!res.success) Alert.alert("Lỗi", res.error)
        else {
            console.log(user.role)

            if (user?.role === "USER")
                Alert.alert("Thông báo", "Đăng nhập thành công", [
                    {
                        text: "OK",
                        onPress: () => {
                            navigation.navigate("Home")
                        },
                    },
                ])
            else {
                Alert.alert("Thông báo", "Đây không phải tài khoản người dùng.")
                dispatch({ type: "LOGOUT" })
            }
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            {loginLoading && <Loading />}

            <View style={styles.backButtonContainer}>
                <TouchableOpacity style={styles.backButton}>
                    <Ionicons
                        onPress={() => {
                            navigation.navigate("Home")
                        }}
                        name="arrow-back-outline"
                        size={48}
                        color={COLORS.deepBlack}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.logoContainer}>
                <Image source={images.logo} style={styles.logo} />
                <Text style={styles.title}>ĐĂNG NHẬP</Text>

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

                <View style={styles.formContainer}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Nhập email."
                        keyboardType="email-address"
                        value={email}
                        onChangeText={(value) => setEmail(value)}
                    />
                    <Text style={styles.label}>Mật khẩu</Text>
                    <InputPassword value={password} onChangeText={(value) => setPassword(value)} />

                    <Pressable
                        disabled={loginLoading}
                        onPress={() => {
                            handleLogin()
                        }}
                        style={({ pressed }) => [
                            {
                                backgroundColor: pressed ? COLORS.sunsetOrange : COLORS.coralBlaze,
                            },
                            styles.buttonLogin,
                        ]}>
                        <Text style={styles.loginText}>Đăng nhập</Text>
                    </Pressable>

                    <TouchableOpacity onPress={() => navigation.navigate("ForgetPassword")}>
                        <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
                    </TouchableOpacity>
                </View>

                <Text>Bạn chưa có tài khoản?</Text>
                <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                    <Text style={styles.registerText}>Tạo tài khoản</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default Login

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.pureWhite,
    },
    backButtonContainer: {
        paddingLeft: 10,
        paddingTop: 10,
    },
    backButton: {
        height: 48,
        width: 48,
    },
    logoContainer: {
        flex: 1,
        alignItems: "center",
    },
    logo: {
        resizeMode: "contain",
        height: 120,
        width: 200,
    },
    title: {
        color: COLORS.deepBlack,
        fontWeight: "bold",
        fontSize: 26,
        marginBottom: 20,
    },
    formContainer: {
        margin: 20,
        width: "80%",
    },
    label: {
        color: COLORS.deepBlack,
        marginVertical: 4,
    },
    textInput: {
        borderWidth: 1,
        borderColor: COLORS.silver,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 999,
    },
    buttonLogin: {
        marginTop: 16,
        borderRadius: 999,
        padding: 10,
    },
    loginText: {
        color: COLORS.pureWhite,
        textAlign: "center",
        fontWeight: "bold",
        fontSize: 15,
    },
    forgotPasswordText: {
        color: COLORS.oceanSlate,
        fontStyle: "italic",
        textDecorationLine: "underline",
        marginTop: 2,
    },
    registerPrompt: {
        marginTop: 10,
    },
    registerText: {
        color: COLORS.oceanSlate,
    },
    iconRow: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 16, // hoặc dùng marginHorizontal cho mỗi button
        marginBottom: 16,
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
