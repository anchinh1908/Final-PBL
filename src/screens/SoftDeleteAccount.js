import React, { useState } from "react"
import { View, Text, StyleSheet, Button, Alert } from "react-native"
import { useAuth } from "../AuthProvider"
import Account_API from "../API/Account_API"
import { useNavigation } from "@react-navigation/native"

const SoftDeleteAccount = () => {
    const { account, userLogout } = useAuth()
    const account_Ids = [account?._id]
    const [is_deleted, setIsDeleting] = useState(false)
    const navigation = useNavigation()

    const handleSoftDelete = async () => {
        Alert.alert("Thông báo", "Bạn có chắc chắn muốn xóa tài khoản không?", [
            {
                text: "Hủy",
                onPress: () => console.log("Hủy bỏ"),
                style: "cancel",
            },
            {
                text: "Xóa",
                onPress: async () => {
                    setIsDeleting(true)
                    try {
                        const response = await Account_API.softDeleteAccount(account_Ids)
                        Alert.alert("Thông báo", "Tài khoản đã được xóa.", [
                            {
                                text: "OK",
                                onPress: () => {
                                    userLogout() // Gọi hàm logout
                                    navigation.navigate("Login")
                                },
                            },
                        ])
                    } catch (error) {
                        console.log(error)
                        Alert.alert("Thông báo", "Không thể xóa tài khoản. Vui lòng thử lại.")
                    } finally {
                        setIsDeleting(false)
                    }
                },
            },
        ])
    }
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Quản Lý Tài Khoản</Text>
            <Button
                title={is_deleted ? "Đang xóa..." : "Xóa tài khoản"}
                onPress={handleSoftDelete}
                disabled={is_deleted}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
})

export default SoftDeleteAccount
