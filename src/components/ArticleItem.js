import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { COLORS, images } from "../constants"
import FontAwesome5 from "@expo/vector-icons/FontAwesome5"
import { formatToDDMMYYYY, formatToHHMMSS } from "../utils/ConvertDate"

const ArticleItem = ({ data, navigation }) => {
    return (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => navigation.navigate("ViewArticle", { post: data })}>
            <View style={styles.imageButton}>
                <Image
                    source={data?.article_image ? { uri: data.article_image } : images.poster}
                    style={styles.image}
                />
            </View>
            <View style={styles.item}>
                <View>
                    <Text style={styles.title} numberOfLines={2}>
                        {data.article_title}
                    </Text>
                </View>
                <Text style={styles.content} numberOfLines={2} ellipsizeMode="tail">
                    {data.article_content}
                </Text>
                <View style={styles.dateContainer}>
                    <FontAwesome5 name="calendar-alt" size={15} color={COLORS.gray} />
                    <Text style={styles.date}>
                        {formatToHHMMSS(data.date_published)}{" "}
                        {formatToDDMMYYYY(data.date_published)}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}

export default ArticleItem

const styles = StyleSheet.create({
    itemContainer: {
        marginHorizontal: 12,
        flexDirection: "row",
        paddingTop: 15,
    },
    imageButton: {
        height: 70,
        width: 90,
        overflow: "hidden",
    },
    image: {
        height: "100%",
        width: "100%",
        resizeMode: "cover",
        borderColor: COLORS.black,
        borderWidth: 1,
        borderRadius: 10,
        backgroundColor: COLORS.silver,
    },
    item: {
        flex: 1,
        marginLeft: 10,
    },
    dateContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 5,
    },
    title: {
        fontWeight: "bold",
        fontSize: 14,
        textDecorationLine: "underline",
        color: COLORS.blue,
        textAlign: "justify",
    },
    content: {
        flex: 1, // Let the content take up the available space
        marginTop: 5,
        textAlign: "justify",
    },
    date: {
        fontSize: 12,
        color: COLORS.gray,
        marginLeft: 5,
    },
})
