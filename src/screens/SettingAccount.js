import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import React, { useState } from "react"
import Ionicons from "@expo/vector-icons/Ionicons"
import { useAuth } from "../AuthProvider"
import { SafeAreaView } from "react-native-safe-area-context"
import { HeaderBack } from "../components"
import { COLORS } from "../constants"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import AntDesign from "@expo/vector-icons/AntDesign"
import Account_API from "../API/Account_API"

const SettingAccount = ({ navigation }) => {
    const { account, userLogout } = useAuth() // Lấy hàm logout từ AuthProvider
    const account_Ids = [account?._id]
    const [is_deleted, setIsDeleting] = useState(false)

    const handleDeleteAccount = () => {
        // Hiển thị hộp thoại xác nhận xóa tài khoản
        Alert.alert("Thông báo", "Bạn có chắc chắn muốn xóa tài khoản không?", [
            { text: "Hủy", style: "cancel" },
            {
                text: "Xóa",
                onPress: async () => {
                    setIsDeleting(true)
                    try {
                        await Account_API.softDeleteAccount(account_Ids)
                        Alert.alert("Thông báo", "Tài khoản đã được xóa.", [
                            {
                                text: "OK",
                                onPress: () => {
                                    userLogout() // Gọi hàm logout
                                    navigation.navigate("Login") // Điều hướng về màn hình Login
                                },
                            },
                        ])
                    } catch (error) {
                        Alert.alert("Lỗi", "Không thể xóa tài khoản.")
                    } finally {
                        setIsDeleting(false)
                    }
                },
            },
        ])
    }

    return (
        <SafeAreaView style={styles.container}>
            <HeaderBack navigation={navigation} title="Cài Đặt" />
            <View style={styles.mainContainer}>
                <View style={styles.item}>
                    <MaterialIcons name="password" size={28} style={styles.iconItem} />
                    <Text style={styles.textItem}>Quản Lý Mật Khẩu</Text>
                    <TouchableOpacity onPress={() => navigation.navigate("PasswordManage")}>
                        <Ionicons name="chevron-forward" size={28} color={COLORS.PersianGreen} />
                    </TouchableOpacity>
                </View>

                <View style={styles.item}>
                    <AntDesign name="deleteuser" size={28} style={styles.iconItem} />
                    <Text style={styles.textItem}>Xóa Tài Khoản</Text>
                    <TouchableOpacity onPress={handleDeleteAccount}>
                        <Ionicons name="chevron-forward" size={28} color={COLORS.PersianGreen} />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default SettingAccount

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    mainContainer: {
        flex: 1,
        margin: 20,
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    iconItem: {
        color: COLORS.Light50PersianGreen,
        backgroundColor: COLORS.PersianGreen,
        padding: 14,
        borderRadius: 999,
    },
    textItem: {
        fontSize: 20,
        flex: 1,
        marginHorizontal: 10,
        paddingStart: 5,
    },
})
