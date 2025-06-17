import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { useRoute } from "@react-navigation/native"
import { StyleSheet, Text, View } from "react-native"
import { COLORS } from "../constants"
import FontAwesome6 from "@expo/vector-icons/FontAwesome6"
import { windowHeight } from "../utils/Dimentions"
import DescriptionHotel from "../screens/DescriptionHotel"
import ServicesHotel from "../screens/ServicesHotel"
import RoomTypes from "../screens/RoomTypes"

const Tab = createBottomTabNavigator()

const Description_Hotel = ({ route, navigation }) => {
    const { slug } = route.params || {}
    return (
        <View style={styles.container}>
            <DescriptionHotel slug={slug} />
        </View>
    )
}

const Services_Hotel = ({ route, navigation }) => {
    const { slug } = route.params || {}
    return <ServicesHotel slug={slug} />
}

const Room_Types = ({ route, navigation }) => {
    const { slug } = route.params || {}
    return <RoomTypes slug={slug} />
}

const HotelBottomTab = () => {
    const route = useRoute()
    const { slug } = route.params || {}

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName
                    if (route.name === "Giới thiệu") {
                        iconName = "circle-info"
                    } else if (route.name === "Tiện nghi") {
                        iconName = "bell-concierge"
                    } else if (route.name === "Phòng") {
                        iconName = "bed"
                    }
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
            <Tab.Screen name="Giới thiệu" component={Description_Hotel} initialParams={{ slug }} />
            <Tab.Screen name="Tiện nghi" component={Services_Hotel} initialParams={{ slug }} />
            <Tab.Screen name="Phòng" component={Room_Types} initialParams={{ slug }} />
        </Tab.Navigator>
    )
}

export default HotelBottomTab

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
