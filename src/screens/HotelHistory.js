import { ScrollView, StyleSheet, View } from "react-native"
import { HeaderBack } from "../components"
import HotelItem from "../components/HotelItem"
import { COLORS } from "../constants"
import { useNavigation } from "@react-navigation/native"

const hotels = [
    {
        id: 1,
        name: "Khách sạn Mặt Trời Vàng",
        slug: "khach-san-mat-troi-vang",
        description:
            "Nằm ở trung tâm thành phố, tiện nghi hiện đại, cách biển 5 phút đi bộ. Khách sạn tiêu chuẩn 3 sao, gần sân bay, có bãi đỗ xe miễn phí. Khách sạn tiêu chuẩn 3 sao, gần sân bay, có bãi đỗ xe miễn phí. Khách sạn tiêu chuẩn 3 sao, gần sân bay, có bãi đỗ xe miễn phí.",
        rating_stars: 4,
        reviews_avr: 9.3,
        image_urls:
            "https://cf.bstatic.com/xdata/images/hotel/max1024x768/592530868.jpg?k=b37ad4b453fa5176b797fbb74f4aede984767c8567a987ba2928e1892e346c2f&o=",
        facilities: ["Wi-Fi miễn phí", "Bể bơi", "Nhà hàng", "Lễ tân 24/7"],
        room_types: [
            { name: "Phòng tiêu chuẩn", number_of_guests: 2, price: 950000 },
            { name: "Phòng gia đình", number_of_guests: 4, price: 1350000 },
        ],
        wishlist: true,
    },
    {
        id: 2,
        name: "Khách sạn Biển Xanh",
        slug: "khach-san-bien-xanh",
        description: "Phòng hướng biển, gần khu du lịch và chợ đêm.",
        rating_stars: 3,
        reviews_avr: 7.5,
        image_urls:
            "https://cf.bstatic.com/xdata/images/hotel/max500/592530892.jpg?k=af745da3b8281ea5e90b3839414412deea36839c0b1a377d8d55c280068a1181&o=",
        facilities: ["Hướng biển", "Chỗ đỗ xe", "Dịch vụ giặt là"],
        room_types: [
            { name: "Phòng đôi", number_of_guests: 2, price: 780000 },
            { name: "Phòng ban công biển", number_of_guests: 2, price: 980000 },
        ],
        wishlist: true,
    },
    {
        id: 3,
        name: "Khách sạn Thành Đạt",
        slug: "khach-san-thanh-dat",
        description: "Khách sạn tiêu chuẩn 3 sao, gần sân bay, có bãi đỗ xe miễn phí.",
        rating_stars: 3,
        reviews_avr: 3.8,
        image_urls:
            "https://cf.bstatic.com/xdata/images/hotel/max300/592530929.jpg?k=575b0e3186ddb444c75bdfa77e8ef9ac660cc012cbbb56df1e53186c8e5cef13&o=",
        facilities: ["Gần sân bay", "Bãi đỗ xe", "Wi-Fi", "Thang máy"],
        room_types: [
            { name: "Phòng đơn", number_of_guests: 1, price: 550000 },
            { name: "Phòng đôi", number_of_guests: 2, price: 690000 },
        ],
        wishlist: true,
    },
    {
        id: 4,
        name: "Khách sạn Biển Xanh",
        slug: "khach-san-bien-xanh-1",
        description: "Phòng hướng biển, gần khu du lịch và chợ đêm.",
        rating_stars: 3,
        reviews_avr: 7.5,
        image_urls:
            "https://cf.bstatic.com/xdata/images/hotel/max500/592530892.jpg?k=af745da3b8281ea5e90b3839414412deea36839c0b1a377d8d55c280068a1181&o=",
        facilities: ["Hướng biển", "Chỗ đỗ xe", "Dịch vụ giặt là"],
        room_types: [
            { name: "Phòng đôi", number_of_guests: 2, price: 780000 },
            { name: "Phòng ban công biển", number_of_guests: 2, price: 980000 },
        ],
        wishlist: true,
    },
    {
        id: 5,
        name: "Khách sạn Thành Đạt",
        slug: "khach-san-thanh-dat-1",
        description: "Khách sạn tiêu chuẩn 3 sao, gần sân bay, có bãi đỗ xe miễn phí.",
        rating_stars: 3,
        reviews_avr: 3.8,
        image_urls:
            "https://cf.bstatic.com/xdata/images/hotel/max300/592530929.jpg?k=575b0e3186ddb444c75bdfa77e8ef9ac660cc012cbbb56df1e53186c8e5cef13&o=",
        facilities: ["Gần sân bay", "Bãi đỗ xe", "Wi-Fi", "Thang máy"],
        room_types: [
            { name: "Phòng đơn", number_of_guests: 1, price: 550000 },
            { name: "Phòng đôi", number_of_guests: 2, price: 690000 },
        ],
        wishlist: true,
    },
]

const HotelHistory = () => {
    const navigation = useNavigation()
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <HeaderBack navigation={navigation} title="Khách sạn đã xem" />

            {hotels.map((item) => (
                <HotelItem key={item.id} item={item} showHeartIcon={false} />
            ))}

            <View style={{ marginBottom: 32 }} />
        </ScrollView>
    )
}

export default HotelHistory

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: COLORS.pureWhite,
    },
})
