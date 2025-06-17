import React, { useState } from "react"
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    StyleSheet,
} from "react-native"
import { COLORS } from "../constants"
import { forgotPassword } from "../API/Account_API"
import Loading from "../components/Loading"
import { HeaderBack } from "../components"

const ForgetPassword = ({ navigation }) => {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!email) {
            Alert.alert("Thông báo", "Vui lòng nhập địa chỉ email")
            return
        }

        setLoading(true)
        try {
            const result = await forgotPassword(email)
            if (result) {
                Alert.alert("Thông báo", "Mã đặt lại mật khẩu đã được gửi về email của bạn.", [
                    {
                        text: "OK",
                        onPress: () => {
                            navigation.navigate("ResetPassword", { email })
                        },
                    },
                ])
            }
        } catch (error) {
            Alert.alert("Thông báo", error.message || "Không thể gửi yêu cầu đặt lại mật khẩu.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <View style={styles.container}>
            {loading && <Loading />}

            <View style={styles.backButtonContainer}>
                <HeaderBack navigation={navigation} />
            </View>
            <View style={styles.itemcontainer}>
                <View style={styles.card}>
                    <Text style={styles.title}>Quên mật khẩu</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => handleSubmit()}
                        disabled={loading}>
                        <Text style={styles.buttonText}>Reset mật khẩu</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.baseBackground,
    },
    backButtonContainer: {
        paddingLeft: 16,
        paddingTop: 16,
    },
    backButton: {
        height: 48,
        width: 48,
    },
    itemcontainer: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: COLORS.baseBackground,
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: COLORS.pureWhite,
        borderRadius: 10,
        padding: 20,
        elevation: 3,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
        color: COLORS.oceanSlate,
    },
    input: {
        height: 45,
        borderColor: COLORS.silver,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    button: {
        backgroundColor: COLORS.oceanSlate,
        padding: 10,
        borderRadius: 12,
        alignItems: "center",
    },
    buttonText: {
        color: COLORS.pureWhite,
        fontSize: 16,
        fontWeight: "bold",
    },
})

export default ForgetPassword
