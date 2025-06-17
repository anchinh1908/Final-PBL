import {
    Button,
    Image,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    FlatList,
    Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { COLORS, images } from "../constants"
import FontAwesome6 from "@expo/vector-icons/FontAwesome6"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { ArticleItem, HeaderBack, HeaderHome } from "../components"
import { useAuth } from "../AuthProvider"
import { useCallback, useEffect, useState } from "react"
import { useFocusEffect } from "@react-navigation/native"
import Article_API from "../API/Article_API"

const RecyclingBin = ({ navigation }) => {
    const [myArticles, setMyArticles] = useState([])
    const { account, isLoggedIn } = useAuth()

    // State để quản lý thông báo
    const [showNotification, setShowNotification] = useState(false)
    const [notificationMessage, setNotificationMessage] = useState("")

    const showTemporaryNotification = (message) => {
        setNotificationMessage(message)
        setShowNotification(true)
        setTimeout(() => setShowNotification(false), 3000) // Ẩn sau 1 giây
    }

    useFocusEffect(
        useCallback(() => {
            const getMyArticle = async () => {
                try {
                    const myArticles = await Article_API.get_Deleted_Article_By_Doctor(
                        account?.email
                    )
                    const addChecked = myArticles.map((item) => ({
                        ...item,
                        checked: false,
                    }))
                    setMyArticles(addChecked)
                } catch (error) {
                    console.log(error)
                }
            }

            getMyArticle()
        }, [])
    )

    const handle_Delete_Article = async () => {
        const articleIds = myArticles.filter((item) => item.checked).map((item) => item._id)
        if (articleIds.length > 0)
            Alert.alert("", "Bạn có chắc chắn muốn xoá chúng vĩnh viễn không?", [
                { text: "No", style: "cancel" },
                {
                    text: "Yes",
                    onPress: async () => {
                        try {
                            const deleteArticle = await Article_API.perma_Delete_Article(articleIds)
                            if (deleteArticle?.modifiedCount > 0) {
                                // Alert.alert("Thông báo", "Tin tức đã được chuyển vào thùng rác.")
                                showTemporaryNotification("Tin tức đã được xoá!")
                                setMyArticles(myArticles.filter((item) => !item.checked))
                            } else {
                                showTemporaryNotification(res)
                            }
                        } catch (error) {
                            console.log(error)
                        }
                    },
                },
            ])
        else Alert.alert("Thông báo", "Vui lòng chọn bài báo cần xoá!", [{ text: "OK" }])
    }

    const handle_Restore_Article = async () => {
        const articleIds = myArticles.filter((item) => item.checked).map((item) => item._id)

        if (articleIds.length > 0)
            Alert.alert("", "Bạn có chắc chắn muốn khôi phục chúng không?", [
                { text: "No", style: "cancel" },
                {
                    text: "Yes",
                    onPress: async () => {
                        try {
                            const deleteArticle = await Article_API.restore_Article(articleIds)
                            if (deleteArticle?.modifiedCount > 0) {
                                // Alert.alert("Thông báo", "Tin tức đã được chuyển vào thùng rác.")
                                showTemporaryNotification("Tin tức đã được khôi phục!")
                                setMyArticles(myArticles.filter((item) => !item.checked))
                            } else {
                                showTemporaryNotification(res)
                            }
                        } catch (error) {
                            console.log(error)
                        }
                    },
                },
            ])
        else Alert.alert("Thông báo", "Vui lòng chọn bài báo muốn khôi phục!", [{ text: "OK" }])
    }

    const toggleCheckbox = (id) => {
        setMyArticles((prevItems) =>
            prevItems.map((item) => (item._id === id ? { ...item, checked: !item.checked } : item))
        )
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
            <FlatList
                data={myArticles}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item._id.toString()}
                ItemSeparatorComponent={() => <View style={styles.separateFlat} />}
                ListFooterComponent={() => <View style={{ height: 80 }} />}
                ListHeaderComponent={() => <HeaderBack navigation={navigation} title="Thùng rác" />}
                renderItem={({ item }) => (
                    <View style={{ flexDirection: "row", marginHorizontal: 10 }}>
                        <TouchableOpacity
                            onPress={() => toggleCheckbox(item._id)}
                            style={{
                                height: 20,
                                width: 20,
                                borderWidth: 1,
                                marginTop: 20,
                                borderRadius: 3,
                                borderColor: COLORS.gray,
                                alignItems: "center",
                                justifyContent: "center",
                            }}>
                            {item.checked ? (
                                <FontAwesome6 name="check" size={15} color={COLORS.black} />
                            ) : null}
                        </TouchableOpacity>
                        <View style={{ flex: 1 }}>
                            <ArticleItem data={item} navigation={navigation} />
                        </View>
                    </View>
                )}
            />

            {showNotification && (
                <View style={styles.notification}>
                    <Text style={styles.notificationText}>{notificationMessage}</Text>
                </View>
            )}

            {/* Footer */}
            <View style={styles.footerContainer}>
                <TouchableOpacity
                    style={styles.footerButton}
                    onPress={() => handle_Restore_Article()}>
                    <MaterialIcons
                        name="restore-from-trash"
                        size={22}
                        color={COLORS.white}
                        style={{ marginRight: 4 }}
                    />
                    <Text style={styles.footerButtonText}>Khôi phục</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handle_Delete_Article()}
                    style={[styles.footerButton, { backgroundColor: COLORS.red }]}>
                    <MaterialIcons
                        name="delete-forever"
                        size={22}
                        color={COLORS.white}
                        style={{ marginRight: 4 }}
                    />
                    <Text style={styles.footerButtonText}>Xoá</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default RecyclingBin

const styles = StyleSheet.create({
    separateFlat: {
        height: 1.5,
        backgroundColor: COLORS.silver,
        marginHorizontal: 15,
        borderRadius: 999,
        marginTop: 15,
    },
    notification: {
        position: "absolute",
        bottom: 30,
        left: "10%",
        right: "10%",
        padding: 10,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        borderRadius: 5,
        alignItems: "center",
        zIndex: 20,
    },
    notificationText: {
        color: COLORS.white,
        fontWeight: "bold",
        textAlign: "center",
    },
    footerContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
        padding: 10,
        // borderTopWidth: 1,
        // borderTopColor: COLORS.gray,
    },
    footerButton: {
        flex: 1,
        flexDirection: "row",
        backgroundColor: COLORS.PersianGreen,
        paddingVertical: 10,
        marginHorizontal: 5,
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center",
    },
    footerButtonText: {
        color: COLORS.white,
        fontWeight: "bold",
    },
})
