import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { COLORS, images } from "../constants"
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons"
import { useAuthContext } from "../hooks/useAuthContext"

const HeaderHome = ({ title, navigation, scrollY }) => {
    const { user } = useAuthContext()
    const handle = () => {
        if (!user?.email) {
            navigation.navigate("Login")
        } else {
            navigation.navigate("UserProfile")
        }
    }

    return (
        <View
            style={[
                styles.container,
                scrollY > 80 && { backgroundColor: COLORS.pureWhite, elevation: 4 },
            ]}>
            <TouchableOpacity
                onPress={() => navigation.toggleDrawer()}
                style={styles.iconContainer}>
                <SimpleLineIcons
                    name="menu"
                    size={32}
                    color={scrollY < 80 ? COLORS.pureWhite : COLORS.oceanSlate}
                />
            </TouchableOpacity>
            <Text
                style={[
                    styles.text,
                    { color: scrollY < 80 ? COLORS.pureWhite : COLORS.oceanSlate },
                ]}>
                {title}
            </Text>
            <TouchableOpacity onPress={() => handle()} activeOpacity={0.7}>
                <Image
                    source={user?.avatarUrl ? { uri: user?.avatarUrl } : images.user_default}
                    style={styles.image}
                />
            </TouchableOpacity>
        </View>
    )
}

export default HeaderHome

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 14,
        paddingRight: 14,
        paddingVertical: 10,
        position: "absolute",
        top: 0,
        width: "100%",
        zIndex: 100,
        paddingTop: 40,
    },
    iconContainer: {
        height: 32,
        width: 32,
        borderRadius: 999,
    },
    image: {
        width: 48,
        height: 48,
        resizeMode: "cover",
        borderRadius: 999,
        borderWidth: 2,
        borderColor: COLORS.aquaMist,
        backgroundColor: COLORS.silver,
    },
    text: {
        fontSize: 16,
        fontWeight: "bold",
    },
})
