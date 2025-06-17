import React, { useState } from "react"
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    ScrollView,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useAuthContext } from "../hooks/useAuthContext"
import { changePassword } from "../API/Account_API"
import { COLORS } from "../constants"
import { HeaderBack, InputPassword } from "../components"
import { useNavigation } from "@react-navigation/native"

const PasswordManage = () => {
    const navigation = useNavigation()
    const { dispatch } = useAuthContext()
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            Alert.alert("Lỗi", "Mật khẩu mới và xác nhận mật khẩu không khớp.")
            return
        }

        setLoading(true)
        try {
            const token = await AsyncStorage.getItem("token")
            if (!token) {
                Alert.alert("Lỗi", "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.")
                return
            }

            const result = await changePassword(token, currentPassword, newPassword)
            if (result) {
                dispatch({ type: "UPDATE_USER", payload: { password: newPassword } })

                setCurrentPassword("")
                setNewPassword("")
                setConfirmPassword("")

                Alert.alert("Thành công", result.message || "Đổi mật khẩu thành công")
            } else {
                Alert.alert("Lỗi", result.message || "Đổi mật khẩu thất bại")
            }
        } catch (error) {
            Alert.alert("Lỗi", error.message || "Có lỗi xảy ra. Vui lòng thử lại.")
        } finally {
            setLoading(false)
        }
    }
    
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <HeaderBack navigation={navigation} />

            <Text style={styles.title}>Đổi mật khẩu</Text>

            <Text style={styles.label}>Mật khẩu hiện tại</Text>
            <InputPassword
                password={currentPassword}
                setPassword={setCurrentPassword}
                // placeholder="Xác minh người dùng hiện tại"
            />

            <Text style={styles.label}>Mật khẩu mới</Text>
            <InputPassword
                password={newPassword}
                setPassword={setNewPassword}
                // placeholder="Nhập mật khẩu mới"
            />

            <Text style={styles.label}>Nhập lại mật khẩu mới</Text>
            <InputPassword password={confirmPassword} setPassword={setConfirmPassword} />

            <TouchableOpacity
                onPress={handleChangePassword}
                disabled={loading}
                style={[styles.button, loading && styles.disabledButton]}>
                <Text style={styles.buttonText}>Đổi mật khẩu</Text>
            </TouchableOpacity>

            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.oceanSlate} />
                </View>
            )}
        </ScrollView>
    )
}

export default PasswordManage

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: "#fff",
        flexGrow: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
        marginTop: 40,
        color: COLORS.oceanSlate,
    },
    label: {
        marginBottom: 6,
        fontSize: 16,
        fontWeight: "500",
        color: "#333",
        marginTop: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
    },
    button: {
        backgroundColor: COLORS.coralBlaze,
        paddingVertical: 10,
        borderRadius: 999,
        alignItems: "center",
        marginTop: 16,
    },
    disabledButton: {
        opacity: 0.6,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    loadingContainer: {
        marginTop: 20,
        alignItems: "center",
    },
})
