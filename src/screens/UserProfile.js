import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"
import { HeaderBack } from "../components"
import { COLORS, images } from "../constants"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { useAuthContext } from "../hooks/useAuthContext"

const UserProfile = ({ navigation }) => {
    const { user } = useAuthContext()

    return (
        <View style={styles.container}>
            <View
                style={{
                    paddingHorizontal: 16,
                    paddingTop: 16,
                    backgroundColor: COLORS.coralBlaze,
                }}>
                <HeaderBack navigation={navigation} title="My Profile" color={COLORS.coralBlaze} />
            </View>

            <View style={styles.contentTitle}>
                <View style={styles.myAvatar}>
                    <TouchableOpacity activeOpacity={0.85} onPress={() => {}}>
                        <Image
                            source={user?.avatarUrl ? { uri: user.avatarUrl } : images.user_default}
                            style={styles.image}
                        />
                    </TouchableOpacity>
                </View>

                <View style={[styles.myBasicInformation, { paddingVertical: 5 }]}>
                    <Text style={styles.textName}>{user.fullName}</Text>
                    <Text style={styles.text}>{user.email}</Text>
                    <Text style={styles.text}>({user.phoneNumber})</Text>
                </View>
            </View>

            <View style={styles.mainContainer}>
                <TouchableOpacity
                    onPress={() => {
                        navigation.navigate("UpdateUser")
                    }}>
                    <View style={styles.item}>
                        <Ionicons name="person-outline" size={28} style={styles.iconItem} />
                        <Text style={styles.textItem}>Chỉnh Sửa Hồ Sơ</Text>
                        <Ionicons name="chevron-forward" size={28} color={COLORS.oceanSlate} />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate("MyWishlist")}>
                    <View style={styles.item}>
                        <Ionicons name="wallet-outline" size={28} style={styles.iconItem} />
                        <Text style={styles.textItem}>Khách sạn đã lưu</Text>
                        <Ionicons name="chevron-forward" size={28} color={COLORS.oceanSlate} />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate("PasswordManage")}>
                    <View style={styles.item}>
                        <MaterialIcons name="lock-outline" size={28} style={styles.iconItem} />
                        <Text style={styles.textItem}>Quản lý mật khẩu</Text>
                        <Ionicons name="chevron-forward" size={28} color={COLORS.oceanSlate} />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate("ViewHistory")}>
                    <View style={styles.item}>
                        <Ionicons name="settings-outline" size={28} style={styles.iconItem} />
                        <Text style={styles.textItem}>Lịch sử xem</Text>
                        <Ionicons name="chevron-forward" size={28} color={COLORS.oceanSlate} />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate("Logout")}>
                    <View style={styles.item}>
                        <Ionicons name="log-out-outline" size={28} style={styles.iconItem} />
                        <Text style={styles.textItem}>Đăng Xuất</Text>
                        <Ionicons name="chevron-forward" size={28} color={COLORS.oceanSlate} />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default UserProfile

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.pureWhite,
    },
    contentTitle: {
        backgroundColor: COLORS.coralBlaze,
        flexDirection: "row",
        paddingVertical: 20,
        justifyContent: "flex-start",
        paddingLeft: 16,
        gap: 12,
    },
    myAvatar: {
        width: 100,
        aspectRatio: 1,
        resizeMode: "cover",
        borderRadius: 28,
        backgroundColor: COLORS.silver,
    },
    image: {
        width: "100%",
        height: "100%",
        borderRadius: 28,
    },
    myBasicInformation: {
        justifyContent: "space-between",
        marginVertical: 8,
    },
    textName: {
        fontSize: 18,
        fontWeight: "bold",
        color: COLORS.pureWhite,
    },
    text: {
        fontSize: 16,
        color: COLORS.pureWhite,
    },
    mainContainer: {
        flex: 1,
        marginHorizontal: 16,
        marginTop: 20,
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    iconItem: {
        color: COLORS.shadowWhite,
        backgroundColor: COLORS.oceanSlate,
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
