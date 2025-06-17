import React, { useEffect, useState } from "react"
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native"
import Swiper from "react-native-swiper"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons" // Thay thế các icon
import { AntDesign } from "@expo/vector-icons"
import { images } from "../constants"
import { get_All_Rooms_By_HotelID } from "../API/Room_API"

const Slider = ({ hotels }) => {
    const navigation = useNavigation()
    const [firstRooms, setFirstRooms] = useState([])

    useEffect(() => {
        const fetchFirstRooms = async () => {
            try {
                const roomsData = await Promise.all(
                    hotels.map(async (item) => {
                        try {
                            const { rooms } = await get_All_Rooms_By_HotelID(item.hotel.id)
                            return rooms[0] || {}
                        } catch (error) {
                            // console.log(
                            //     `Lỗi khi lấy phòng của khách sạn ID ${item.hotel.id}:`,
                            //     error
                            // )
                            return {} // Trả về object rỗng nếu lỗi
                        }
                    })
                )
                setFirstRooms(roomsData)
            } catch (error) {
                console.log("Lỗi không xác định:", error)
            }
        }

        if (hotels.length > 0) {
            fetchFirstRooms()
        }
    }, [hotels])

    return (
        <View style={{ position: "relative" }}>
            <Swiper showsPagination={true} loop={true} height={324}>
                {hotels.map((item, idx) => {
                    const firstRoom = firstRooms[idx] || {}
                    return (
                        <View key={item.hotel.id} style={styles.sliderItem}>
                            <TouchableOpacity
                                onPress={() =>
                                    navigation.navigate(`HotelBottomTab`, { slug: item?.hotel?.slug })
                                }>
                                <View style={styles.imageContainer}>
                                    <Image
                                        source={{
                                            uri: item?.hotel?.imageUrls?.[0] || images.user_default,
                                        }}
                                        style={styles.image}
                                    />
                                    {/* <View style={styles.favoriteIcon}>
                                        {item.hotel.wishlist ? (
                                            <AntDesign name="heart" size={22} color="red" />
                                        ) : (
                                            <AntDesign name="hearto" size={20} color="gray" />
                                        )}
                                    </View> */}
                                </View>
                                <View style={styles.detailsContainer}>
                                    <Text style={styles.hotelName}>{item?.hotel?.name}</Text>
                                    <Text style={styles.price}>
                                        VND {firstRoom?.price?.toLocaleString()}
                                    </Text>
                                    <Text style={styles.description} numberOfLines={2}>
                                        {item?.hotel?.description}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )
                })}
            </Swiper>
        </View>
    )
}

const styles = StyleSheet.create({
    sliderItem: {
        // flex: 1,
        marginHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#ddd",
        backgroundColor: "white",
    },
    imageContainer: {
        position: "relative",
    },
    image: {
        width: "100%",
        height: 180,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    favoriteIcon: {
        position: "absolute",
        top: 10,
        left: 10,
        backgroundColor: "white",
        borderRadius: 50,
        padding: 5,
    },
    detailsContainer: {
        padding: 10,
    },
    hotelName: {
        fontSize: 16,
        fontWeight: "bold",
    },
    price: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 8,
    },
    description: {
        fontSize: 12,
        color: "#666",
        marginTop: 4,
        marginBottom: 10,
        height: 36,
    },
})

export default Slider
