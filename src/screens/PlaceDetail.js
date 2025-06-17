import React from "react"
import { View, Text, Image, ScrollView, StyleSheet } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { COLORS } from "../constants"
import { HeaderBack } from "../components"
import AntDesign from "@expo/vector-icons/AntDesign"
import { useEffect, useState } from "react"
import { Alert } from "react-native"
import { get_Nearest_Hotel_By_PlaceID, get_Place_By_Slug } from "../API/Place_API"

const PlaceDetail = () => {
    const navigation = useNavigation()
    const route = useRoute()
    const { slug } = route.params || {}

    const [place, setPlace] = useState({})
    const [nearestHotel, setNearestHotel] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const getPlaceBySlug = async (slug) => {
            try {
                setLoading(true)
                const { place } = await get_Place_By_Slug(slug)
                setPlace(place)
            } catch (error) {
                Alert.alert("Lỗi", error.message || "Không thể tải địa điểm")
            } finally {
                setLoading(false)
            }
        }

        // Xoá window.scrollTo vì không dùng được trong React Native
        getPlaceBySlug(slug)
    }, [slug])

    useEffect(() => {
        const getNearestHotel = async (placeid, distance) => {
            try {
                const { hotels } = await get_Nearest_Hotel_By_PlaceID(placeid, distance)
                setNearestHotel(hotels)
            } catch (error) {
                Alert.alert(
                    "Lỗi",
                    error.message || "Không thể tải danh sách khách sạn gần địa điểm"
                )
            }
        }

        if (place?.id) getNearestHotel(place.id)
    }, [place])

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <HeaderBack navigation={navigation} />
            {!loading && (
                <View style={styles.header}>
                    <View style={styles.left}>
                        <Text style={styles.title}>{place?.title}</Text>
                        <View style={styles.ratingRow}>
                            <AntDesign name="star" size={16} color={COLORS.sunsetOrange} />
                            <Text>{place?.rating}</Text>
                        </View>
                        <Text style={styles.review}>
                            {place?.review?.toLocaleString()} đánh giá
                        </Text>

                        <Text style={styles.address}>{place?.address}</Text>
                        <Text style={styles.description}>{place?.description}</Text>
                    </View>
                    <Image source={{ uri: place?.imageUrl }} style={styles.image} />
                </View>
            )}

            {!loading && place?.services && (
                <View style={styles.serviceGrid}>
                    {place?.services?.length > 0 &&
                        place?.services?.map((group, index) => {
                            const category = Object.keys(group)[0]
                            const items = group[category]
                            return (
                                <View key={index} style={styles.serviceBox}>
                                    <Text style={styles.serviceTitle}>{category}</Text>
                                    {items.map((item, i) => (
                                        <Text key={i} style={styles.serviceItem}>
                                            • {item}
                                        </Text>
                                    ))}
                                </View>
                            )
                        })}
                </View>
            )}

            <View style={styles.hotelSection}>
                <Text style={styles.hotelHeader}>Các địa điểm tham quan gần đây</Text>
                {nearestHotel.length > 0 &&
                    nearestHotel.map((hotel) => (
                        <View key={hotel?.id} style={styles.hotelItem}>
                            <Text style={styles.hotelName}>{hotel?.name}</Text>
                            <View style={styles.dottedLine} />
                            <Text style={styles.hotelDistance}>
                                {(hotel?.distanceInMeters / 1000)?.toFixed(2)} km
                            </Text>
                        </View>
                    ))}
            </View>
        </ScrollView>
    )
}

export default PlaceDetail

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: COLORS.pureWhite,
    },
    header: {
        flexDirection: "row",
        gap: 12,
    },
    left: {
        flex: 1,
        paddingRight: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
    },
    ratingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    review: {
        fontSize: 14,
        marginBottom: 8,
    },
    address: {
        color: COLORS.slateGray,
    },
    description: {
        textAlign: "justify",
        marginTop: 8,
    },
    image: {
        width: 150,
        height: 150,
        borderRadius: 12,
    },
    serviceGrid: {
        marginTop: 16,
        gap: 4,
    },
    serviceBox: {
        backgroundColor: COLORS.silverMist,
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    serviceTitle: {
        fontWeight: "600",
        fontSize: 16,
        marginBottom: 6,
    },
    serviceItem: {
        fontSize: 14,
        color: COLORS.slateGray,
        marginLeft: 8,
    },
    hotelSection: {
        marginVertical: 24,
        paddingTop: 16,
        borderTopColor: COLORS.silver,
        borderTopWidth: 1,
    },
    hotelHeader: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 12,
    },
    hotelItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    hotelName: {
        fontSize: 14,
        maxWidth: "80%"
    },
    dottedLine: {
        flex: 1,
        borderBottomWidth: 1,
        borderColor: COLORS.slateGray,
        borderStyle: "dashed",
        marginHorizontal: 12,
        marginTop: 6,
    },
    hotelDistance: {
        fontSize: 14,
    },
})
