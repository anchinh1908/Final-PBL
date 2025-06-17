import { useNavigation } from "@react-navigation/native"
import { useEffect, useState } from "react"
import { ScrollView, StyleSheet, Text, View } from "react-native"
import { Checkbox } from "react-native-paper"
import { district } from "../utils/district"
import { COLORS } from "../constants"
import PlaceItem from "../components/PlaceItem"
import { HeaderBack } from "../components"
import usePlaceContext from "../hooks/usePlaceContext"
import { get_All_Places, search_Places_By_District } from "../API/Place_API"

const PlaceList = () => {
    const navigation = useNavigation()
    const [districtsSelected, setDistrictsSelected] = useState("")
    const { places, dispatch } = usePlaceContext()

    const [loading, setLoading] = useState(false)

    const handleAmenitiesChange = (item) => {
        // setDistrictsSelected((prev) =>
        //     prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
        // )
        setDistrictsSelected((prev) => (prev !== item ? item : ""))
    }

    const getAllPlaces = async (page, size) => {
        try {
            setLoading(true)
            const { data, totalPages, currentPage } = await get_All_Places(page, size)

            dispatch({
                type: "FETCH_PLACES",
                payload: {
                    places: data,
                    totalPages,
                    currentPage,
                },
            })
        } catch (error) {
            Alert.alert("Lỗi", error.message || "Không thể tải danh sách địa điểm")
        } finally {
            setLoading(false)
        }
    }

    const searchPlaces = async (district) => {
        try {
            setLoading(true)
            const { data, totalPages, currentPage } = await search_Places_By_District(district)

            dispatch({
                type: "FETCH_PLACES",
                payload: {
                    places: data,
                    totalPages,
                    currentPage,
                },
            })
        } catch (error) {
            Alert.alert("Lỗi", error.message || "Không thể tải danh sách địa điểm")
            dispatch({
                type: "FETCH_PLACES",
                payload: {
                    places: [],
                    totalPages: 1,
                    currentPage: 1,
                },
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getAllPlaces(1, 100)
    }, [])

    useEffect(() => {
        if (districtsSelected) searchPlaces(districtsSelected)
    }, [districtsSelected])

    return (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <HeaderBack navigation={navigation} title="Địa điểm du lịch" />

            <View>
                <Text style={styles.sidebarTitle}>Khu vực</Text>
                <View style={styles.grid}>
                    {district.map((item, idx) => (
                        <View key={idx} style={styles.checkboxRow}>
                            <Checkbox
                                status={districtsSelected === item ? "checked" : "unchecked"}
                                onPress={() => handleAmenitiesChange(item)}
                                color={COLORS.oceanSlate}
                                uncheckedColor={COLORS.slateGray}
                            />
                            <Text style={styles.checkboxLabel}>{item}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {!loading && (
                <View style={styles.grid}>
                    {places.map((item) => (
                        <PlaceItem
                            key={item?.id}
                            item={item}
                            onPress={() => navigation.navigate("PlaceDetail", { slug: item?.slug })}
                        />
                    ))}
                </View>
            )}
        </ScrollView>
    )
}

export default PlaceList

const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 12,
        backgroundColor: COLORS.pureWhite,
    },
    sidebarTitle: {
        fontWeight: "bold",
        fontSize: 18,
        marginVertical: 12,
    },
    checkboxRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: -6,
        width: "48%",
    },
    checkboxLabel: {
        marginTop: 2,
        fontSize: 14,
    },
    grid: {
        flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 12,
    },
})
