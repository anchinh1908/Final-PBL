import React, { useEffect, useState } from "react"
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { COLORS, images } from "../constants"
import { MaterialIcons, AntDesign } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { get_All_Rooms_By_HotelID } from "../API/Room_API"

const HotelItem = React.memo(({ item }) => {
    const navigation = useNavigation()

    const [firstRoom, setFirstRoom] = useState({})

    useEffect(() => {
        const firstRoomHotels = async (hotelid) => {
            try {
                const { rooms } = await get_All_Rooms_By_HotelID(hotelid)
                setFirstRoom(rooms[0])
            } catch (error) {
                console.log("Lỗi khi lấy danh sách phòng:", error)
            }
        }

        if (item.rooms) setFirstRoom(item.rooms[0])
        else firstRoomHotels(item.hotel.id)
    }, [item])

    return (
        <Pressable
            style={styles.hotelCard}
            onPress={() => navigation.navigate("HotelBottomTab", { slug: item?.hotel?.slug })}>
            <Image
                source={{ uri: item?.hotel?.imageUrls?.[0] || images.user_default }}
                style={styles.hotelImage}
            />
            <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.hotelName}>{item?.hotel?.name}</Text>
                <Text numberOfLines={2} style={{ textAlign: "justify" }}>
                    {item?.hotel?.description}
                </Text>
                <Text numberOfLines={2} style={{ textAlign: "justify" }}>
                    <Text style={{ fontWeight: "bold", color: COLORS.oceanSlate }}>
                        Dịch vụ phòng:
                    </Text>{" "}
                    {item?.hotel?.facilities?.join(", ")}
                </Text>
                <Text style={{ marginTop: 5 }}>1 đêm, {firstRoom.numberOfGuests} người lớn</Text>
                <Text style={{ fontWeight: "bold" }}>VND {firstRoom?.price?.toLocaleString()}</Text>
                <TouchableOpacity
                    onPress={() =>
                        navigation.navigate("HotelBottomTab", { slug: item?.hotel?.slug })
                    }
                    style={styles.viewButton}>
                    <Text style={{ color: COLORS.pureWhite }}>Xem phòng trống</Text>
                    <MaterialIcons name="arrow-forward-ios" size={14} color={COLORS.pureWhite} />
                </TouchableOpacity>
            </View>
        </Pressable>
    )
})

export default HotelItem

const styles = StyleSheet.create({
    hotelCard: {
        flexDirection: "row",
        // marginHorizontal: 16,
        marginBottom: 12,
        backgroundColor: COLORS.pureWhite,
        borderRadius: 10,
        padding: 10,
        elevation: 3,
        position: "relative",
    },
    hotelImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    hotelName: {
        fontWeight: "bold",
        fontSize: 16,
        marginRight: 20,
    },
    viewButton: {
        marginTop: 8,
        backgroundColor: COLORS.sunsetOrange,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 4,
    },
    wishlistIcon: {
        position: "absolute",
        top: 10,
        right: 10,
    },
})
