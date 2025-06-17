import { ActivityIndicator, StyleSheet, View } from "react-native"
import { COLORS } from "../constants"

const Loading = () => {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={COLORS.oceanSlate} />
        </View>
    )
}

export default Loading

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.shadowBlack,
        zIndex: 100,
    },
})
