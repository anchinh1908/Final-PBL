import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { COLORS } from "../constants"
import HotelImagesCarousel from "../components/HotelImagesCarousel"
import { MaterialIcons, AntDesign } from "@expo/vector-icons"
import { useEffect, useRef, useState } from "react"
import {
    addViewedHotel,
    calculateAverageReviewScore,
    splitParagraphBySentence,
} from "../utils/uiHelper"
import ReviewBar from "../components/ReviewBar"
import { get_Hotel_By_Slug, get_Nearest_Place_By_HotelID } from "../API/Hotel_API"
import useMyWishlistContext from "../hooks/useMyWishlistContext"
import { useAuthContext } from "../hooks/useAuthContext"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { add_My_Wishlist, delete_My_Wishlist } from "../API/Wishlist_API"
import Loading from "../components/Loading"
import { add_Hotel_My_Trip } from "../API/Trip_API"

const DescriptionHotel = ({ slug }) => {
    const [reviewsAvr, setReviewsAvr] = useState(0)
    const scrollRef = useRef()
    const [hotel, setHotel] = useState(null)
    const [nearestPlace, setNearestPlace] = useState([])
    const [loading, setLoading] = useState(false)
    const [wishlist, setWishlist] = useState(false)

    const { myWishlists, dispatch } = useMyWishlistContext()
    const { user } = useAuthContext()

    useEffect(() => {
        const getHotelBySlug = async (slug) => {
            try {
                setLoading(true)
                const { hotel } = await get_Hotel_By_Slug(slug)
                setHotel(hotel.hotel)
            } catch (error) {
                console.log(error.message || "Không thể tải lên khách sạn")
            } finally {
                setLoading(false)
            }
        }

        // Scroll to top
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ y: 0, animated: false })
        }

        getHotelBySlug(slug)
    }, [slug])

    useEffect(() => {
        const getNearestPlace = async (hotelId, distance = 3000) => {
            try {
                const { places } = await get_Nearest_Place_By_HotelID(hotelId, distance)
                setNearestPlace(places)
            } catch (error) {
                console.log(error.message || "Không thể tải danh sách địa điểm gần khách sạn")
            }
        }

        if (hotel?.id) {
            getNearestPlace(hotel?.id)
            if (user) addViewedHotel(hotel?.id)
        }

        if (hotel?.reviews) {
            setReviewsAvr(calculateAverageReviewScore(hotel?.reviews))
        }
    }, [hotel])

    useEffect(() => {
        const checkMyWishlist = async (hotelId) => {
            if (!hotelId) return

            const isInWishlist = myWishlists?.some((item) => item.id === hotelId)
            setWishlist(isInWishlist)
        }

        checkMyWishlist(hotel?.id)
    }, [hotel?.id, myWishlists])

    const addMyWishlist = async (token) => {
        try {
            const result = await add_My_Wishlist(token, hotel.id)
            if (result) {
                setWishlist(true)
                dispatch({
                    type: "ADD_MYWISHLIST",
                    payload: hotel,
                })
                Alert.alert("Thành công", "Đã thêm khách sạn này vào danh sách yêu thích!")
            }
        } catch (error) {
            Alert.alert(
                "Lỗi",
                error.message || "Không thể thêm khách sạn này vào danh sách yêu thích!"
            )
            setWishlist(false)
        }
    }

    const deleteMyWishlist = async (token) => {
        try {
            const result = await delete_My_Wishlist(token, hotel.id)
            if (result) {
                setWishlist(false)
                dispatch({
                    type: "DELETE_MYWISHLIST",
                    payload: hotel,
                })
                Alert.alert("Thành công", "Đã xoá khách sạn này khỏi danh sách yêu thích!")
            }
        } catch (error) {
            Alert.alert(
                "Lỗi",
                error.message || "Không thể xoá khách sạn này khỏi danh sách yêu thích!"
            )
            setWishlist(true)
        }
    }

    const handleWishlist = async () => {
        if (!user) {
            Alert.alert("Cảnh báo", "Vui lòng đăng nhập trước khi thực hiện!")
        } else {
            const token = await AsyncStorage.getItem("token")
            if (!wishlist) addMyWishlist(token)
            else deleteMyWishlist(token)
        }
    }

    const addHotelToMyTrip = async (token, hotelId) => {
        try {
            const result = await add_Hotel_My_Trip(token, hotelId)
            if (result) {
                Alert.alert("Thành công", "Thêm khách sạn vào chuyến đi thành công!")
            }
        } catch (error) {
            Alert.alert("Lỗi", error.message || "Không thể thêm khách sạn này vào chuyến đi!")
        }
    }

    const handleMyTrip = async (user, hotelId) => {
        if (!user) {
            Alert.alert("Thông báo", "Vui lòng đăng nhập trước khi thực hiện!")
            return
        }

        try {
            const token = await AsyncStorage.getItem("token")
            if (!token) {
                Alert.alert("Cảnh báo", "Không tìm thấy token. Vui lòng đăng nhập lại!")
                return
            }

            await addHotelToMyTrip(token, hotelId)
        } catch (error) {
            Alert.alert("Lỗi", "Không thể lấy token từ thiết bị.")
        }
    }

    const openMap = () => {
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            hotel?.address
        )}`
        Linking.openURL(url)
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false} ref={scrollRef}>
            {!loading && hotel?.imageUrls && <HotelImagesCarousel images={hotel?.imageUrls} />}

            {!loading && hotel?.name && (
                <View style={styles.mainContainer}>
                    <View style={styles.headerBox}>
                        <Text style={styles.hotelName}>
                            {hotel?.name}
                            {"  "}
                            {hotel?.ratingStars != 0 && (
                                <View style={styles.ratingRow}>
                                    <AntDesign name="star" size={16} color={COLORS.sunsetOrange} />
                                    <Text>{hotel?.ratingStars}</Text>
                                </View>
                            )}
                        </Text>
                        <View style={styles.ratingBox}>
                            <Text style={styles.ratingValue}>{reviewsAvr}</Text>
                        </View>
                    </View>

                    <View style={styles.addressRow}>
                        <MaterialIcons name="location-on" size={16} color={COLORS.oceanSlate} />
                        <Text style={styles.mapLink} numberOfLines={3} onPress={openMap}>
                            Vị trí trên bản đồ
                        </Text>
                    </View>
                    <Text>{hotel?.address}</Text>

                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={styles.iconContainer}
                            onPress={() => handleWishlist()}>
                            {wishlist ? (
                                <MaterialIcons
                                    name="favorite"
                                    size={20}
                                    color={COLORS.coralBlaze}
                                />
                            ) : (
                                <MaterialIcons
                                    name="favorite-border"
                                    size={20}
                                    color={COLORS.coralBlaze}
                                />
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {}} style={styles.bookButton}>
                            <Text style={{ color: COLORS.pureWhite }}>Đặt ngay</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                handleMyTrip(user, hotel?.id)
                            }}
                            style={[styles.bookButton, { backgroundColor: COLORS.oceanSlate }]}>
                            <Text style={{ color: COLORS.pureWhite }}>Chuyến đi</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.section}>
                        {splitParagraphBySentence(hotel?.description).map((sentence, idx) => (
                            <Text key={idx} style={styles.paragraph}>
                                {sentence}
                            </Text>
                        ))}

                        <Text style={styles.subheading}>Các tiện nghi nổi bật</Text>
                        <View style={styles.facilityContainer}>
                            {hotel?.facilities.map((facility, idx) => (
                                <View key={idx} style={styles.facilityItem}>
                                    <MaterialIcons
                                        name="check-circle"
                                        size={18}
                                        color={COLORS.oceanSlate}
                                    />
                                    <Text>{facility}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.highlightBox}>
                        <Text style={styles.subheading}>Điểm nổi bật của chỗ nghỉ</Text>
                        {Object.entries(hotel?.highlights).map(([key, value]) => (
                            <View key={key}>
                                <Text style={styles.highlightTitle}>{key}</Text>
                                <Text style={styles.highlightDesc}>+ {value}</Text>
                            </View>
                        ))}
                        <TouchableOpacity
                            onPress={() => Linking.openURL(hotel?.hotelLink)}
                            style={styles.bookButton}>
                            <Text style={{ color: COLORS.pureWhite, textAlign: "center" }}>
                                Đặt chỗ
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.subheading}>Các địa điểm tham quan gần đây</Text>
                    {nearestPlace.map((place) => (
                        <View key={place.id} style={styles.locationItem}>
                            <Text style={styles.locationName}>{place.title}</Text>
                            <View style={styles.dottedLine} />
                            <Text style={styles.locationDistance}>
                                {(place.distanceInMeters / 1000).toFixed(2)} km
                            </Text>
                        </View>
                    ))}

                    <Text style={styles.subheading}>Đánh giá</Text>
                    {Object.entries(hotel?.reviews).map(([key, value]) => (
                        <ReviewBar key={key} label={key} score={value} />
                    ))}

                    <View style={{ marginBottom: 16 }} />
                </View>
            )}
        </ScrollView>
    )
}

export default DescriptionHotel

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.pureWhite,
    },
    mainContainer: {
        marginHorizontal: 16,
        marginTop: 8,
    },
    headerBox: {
        // flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
    },
    // headerRow: {
    //     flex: 1,
    //     flexDirection: "row",
    //     alignItems: "center",
    //     gap: 10,
    //     marginBottom: 8,
    //     flexWrap: "wrap",
    // },
    ratingRow: {
        flexDirection: "row",
        alignItems: "center",
        columnGap: 2,
    },
    hotelName: {
        flex: 1,
        fontSize: 18,
        fontWeight: "bold",
    },
    addressRow: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2,
        flex: 1,
    },
    mapLink: {
        color: COLORS.oceanSlate,
        fontStyle: "italic",
        textDecorationLine: "underline",
    },
    actionRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 10,
        marginTop: 12,
    },
    iconContainer: {
        backgroundColor: COLORS.creamyIvory,
        padding: 8,
        borderRadius: 8,
    },
    bookButton: {
        backgroundColor: COLORS.coralBlaze,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    ratingBox: {
        height: 36,
        backgroundColor: COLORS.oceanSlate,
        paddingHorizontal: 6,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    ratingValue: {
        color: COLORS.pureWhite,
        fontWeight: "bold",
        fontSize: 18,
    },
    section: {
        marginTop: 24,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderColor: COLORS.silver,
    },
    paragraph: {
        marginBottom: 12,
        textAlign: "justify",
        fontSize: 14,
        lineHeight: 20,
    },
    subheading: {
        fontSize: 16,
        fontWeight: "bold",
        marginVertical: 12,
    },
    facilityContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 4,
    },
    facilityItem: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 12,
        marginBottom: 8,
        gap: 4,
    },
    highlightBox: {
        backgroundColor: COLORS.creamyIvory,
        padding: 16,
        borderRadius: 12,
        width: "100%",
        marginTop: 24,
    },
    highlightTitle: {
        fontWeight: "600",
        marginTop: 8,
    },
    highlightDesc: {
        fontSize: 13,
        paddingVertical: 4,
        paddingLeft: 12,
    },
    locationItem: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        paddingRight: 1,
    },
    locationName: {
        fontSize: 14,
        maxWidth: "80%",
    },
    dottedLine: {
        flex: 1,
        borderBottomWidth: 1,
        borderColor: COLORS.slateGray,
        borderStyle: "dashed",
        marginHorizontal: 12,
        marginTop: 6,
    },
    locationDistance: {
        fontSize: 14,
    },
})
