import { ScrollView, StyleSheet, Text, View } from "react-native"
import { COLORS } from "../constants"
import Section from "../components/Section"
import { useEffect, useRef, useState } from "react"
import { get_Hotel_By_Slug } from "../API/Hotel_API"
import Loading from "../components/Loading"

const hotel = {
    id: 1,
    hotel_link:
        "https://www.booking.com/hotel/vn/v-da-nang.vi.html?label=gen173nr-1BCAEoggI46AdIM1gEaPQBiAEBmAEquAEXyAEM2AEB6AEBiAIBqAIDuAKW7P2-BsACAdICJDkxMmVhYzIwLTI3MzQtNDg3ZS1iOWZiLWRlZjc5NmU4MzAyN9gCBeACAQ&sid=29c32ccf034192589443cdcaa6bb25e2&aid=304142&ucfs=1&arphpl=1&checkin=2025-04-29&checkout=2025-04-30&dest_id=-3712125&dest_type=city&group_adults=2&req_adults=2&no_rooms=1&group_children=0&req_children=0&hpos=1&hapos=1&sr_order=popularity&nflt=ht_id%3D204&srpvid=63652c5f327903e8&srepoch=1744870722&all_sr_blocks=1179585704_390715117_2_1_0_533923&highlighted_blocks=1179585704_390715117_2_1_0_533923&matching_block_id=1179585704_390715117_2_1_0_533923&sr_pri_blocks=1179585704_390715117_2_1_0_533923_90525600&from=searchresults",
    name: "V-Hotel Da Nang Beach",
    address: "510 Võ Nguyên Giáp, Đà Nẵng, Việt Nam",
    description:
        "Nằm ở Đà Nẵng, cách Bãi biển Bắc Mỹ An 4 phút đi bộ, V-Hotel Da Nang Beach cung cấp chỗ nghỉ có xe đạp miễn phí, chỗ đậu xe riêng miễn phí, trung tâm thể dục và phòng chờ chung. Chỗ nghỉ này có các tiện nghi như nhà hàng, dịch vụ đưa đón miễn phí và dịch vụ phòng, cùng với Wi-Fi miễn phí ở toàn bộ chỗ nghỉ. Chỗ nghỉ này cung cấp quầy lễ tân 24 giờ, dịch vụ tiền sảnh và dịch vụ thu đổi ngoại tệ cho khách. Khách sạn sẽ cung cấp cho khách các phòng có điều hòa, bàn làm việc, ấm đun nước, minibar, két an toàn, TV màn hình phẳng và phòng tắm riêng với vòi xịt/chậu rửa vệ sinh. Tại V-Hotel Da Nang Beach, các phòng được thiết kế có ga trải giường và khăn tắm. Chỗ nghỉ có các lựa chọn thực đơn buffet, kiểu Mỹ hoặc kiểu Á cho bữa sáng. Tại chỗ nghỉ, khách có thể sử dụng hồ bơi trong nhà. Khách tại V-Hotel Da Nang Beach sẽ có thể tận hưởng các hoạt động ở trong Đà Nẵng và khu vực xung quanh, như đi xe đạp. Khách sạn cách Bãi biển Mỹ Khê 12 phút đi bộ và Ngũ Hành Sơn 4.4 km.",
    facilities: [
        "Hồ bơi trong nhà",
        "Xe đưa đón sân bay",
        "Phòng không hút thuốc",
        "Trung tâm thể dục",
        "Giáp biển",
        "WiFi miễn phí",
        "Dịch vụ phòng",
        "Chỗ đỗ xe miễn phí",
        "Quầy bar",
        "Bữa sáng rất tốt",
    ],
    highlights: {
        "Hoàn hảo cho kỳ nghỉ 1 đêm!": [
            "Địa điểm hàng đầu: Được khách gần đây đánh giá cao (8,4 điểm)",
        ],
        "Thông tin về bữa sáng": ["Kiểu Á, Kiểu Mỹ, Tự chọn"],
        "Phòng có:": ["Nhìn ra biển"],
        "Thông tin chung": ["Có bãi đậu xe riêng miễn phí ở khách sạn này"],
    },
    reviews: {
        "Nhân viên phục vụ": 9.3,
        "Tiện nghi": 9.0,
        "Sạch sẽ": 9.3,
        "Thoải mái": 9.3,
        "Đáng giá tiền": 9.0,
        "Địa điểm": 8.4,
        "WiFi miễn phí": 10.0,
    },
    room_types: [
        {
            id: 1,
            name: "Phòng Deluxe Giường Đôi Nhìn Ra Thành Phố",
            number_of_guests: 2,
            price: 1018413,
            taxes_and_fees_under_price: true,
            original_price: 2828924,
        },
        {
            id: 2,
            name: "Phòng Deluxe 2 Giường Đơn Nhìn Ra Thành Phố",
            number_of_guests: 2,
            price: 1018413,
            taxes_and_fees_under_price: true,
            original_price: 2546032,
        },
        {
            id: 3,
            name: "Phòng Deluxe 2 Giường Đơn Nhìn Ra Thành Phố",
            number_of_guests: 1,
            price: 987860,
            taxes_and_fees_under_price: true,
            original_price: 2469650,
        },
        {
            id: 4,
            name: "Premier Double Room with Ocean and Mountain View",
            number_of_guests: 2,
            price: 1439394,
            taxes_and_fees_under_price: true,
            original_price: 3598484,
        },
        {
            id: 5,
            name: "Sunrise Twin Room with Ocean View",
            number_of_guests: 2,
            price: 1233766,
            taxes_and_fees_under_price: true,
            original_price: 1233766,
        },
        {
            id: 6,
            name: "V-Royal Suite",
            number_of_guests: 2,
            price: 2604618,
            taxes_and_fees_under_price: true,
            original_price: 6511544,
        },
    ],
    rating_stars: 0,
    image_urls: [
        "https://cf.bstatic.com/xdata/images/hotel/max1024x768/540594120.jpg?k=f87a2a2a25bd53d8e6f65e4b2c1dac3a9b36897be1b4947a55cbe3e00eb9ec9d&o=",
        "https://cf.bstatic.com/xdata/images/hotel/max500/540594079.jpg?k=8700da2669eb500f54d654a6d3909d9c62727204ddbfc8a8e3053418d5b88ed2&o=",
        "https://cf.bstatic.com/xdata/images/hotel/max500/540594100.jpg?k=ebfe99eed88f111ee01c7e5351dd461106b4695b7e199fe58ee378d9a0f33206&o=",
        "https://cf.bstatic.com/xdata/images/hotel/max300/540974167.jpg?k=f939a8bc09836394c82725b4e21cfc4f611333b1a18c5c02b4996250b6da0b9b&o=",
        "https://cf.bstatic.com/xdata/images/hotel/max300/540594126.jpg?k=4c90589edf0de7250d38318985abf63442a84e1fc428323edadeb844c03f8cec&o=",
        "https://cf.bstatic.com/xdata/images/hotel/max300/540594102.jpg?k=811dab956319466ecc0e50a483e0664bd252430a0d42814a4fa8b0db6bcb6547&o=",
        "https://cf.bstatic.com/xdata/images/hotel/max300/540975163.jpg?k=1a97c310c5968c99c34ddeb120b00a48ca2907de6e141580b47c60614efc833c&o=",
        "https://cf.bstatic.com/xdata/images/hotel/max300/542156721.jpg?k=a6e3c88687e89e3a349544fc884613b49af3f1c3e64d1dbb514d19c6a00325e7&o=",
    ],
    room_services: {
        "Phòng tắm": [
            "Giấy vệ sinh",
            "Khăn tắm",
            "Chậu rửa vệ sinh (bidet)",
            "Bồn tắm hoặc Vòi sen",
            "Dép",
            "Phòng tắm riêng",
            "Nhà vệ sinh",
            "Đồ vệ sinh cá nhân miễn phí",
            "Áo choàng tắm",
            "Máy sấy tóc",
            "Bồn tắm",
            "Vòi sen",
        ],
        "Phòng ngủ": ["Ra trải giường", "Tủ hoặc phòng để quần áo"],
        "Tầm nhìn": ["Tầm nhìn ra khung cảnh"],
        "Ngoài trời": ["Bàn ghế ngoài trời", "Giáp biển", "Sân thượng / hiên"],
        "Nhà bếp": ["Ấm đun nước điện"],
        "Tiện ích trong phòng": ["Ổ điện gần giường", "Giá treo quần áo"],
        "Hoạt động": ["Cho thuê xe đạp", "Bãi biển", "Xe đạp"],
        "Khu vực phòng khách": ["Bàn làm việc"],
        "Truyền thông & Công nghệ": [
            "TV màn hình phẳng",
            "Truyền hình vệ tinh",
            "Điện thoại",
            "TV",
        ],
        "Đồ ăn & thức uống": [
            "Rượu vang/sâm panh",
            "Quầy bar (đồ ăn nhẹ)",
            "Quầy bar",
            "Minibar",
            "Nhà hàng",
        ],
        "Dịch vụ lễ tân": [
            "Có xuất hóa đơn",
            "Nhận/trả phòng riêng",
            "Dịch vụ trợ giúp đặc biệt",
            "Giữ hành lí",
            "Bàn bán tour",
            "Thu đổi ngoại tệ",
            "Nhận/trả phòng cấp tốc",
            "Lễ tân 24 giờ",
        ],
        "Dịch vụ lau dọn": ["Dọn phòng hàng ngày", "Dịch vụ là (ủi)", "Giặt khô", "Giặt ủi"],
        "Dịch vụ cho doanh nhân": [
            "Fax/photocopy",
            "Trung tâm dịch vụ doanh nhân",
            "Tiện nghi tổ chức hội họp/tiệc",
        ],
        "An ninh": [
            "Bình chữa cháy",
            "Hệ thống CCTV bên ngoài chỗ nghỉ",
            "Hệ thống CCTV trong khu vực chung",
            "Thiết bị báo cháy",
            "Báo động an ninh",
            "Ổ khóa mở bằng thẻ",
            "Bảo vệ 24/7",
            "Két an toàn",
        ],
        "Tổng quát": [
            "Giao nhận đồ tạp hóa",
            "Khu vực xem TV/sảnh chung",
            "Không gây dị ứng",
            "Khu vực cho phép hút thuốc",
            "Điều hòa nhiệt độ",
            "Cấm hút thuốc trong toàn bộ khuôn viên",
            "Phòng không gây dị ứng",
            "Dịch vụ báo thức",
            "Sàn lát gỗ",
            "Phòng cách âm",
            "Thang máy",
            "Phòng gia đình",
            "Tiện nghi cho khách khuyết tật",
            "Xe đưa đón sân bay",
            "Phòng không hút thuốc",
            "Dịch vụ báo thức",
            "Dịch vụ phòng",
        ],
        "Hồ bơi trong nhà": [
            "Giờ mở cửa",
            "Mở cửa quanh năm",
            "Dành cho mọi độ tuổi",
            "Hồ bơi có tầm nhìn",
            "Cầu trượt nước",
        ],
        "Chăm sóc sức khỏe": [
            "Phòng gym",
            "Mát-xa toàn thân",
            "Mát-xa tay",
            "Mát-xa đầu",
            "Mát-xa dành cho cặp đôi",
            "Mát-xa chân",
            "Mát-xa cổ",
            "Mát-xa lưng",
            "Massage",
            "Trung tâm thể dục",
            "Phòng xông hơi",
        ],
        "Ngôn ngữ được sử dụng": ["Tiếng Anh", "Tiếng Việt"],
    },
    slug: "v-hotel-da-nang-beach",
    latitude: 16.0378012,
    longitude: 108.2502565,
    district: "Ngũ Hành Sơn",
}

const ServicesHotel = ({ slug }) => {
    const scrollRef = useRef()

    const [hotel, setHotel] = useState(null)
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

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false} ref={scrollRef}>
            <Text style={styles.subheading}>Các tiện nghi của {hotel?.name}</Text>
            {!loading &&
                hotel?.roomServices &&
                Object.entries(hotel?.roomServices).map(([sectionTitle, items], i) => (
                    <Section key={i} title={sectionTitle} items={items} />
                ))}

            <View style={{ borderBottomWidth: 1, marginTop: 20, borderColor: COLORS.silver }} />
        </ScrollView>
    )
}

export default ServicesHotel

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.pureWhite,
        paddingHorizontal: 16,
        paddingTop: 40,
        position: "relative",
    },
    subheading: {
        fontSize: 18,
        fontWeight: "bold",
        marginVertical: 12,
    },
})
