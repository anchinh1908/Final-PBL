import { ScrollView, StyleSheet, Text, View } from "react-native"
import { COLORS } from "../constants"
import { isDiscounted } from "../utils/uiHelper"
import { useEffect, useRef, useState } from "react"
import { get_Hotel_By_Slug } from "../API/Hotel_API"
import { get_All_Rooms_By_HotelID } from "../API/Room_API"
import Loading from "../components/Loading"

const RoomTypes = ({ slug }) => {
    const scrollRef = useRef()
    const [hotelRooms, setHotelRooms] = useState([])
    const [hotel, setHotel] = useState({})
    const [loading, setLoading] = useState(false)

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
        const getHotelRooms = async (hotelId) => {
            try {
                const { rooms } = await get_All_Rooms_By_HotelID(hotelId)
                setHotelRooms(rooms)
            } catch (error) {
                setNotification({
                    type: "error",
                    message: error.message || "Không thể tải danh sách phòng của khách sạn",
                })
            }
        }

        if (hotel?.id) {
            getHotelRooms(hotel.id)
        }
    }, [hotel])

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false} ref={scrollRef}>
            <Text style={styles.subheading}>Loại phòng</Text>
            <View style={styles.tableContainer}>
                {!loading &&
                    hotelRooms.length > 0 &&
                    hotelRooms.map((room, idx) => (
                        <View
                            key={room?.id}
                            style={[
                                styles.tableRow,
                                idx != hotelRooms.length - 1 && {
                                    borderBottomWidth: 1,
                                },
                            ]}>
                            <Text>{room?.name}</Text>
                            <Text>{room?.numberOfGuests} người</Text>
                            <View>
                                {isDiscounted(room?.originalPrice, room?.price) ? (
                                    <>
                                        <Text style={styles.discounted}>
                                            VND {room?.price?.toLocaleString()}
                                        </Text>
                                        <Text style={styles.strikeThrough}>
                                            VND {room?.originalPrice?.toLocaleString()}
                                        </Text>
                                    </>
                                ) : (
                                    <Text>VND {room?.originalPrice?.toLocaleString()}</Text>
                                )}
                            </View>
                            {room?.taxesAndFeesUnderPrice && (
                                <Text style={styles.taxNote}>(Đã bao gồm thuế và phí)</Text>
                            )}
                        </View>
                    ))}
            </View>
        </ScrollView>
    )
}

export default RoomTypes

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.pureWhite,
        paddingHorizontal: 16,
        paddingTop: 40,
        position: "relative",
    },
    subheading: {
        fontSize: 16,
        fontWeight: "bold",
        marginVertical: 12,
    },
    tableContainer: {
        marginTop: 4,
        marginBottom: 65,
        backgroundColor: COLORS.pureWhite,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        shadowColor: COLORS.deepBlack,
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tableRow: {
        flexDirection: "column",
        marginBottom: 16,
        borderColor: COLORS.silverMist,
        paddingBottom: 8,
    },
    discounted: {
        color: COLORS.coralBlaze,
        fontWeight: "bold",
    },
    strikeThrough: {
        textDecorationLine: "line-through",
        color: "gray",
        fontSize: 13,
    },
    taxNote: {
        color: "gray",
        fontSize: 12,
        marginTop: 4,
    },
})
