import { useNavigation } from "@react-navigation/native"
import { useEffect, useState } from "react"
import { ScrollView, StyleSheet, View } from "react-native"
import { HeaderBack } from "../components"
import HotelItem from "../components/HotelItem"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { get_Hotel_By_ID } from "../API/Hotel_API"

const ViewHistory = () => {
    const navigation = useNavigation()
    const [hotels, setHotels] = useState([])

    const getHotelById = async (hotelId) => {
        try {
            const product = await get_Hotel_By_ID(hotelId)

            if (product) {
                const hotel = product.hotel.hotel

                setHotels((prev) => [...prev, { hotel: hotel }])
            }
        } catch (error) {
            console.log(error.message || "Không lấy được thông tin")
        }
    }

    useEffect(() => {
        const getHistory = async () => {
            const historyJson = await AsyncStorage.getItem("viewed_hotels")
            const history = historyJson ? JSON.parse(historyJson) : []

            if (history.length > 0) {
                const addHotelPromises = history.map((item) => {
                    return getHotelById(item)
                })

                await Promise.all(addHotelPromises)
            }
        }

        getHistory()
    }, [])

    return (
        <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
            <HeaderBack navigation={navigation} title="Lịch sử xem" />

            {hotels.length > 0 &&
                hotels.map((hotel) => <HotelItem key={hotel?.hotel?.id} item={hotel} />)}
        </ScrollView>
    )
}

export default ViewHistory

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
})
