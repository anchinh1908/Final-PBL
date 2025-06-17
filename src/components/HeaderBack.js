import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"
import { COLORS } from "../constants"

const HeaderBack = ({ navigation, title, screenName, color }) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity style={{ height: 40, width: 40 }}>
                <Ionicons
                    onPress={() => {
                        if (!screenName) navigation.goBack()
                        else navigation.navigate(screenName)
                    }}
                    name="arrow-back-outline"
                    size={40}
                    color={color ? COLORS.pureWhite : COLORS.oceanSlate}
                />
            </TouchableOpacity>
            <Text style={[styles.title, { color: color ? COLORS.pureWhite : COLORS.oceanSlate }]}>
                {title}
            </Text>
        </View>
    )
}

export default HeaderBack

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 30,
        marginBottom: 10,
        marginLeft: -4
    },
    title: {
        flex: 1,
        textAlign: "center",
        marginRight: 53,
        fontSize: 18,
        fontWeight: "bold",
        // color: COLORS.oceanSlate,
    },
})
