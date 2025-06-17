import { Image, Pressable, StyleSheet, Text, View } from "react-native"
import { COLORS, images } from "../constants"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuthContext } from "../hooks/useAuthContext"

const DrawerContent = ({ navigation }) => {
    const { user } = useAuthContext()

    const handleManagerAccount = () => {
        if (!user?.email) {
            navigation.navigate("Login")
        } else {
            navigation.navigate("UserProfile")
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <Pressable onPress={() => handleManagerAccount()}>
                <Image
                    source={user?.avatarUrl ? { uri: user.avatarUrl } : images.user_default}
                    style={styles.image}
                />
            </Pressable>
            <Text
                style={{
                    color: COLORS.oceanSlate,
                    fontWeight: "bold",
                    fontSize: 16,
                }}>
                {user?.email && user ? user.fullName : "Khách"}
            </Text>
            {user?.email && user && (
                <Text style={{ color: COLORS.deepBlack, fontSize: 12 }}>{user.email}</Text>
            )}

            {!user?.email && (
                <Text
                    onPress={() => handleManagerAccount()}
                    style={{ color: COLORS.slateGray, fontSize: 12 }}>
                    Đăng nhập/đăng kí
                </Text>
            )}
            <View style={styles.separate}></View>
        </SafeAreaView>
    )
}

export default DrawerContent

const styles = StyleSheet.create({
    container: {
        height: 210,
        width: "100%",
        backgroundColor: COLORS.pureWhite,
        alignItems: "center",
        justifyContent: "center",
    },
    image: {
        height: 90,
        width: 90,
        resizeMode: "cover",
        borderRadius: 999,
        borderColor: COLORS.aquaMist,
        padding: 10,
        borderWidth: 3,
        backgroundColor: COLORS.silver,
    },
    separate: {
        backgroundColor: COLORS.silver,
        height: 1,
        marginVertical: 10,
        width: "80%",
    },
})
