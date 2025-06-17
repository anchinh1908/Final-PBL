import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { useRoute } from "@react-navigation/native"
import { StyleSheet, Text, View } from "react-native"
import { COLORS } from "../constants"
import FontAwesome6 from "@expo/vector-icons/FontAwesome6"
import { windowHeight } from "../utils/Dimentions"
import DescriptionHotel from "../screens/DescriptionHotel"
import ServicesHotel from "../screens/ServicesHotel"
import RoomTypes from "../screens/RoomTypes"
import { HotelHistory, PlaceHistory } from "../screens"

const Tab = createBottomTabNavigator()

const Hotel_History = () => {
    return <HotelHistory />
}

const Place_History = () => {
    return <PlaceHistory />
}

const ViewHistory = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName
                    if (route.name === "Khách sạn") iconName = "hotel"
                    else if (route.name === "Địa điểm") iconName = "magnifying-glass-location"

                    return <FontAwesome6 name={iconName} size={20} color={color} />
                },
                tabBarActiveTintColor: COLORS.oceanSlate,
                tabBarInactiveTintColor: COLORS.deepBlack,
                tabBarLabel: ({ focused, color }) => (
                    <Text
                        style={{
                            fontSize: focused ? 14 : 12,
                            fontWeight: focused ? "bold" : "normal",
                            color: color,
                            marginBottom: 5,
                        }}>
                        {route.name}
                    </Text>
                ),
                tabBarStyle: {
                    height: windowHeight / 10,
                    elevation: 4,
                    paddingBottom: 10,
                    backgroundColor: COLORS.pureWhite,
                },
            })}>
            <Tab.Screen name="Khách sạn" component={Hotel_History} />
            <Tab.Screen name="Địa điểm" component={Place_History} />
        </Tab.Navigator>
    )
}

export default ViewHistory

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.pureWhite,
    },
    descriptionSpecialty: {
        textAlign: "justify",
        margin: 15,
    },
})
