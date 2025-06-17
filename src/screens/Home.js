import React, { useEffect, useState } from "react"
import {
    View,
    Text,
    TextInput,
    Image,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { MaterialIcons, AntDesign } from "@expo/vector-icons"
import { COLORS, images } from "../constants"
import { HeaderHome } from "../components"
import Slider from "../components/Slider"
import HotelItem from "../components/HotelItem"
import { get_All_Hotels, get_Top_5_Hotels } from "../API/Hotel_API"
import useHotelContext from "../hooks/useHotelContext"
import usePlaceContext from "../hooks/usePlaceContext"
import { get_All_Places } from "../API/Place_API"
import { useAuthContext } from "../hooks/useAuthContext"

const Home = () => {
    const navigation = useNavigation()
    const [scrollY, setScrollY] = useState(0)
    const { user } = useAuthContext()

    const [topHotels, setTopHotels] = useState([])
    const [searchInput, setSearchInput] = useState("")

    const { hotels, dispatch: hotelDispatch } = useHotelContext()
    const { places, dispatch: placeDispatch } = usePlaceContext()

    useEffect(() => {
        if (user?.role === "USER") navigation.navigate("Home")
        else if (user?.role === "ADMIN") navigation.navigate("AdminBottomTab")
    }, [user])

    useEffect(() => {
        const getAllHotels = async () => {
            try {
                const { data, totalPages, currentPage } = await get_All_Hotels()

                hotelDispatch({
                    type: "FETCH_HOTELS",
                    payload: {
                        hotels: data,
                        totalPages,
                        currentPage,
                    },
                })
            } catch (error) {
                console.log("Lỗi khi lấy danh sách khách sạn:", error)
            }
        }

        const getTopHotels = async () => {
            try {
                const { data } = await get_Top_5_Hotels()
                setTopHotels(data)
            } catch (error) {
                console.log("Lỗi khi lấy danh sách top khách sạn:", error)
            }
        }

        const getAllPlaces = async () => {
            try {
                const { data, totalPages, currentPage } = await get_All_Places()

                placeDispatch({
                    type: "FETCH_PLACES",
                    payload: {
                        places: data,
                        totalPages,
                        currentPage,
                    },
                })
            } catch (error) {
                console.log("Lỗi khi lấy danh sách địa điểm:", error)
            }
        }

        getAllHotels()
        getTopHotels()
        getAllPlaces()
    }, [])

    return (
        <View style={{ flex: 1, position: "relative" }}>
            {scrollY > 80 && (
                <HeaderHome title="TRANG CHỦ" navigation={navigation} scrollY={scrollY} />
            )}

            <ScrollView
                style={{ flex: 1, position: "relative" }}
                showsVerticalScrollIndicator={false}
                onScroll={(event) => {
                    setScrollY(event.nativeEvent.contentOffset.y)
                }}
                scrollEventThrottle={16}>
                <Image
                    source={images.banner}
                    style={{ width: "100%", height: 390, resizeMode: "cover", borderRadius: 16 }}
                />

                {scrollY < 80 && <HeaderHome navigation={navigation} scrollY={scrollY} />}

                <View style={styles.searchContainer}>
                    <Text style={{ fontSize: 16, marginBottom: 4, fontWeight: "600" }}>
                        Bạn muốn tìm kiếm khách sạn?
                    </Text>
                    <TextInput
                        value={searchInput}
                        onChangeText={(value) => setSearchInput(value)}
                        style={styles.input}
                        placeholder="Khách sạn cần đáp ứng yêu cầu gì?"
                    />
                    <TouchableOpacity
                        onPress={() => navigation.navigate("HotelList", { searchKey: searchInput })}
                        style={styles.searchButton}>
                        <Text
                            style={{
                                color: COLORS.pureWhite,
                                textAlign: "center",
                                fontWeight: "bold",
                            }}>
                            Tìm kiếm
                        </Text>
                        <MaterialIcons
                            name="arrow-forward-ios"
                            size={14}
                            color={COLORS.pureWhite}
                        />
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Khách sạn nổi bật</Text>
                <Slider hotels={topHotels.slice(0, 6)} />

                <View style={styles.headerContainer}>
                    <Text style={styles.sectionTitle}>Tất cả khách sạn</Text>
                    <TouchableOpacity
                        style={styles.seeAllButton}
                        onPress={() => navigation.navigate("HotelList")}>
                        <Text style={styles.seeAll}>Xem tất cả</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ marginHorizontal: 16 }}>
                    {hotels.slice(0, 6).map((item) => (
                        <HotelItem key={item?.hotel?.id} item={item} />
                    ))}
                </View>

                <View style={styles.headerContainer}>
                    <Text style={styles.sectionTitle}>Địa điểm du lịch</Text>
                    <TouchableOpacity
                        style={styles.seeAllButton}
                        onPress={() => navigation.navigate("PlaceList")}>
                        <Text style={styles.seeAll}>Xem tất cả</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    horizontal
                    style={{ marginBottom: 16 }}
                    showsHorizontalScrollIndicator={false}>
                    {places.slice(0, 10).map((item, idx) => (
                        <TouchableOpacity
                            key={item?.id}
                            onPress={() => navigation.navigate("PlaceDetail", { slug: item?.slug })}
                            style={[
                                styles.placeCard,
                                idx === 0 && { marginLeft: 16 },
                                idx === places.length - 1 && { marginRight: 16 },
                            ]}>
                            <Image source={{ uri: item?.imageUrl }} style={styles.placeImage} />
                            <View style={styles.overlay}>
                                <Text style={{ color: COLORS.pureWhite }}>{item?.title}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    searchContainer: {
        margin: 16,
        padding: 16,
        backgroundColor: COLORS.pureWhite,
        borderRadius: 20,
        elevation: 3,
        marginTop: -78,
    },
    searchButton: {
        backgroundColor: COLORS.coralBlaze,
        marginVertical: 6,
        padding: 10,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    input: {
        backgroundColor: COLORS.silverMist,
        marginVertical: 6,
        padding: 10,
        borderRadius: 8,
    },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.clear,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        margin: 16,
    },
    seeAllButton: {
        padding: 16,
    },
    seeAll: {
        fontSize: 14,
        color: COLORS.oceanSlate,
        fontWeight: "600",
    },
    placeCard: {
        width: 200,
        height: 150,
        borderRadius: 10,
        overflow: "hidden",
        position: "relative",
        marginRight: 12,
    },
    placeImage: {
        width: "100%",
        height: "100%",
    },
    overlay: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        height: 50,
        backgroundColor: COLORS.shadowBlack,
        justifyContent: "center",
        alignItems: "center",
    },
})

export default Home
