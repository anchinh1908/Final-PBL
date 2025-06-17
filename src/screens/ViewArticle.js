import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"
import { COLORS, images } from "../constants"
import { SafeAreaView } from "react-native-safe-area-context"
import { HeaderBack } from "../components"
import { formatToDDMMYYYY, formatToHHMMSS } from "../utils/ConvertDate"
import FontAwesome5 from "@expo/vector-icons/FontAwesome5"
import { windowWidth } from "../utils/Dimentions"
import useArticles from "../hooks/useArticles"
import { useEffect, useRef, useState } from "react"
import { useFonts } from "expo-font"
import useCustomFonts from "../hooks/useCustomFonts"
import Account_API from "../API/Account_API"

const ViewArticle = ({ navigation, route }) => {
    const loadingFonts = useCustomFonts()

    const { post } = route.params || {}

    const [articlesByDoctor, setArticlesByDoctor] = useState([])
    const [content, setContent] = useState([])

    const [
        articlesHook,
        firstArticle,
        fourArticles,
        loading,
        getArticlesBySpecialty,
        getArticlesByDoctor,
        filterArticles,
    ] = useArticles()

    // const scrollViewRef = useRef();

    useEffect(() => {
        const getArticlesByDoctorEmail = async () => {
            const articlesDoctor = await getArticlesByDoctor(post.doctor_id.email, post._id)
            // console.log(articlesDoctor);
            setArticlesByDoctor(articlesDoctor)
        }

        getArticlesByDoctorEmail()

        const lines = post?.article_content.split("\n")
        setContent(lines)
        // scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }, [post])

    const showDoctor = async () => {
        try {
            const accountData = await Account_API.get_Account_By_Email(post?.doctor_id?.email)
            const doctorToSend = { ...accountData, name: accountData.username }
            navigation.navigate("DoctorInfo", { doctorSelected: doctorToSend })
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <HeaderBack navigation={navigation} backgroundColor={true} />

                {post ? (
                    <View style={styles.articleContainer}>
                        <Text style={styles.postTitle}>{post.article_title}</Text>
                        <Text style={styles.postCreatedAt}>
                            Đăng lúc: {formatToHHMMSS(post.date_published)}{" "}
                            {formatToDDMMYYYY(post.date_published)}
                        </Text>

                        {content.length > 0 && (
                            <View>
                                {/* Hiển thị đoạn nội dung đầu tiên */}
                                <Text style={styles.postContent}>{content[0]}</Text>
                                {post?.article_image && (
                                    <Image
                                        source={{ uri: post.article_image }}
                                        style={styles.image}
                                    />
                                )}

                                {/* Bỏ qua đoạn đầu tiên và hiển thị các đoạn văn tiếp theo */}
                                {content.slice(1).map((item, index) => (
                                    <Text
                                        key={index}
                                        style={[styles.postContent, { marginBottom: 5 }]}>
                                        {item}
                                    </Text>
                                ))}
                            </View>
                        )}

                        <Pressable onPress={() => showDoctor()}>
                            <Text style={styles.postSpecialty}>Bởi: {post.doctor_id.email}</Text>
                        </Pressable>
                    </View>
                ) : (
                    <Text>Không nhận được dữ liệu</Text>
                )}

                <Text style={styles.relatedPost}>Bài viết liên quan</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginLeft: 15 }}>
                    {articlesByDoctor.length > 0 &&
                        articlesByDoctor.map((post) => (
                            <View key={post._id}>
                                <TouchableOpacity
                                    style={styles.suggestedPost}
                                    onPress={() => navigation.push("ViewArticle", { post: post })}>
                                    <Image
                                        source={
                                            post?.article_image
                                                ? { uri: post.article_image }
                                                : images.poster
                                        }
                                        style={styles.imageSuggestedPost}
                                    />
                                    <Text style={styles.titleSuggestedPost} numberOfLines={2}>
                                        {post.article_title}
                                    </Text>
                                    <View style={styles.dateSuggestedPostContainer}>
                                        <FontAwesome5
                                            name="calendar-alt"
                                            size={15}
                                            color={COLORS.gray}
                                        />
                                        <Text style={styles.dateSuggestedPost}>
                                            {formatToHHMMSS(post.date_published)}{" "}
                                            {formatToDDMMYYYY(post.date_published)}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        ))}
                </ScrollView>

                <View style={{ height: 50 }} />
            </ScrollView>
        </SafeAreaView>
    )
}

export default ViewArticle

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    articleContainer: {
        marginHorizontal: 15,
    },
    postTitle: {
        color: COLORS.PersianGreen,
        fontSize: 18,
        textAlign: "center",
        fontWeight: "bold",
        marginBottom: 10,
    },
    postSpecialty: {
        color: COLORS.gray,
        textAlign: "center",
        marginBottom: 10,
        textAlign: "right",
        marginTop: 15,
    },
    postContent: {
        fontSize: 14,
        textAlign: "justify",
        fontFamily: "Poppins_Regular",
    },
    postCreatedAt: {
        color: COLORS.gray,
        textAlign: "right",
        marginBottom: 5,
    },
    relatedPost: {
        color: COLORS.PersianGreen,
        fontSize: 16,
        marginBottom: 10,
        marginHorizontal: 15,
    },
    suggestedPost: {
        borderRadius: 10,
        padding: 10,
        elevation: 2,
        backgroundColor: COLORS.white,
        shadowColor: COLORS.PersianGreen,
        alignItems: "center",
        width: (windowWidth / 4) * 3,
        borderWidth: 0.5,
        borderColor: COLORS.Light20PersianGreen,
        marginRight: 15,
        height: 210,
    },
    imageSuggestedPost: {
        height: 120,
        resizeMode: "cover",
        width: "100%",
    },
    titleSuggestedPost: {
        fontWeight: "bold",
        fontSize: 14,
        textDecorationLine: "underline",
        color: COLORS.blue,
        textAlign: "justify",
        marginTop: 5,
        alignSelf: "flex-start",
    },
    dateSuggestedPostContainer: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        marginVertical: 5,
    },
    dateSuggestedPost: {
        fontSize: 12,
        color: COLORS.gray,
        marginLeft: 5,
    },
    image: {
        flex: 1,
        aspectRatio: 5 / 3,
        resizeMode: "cover",
        marginVertical: 5,
    },
})
