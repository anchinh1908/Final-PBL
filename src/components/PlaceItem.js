// const renderPlace = ({ item }) => (
//     <TouchableOpacity
//         style={styles.card}
//         onPress={() => navigation.navigate("PlaceDetail", { slug: item.slug })}>
//         <Image source={{ uri: item.img }} style={styles.image} />
//         <View style={styles.overlay}>
//             <Text style={styles.overlayText}>{item.title}</Text>
//         </View>
//         <View style={styles.rating}>
//             <Text style={styles.ratingText}>{item.rating}</Text>
//         </View>
//     </TouchableOpacity>
// )

import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { COLORS } from "../constants"

const PlaceItem = ({ item, onPress }) => {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <View style={styles.overlay}>
                <Text style={styles.overlayText}>{item.title}</Text>
            </View>
            <View style={styles.rating}>
                <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
        </TouchableOpacity>
    )
}

export default PlaceItem

const styles = StyleSheet.create({
    card: {
        width: "48%",
        marginBottom: 12,
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: COLORS.creamyIvory,
        position: "relative",
    },
    image: {
        width: "100%",
        height: 160,
    },
    overlay: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        height: 60,
        backgroundColor: COLORS.shadowBlack,
        justifyContent: "center",
        alignItems: "center",
        padding: 4,
    },
    overlayText: {
        color: COLORS.pureWhite,
        fontSize: 14,
    },
    rating: {
        position: "absolute",
        top: 6,
        right: 6,
        backgroundColor: COLORS.creamyIvory,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    ratingText: {
        fontWeight: "bold",
    },
})
