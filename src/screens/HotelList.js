import React, { useEffect, useRef, useState } from "react"
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Feather, FontAwesome } from "@expo/vector-icons"
import HotelItem from "../components/HotelItem"
import { COLORS } from "../constants"
import { HeaderBack } from "../components"
import HotelBottomSheet from "../components/HotelBottomSheet"
import { get_All_Hotels, search_Hotels_By_Model } from "../API/Hotel_API"

const minSlider = 100000
const maxSlider = 4000000

const HotelList = ({ route }) => {
    const { searchKey } = route.params || {}
    const navigation = useNavigation()
    const [amenities, setAmenities] = useState([])
    const [priceSlider, setPriceSlider] = useState([minSlider, maxSlider])
    const [bedroomNumber, setBedroomNumber] = useState(0)
    // const [bathroomNumber, setBathroomNumber] = useState(0)
    const [quality, setQuality] = useState()
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)

    const [hotels, setHotels] = useState([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [searchInput, setSearchInput] = useState("")
    const [hasMore, setHasMore] = useState(true)

    const refRBSheet = useRef()

    const openBottomSheet = () => {
        console.log("open")
        refRBSheet.current.open()
        setIsBottomSheetOpen(true)
    }

    const closeBottomSheet = () => {
        console.log("close")
        setIsBottomSheetOpen(false)
    }

    const getAllHotels = async (pageToLoad) => {
        try {
            console.log(amenities, priceSlider, bedroomNumber, quality);
            
            const { data, totalPages: fetchedTotalPages } = await get_All_Hotels(
                pageToLoad,
                20,
                amenities,
                priceSlider[1],
                priceSlider[0],
                bedroomNumber,
                quality
            )
            if (pageToLoad === 1) {
                setHotels(data)
            } else {
                setHotels((prev) => [...prev, ...data])
            }

            setPage(pageToLoad)
            setTotalPages(fetchedTotalPages)
            setHasMore(pageToLoad < fetchedTotalPages)
        } catch (error) {
            console.log("Lỗi tải khách sạn:", error.message)
        } finally {
            setIsLoading(false)
            console.log("xong")
        }
    }

    const getHotelsBySearchKey = async (pageToLoad, query) => {
        try {
            const { hotels: data, totalPages: fetchedTotalPages } = await search_Hotels_By_Model(
                query,
                pageToLoad
            )
            if (pageToLoad === 1) {
                setHotels(data)
            } else {
                setHotels((prev) => [...prev, ...data])
            }

            setPage(pageToLoad)
            setTotalPages(fetchedTotalPages)
            setHasMore(pageToLoad < fetchedTotalPages)
        } catch (error) {
            console.log("Lỗi tải khách sạn:", error.message)
        } finally {
            setIsLoading(false)
            console.log("xong")
        }
    }

    const fetchHotels = async (pageToLoad = 1, query = searchInput) => {
        if (isLoading || !hasMore) return

        setIsLoading(true)

        if (pageToLoad === 1) setHotels([])
        console.log("đang loading ...")

        try {
            if (query) {
                await getHotelsBySearchKey(pageToLoad, query)
                setAmenities([])
                setPriceSlider([minSlider, maxSlider])
                setBedroomNumber(0)
                setQuality()
            } else {
                await getAllHotels(pageToLoad)
                setSearchInput("")
            }
        } finally {
            setIsLoading(false)
        }
    }

    // useEffect(() => {
    //     if (!searchKey) fetchHotels(1)
    // }, [])

    useEffect(() => {
        if (searchKey) {
            setSearchInput(searchKey)
            fetchHotels(1, searchKey)
        }
    }, [searchKey])

    useEffect(() => {
        if (!isBottomSheetOpen) {
            setSearchInput("")
            fetchHotels(1, "")
        }
    }, [isBottomSheetOpen])

    const handleLoadMore = () => {
        if (!isLoading && hasMore) {
            fetchHotels(page + 1)
        }
    }

    const handleLoadSearch = async () => {
        if (isLoading) return

        setIsLoading(true)
        setHotels([])

        try {
            if (searchInput) {
                setAmenities([])
                setPriceSlider([minSlider, maxSlider])
                setBedroomNumber(0)
                setQuality()
                await getHotelsBySearchKey(1, searchInput)
            } else {
                setSearchInput("")
                await getAllHotels(1)
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <HeaderBack navigation={navigation} title="Khách sạn" />

            <View style={styles.searchContainer}>
                <View style={styles.searchButton}>
                    <FontAwesome
                        name="search"
                        size={16}
                        color={COLORS.silver}
                        style={styles.btnSearch}
                    />
                    <TextInput
                        style={styles.textInput}
                        placeholder="Search"
                        value={searchInput}
                        onChangeText={(query) => setSearchInput(query)}
                    />
                    <TouchableOpacity onPress={() => handleLoadSearch()} disabled={isLoading}>
                        <Feather
                            name="send"
                            size={16}
                            color={isLoading ? COLORS.aquaMist : COLORS.oceanSlate}
                            style={styles.btnSearch}
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.btnFilter} onPress={openBottomSheet}>
                    <FontAwesome name="filter" size={20} color={COLORS.sunsetOrange} />
                </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Danh sách khách sạn</Text>
            {hotels.map((item) => (
                <HotelItem key={item.hotel.id} item={item} />
            ))}

            {!isLoading && hasMore && (
                <TouchableOpacity onPress={() => handleLoadMore()} style={styles.viewButton}>
                    <Text style={{ color: COLORS.pureWhite }}>MORE</Text>
                </TouchableOpacity>
            )}

            {isLoading && <ActivityIndicator size="small" color={COLORS.oceanSlate} />}

            <View style={{ marginBottom: 16 }} />

            <HotelBottomSheet
                bottomSheetRef={refRBSheet}
                amenities={amenities}
                setAmenities={setAmenities}
                budget={priceSlider}
                setBudget={setPriceSlider}
                bedroom={bedroomNumber}
                setBedroom={setBedroomNumber}
                quality={quality}
                setQuality={setQuality}
                onClose={() => closeBottomSheet()}
            />
        </ScrollView>
    )
}

export default HotelList

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: COLORS.pureWhite,
    },
    sectionTitle: {
        fontWeight: "bold",
        fontSize: 18,
        marginVertical: 12,
    },
    searchContainer: {
        paddingTop: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 16,
        height: 62,
    },
    searchButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.silverMist,
        borderRadius: 10,
    },
    textInput: {
        flex: 1,
        paddingVertical: 8,
    },
    btnSearch: {
        marginHorizontal: 8,
    },
    btnFilter: {
        backgroundColor: COLORS.creamyIvory,
        borderRadius: 8,
        marginStart: 5,
        height: 35,
        width: 35,
        alignItems: "center",
        justifyContent: "center",
    },
    viewButton: {
        marginTop: 8,
        marginBottom: 20,
        backgroundColor: COLORS.oceanSlate,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
    },
})
