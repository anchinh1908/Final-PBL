import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
// import { useRoute } from "@react-navigation/native"
import { StyleSheet, Text, View } from "react-native"
import { COLORS } from "../constants"
import FontAwesome6 from "@expo/vector-icons/FontAwesome6"
import { Logout } from "../screens"

const Tab = createBottomTabNavigator()

const Manager_Hotels = () => {
    return <View style={styles.container}></View>
}

const Manager_Places = () => {
    return <View style={styles.container}></View>
}

const Manager_Users = () => {
    return <View style={styles.container}></View>
}

const Manager_Logout = () => {
    return <Logout />
}

const AdminBottomTab = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName
                    if (route.name === "Khách sạn") {
                        iconName = "circle-info"
                    } else if (route.name === "Địa điểm") {
                        iconName = "bell-concierge"
                    } else if (route.name === "Người dùng") {
                        iconName = "bed"
                    } else if (route.name === "Đăng xuất") {
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
            <Tab.Screen name="Khách sạn" component={Manager_Hotels} />
            <Tab.Screen name="Địa điểm" component={Manager_Places} />
            <Tab.Screen name="Người dùng" component={Manager_Users} />
            <Tab.Screen name="Đăng xuất" component={Manager_Logout} />
        </Tab.Navigator>
    )
}

export default AdminBottomTab

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.baseBackground,
    },
})
