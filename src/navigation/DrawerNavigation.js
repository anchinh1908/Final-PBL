import { createDrawerNavigator, DrawerItemList } from "@react-navigation/drawer"
import Ionicons from "@expo/vector-icons/Ionicons"
import {
    BookingHistory,
    ChatWidget,
    DoctorAppointment,
    Forum,
    Home,
    Login,
    Logout,
    Myappointment,
    RecyclingBin,
    UserProfile,
} from "../screens"
import { SafeAreaView } from "react-native-safe-area-context"
import { COLORS } from "../constants"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { DrawerContent } from "../components"
// import { useAuth } from "../AuthProvider"
import HotelList from "../screens/HotelList"
import PlaceList from "../screens/PlaceList"
import { useAuthContext } from "../hooks/useAuthContext"
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const Drawer = createDrawerNavigator()

const DrawerNavigation = () => {
    // const { isLoggedIn, account } = useAuth()
    const { user } = useAuthContext()

    return (
        <Drawer.Navigator
            drawerContent={(props) => {
                return (
                    <SafeAreaView>
                        <DrawerContent navigation={props.navigation} />
                        <DrawerItemList {...props} />
                    </SafeAreaView>
                )
            }}
            screenOptions={{
                drawerStyle: {
                    // marginTop: 32,
                    backgroundColor: COLORS.pureWhite,
                    width: 250,
                    borderTopRightRadius: 25,
                    borderBottomRightRadius: 25,
                },
                headerStyle: {
                    backgroundColor: COLORS.pureWhite,
                },
                headerShown: false,
                drawerActiveTintColor: COLORS.coralBlaze, // Màu của icon và label khi selected
                drawerActiveBackgroundColor: COLORS.creamyIvory,
                drawerInactiveTintColor: COLORS.deepBlack, // Màu của icon và label khi không selected
            }}>
            <Drawer.Screen
                name="Home"
                options={{
                    drawerLabel: "Home",
                    title: "Home",
                    headerShadowVisible: false,
                    drawerIcon: ({ color }) => (
                        <Ionicons name="home-outline" size={24} color={color} />
                    ),
                }}
                component={Home}
            />
            {/* {user?.email && (
                <Drawer.Screen
                    name="BookingHistory"
                    options={{
                        drawerLabel: "Hồ sơ khám bệnh",
                        title: "Myappointment",
                        headerShadowVisible: false,
                        drawerIcon: ({ color }) => (
                            <MaterialIcons name="calendar-month" size={24} color={color} />
                        ),
                    }}
                    component={account?.__t === "Doctor" ? DoctorAppointment : Myappointment}
                />
            )} */}

            <Drawer.Screen
                name="HotelList"
                options={{
                    drawerLabel: "Khách sạn",
                    title: "HotelList",
                    headerShadowVisible: false,
                    drawerIcon: ({ color }) => (
                        <MaterialIcons name="hotel" size={24} color={color} />
                    ),
                }}
                component={HotelList}
            />

            <Drawer.Screen
                name="PlaceList"
                options={{
                    drawerLabel: "Địa điểm du lịch",
                    title: "PlaceList",
                    headerShadowVisible: false,
                    drawerIcon: ({ color }) => (
                        <MaterialIcons name="location-city" size={24} color={color} />
                    ),
                }}
                component={PlaceList}
            />

            <Drawer.Screen
                name="Chatbot"
                options={{
                    drawerLabel: "Chatbot AI",
                    title: "Chatbot",
                    headerShadowVisible: false,
                    drawerIcon: ({ color }) => (
                        <MaterialCommunityIcons name="robot" size={24} color={color} />
                    ),
                }}
                component={ChatWidget}
            />

            {/* <Drawer.Screen
                name="Forum"
                options={{
                    drawerLabel: "Diễn đàn",
                    title: "Forum",
                    headerShadowVisible: false,
                    drawerIcon: ({ color }) => (
                        <MaterialIcons name="forum" size={24} color={color} />
                    ),
                }}
                component={Forum}
            /> */}

            {/* {user?.email && account?.__t === "Doctor" && (
                <Drawer.Screen
                    name="RecyclingBin"
                    options={{
                        drawerLabel: "Thùng rác",
                        title: "RecyclingBin",
                        headerShadowVisible: false,
                        drawerIcon: ({ color }) => (
                            <MaterialIcons name="delete" size={24} color={color} />
                        ),
                    }}
                    component={RecyclingBin}
                />
            )} */}

            {user?.email ? (
                <>
                    <Drawer.Screen
                        name="User"
                        options={{
                            drawerLabel: "Tài khoản",
                            title: "UserProfile",
                            headerShadowVisible: false,
                            drawerIcon: ({ color }) => (
                                <MaterialIcons name="account-circle" size={24} color={color} />
                            ),
                        }}
                        component={UserProfile}
                    />
                    <Drawer.Screen
                        name="Logout"
                        options={{
                            drawerLabel: "Đăng xuất",
                            title: "Logout",
                            headerShadowVisible: false,
                            drawerIcon: ({ color }) => (
                                <MaterialIcons name="logout" size={24} color={color} />
                            ),
                            // drawerLabelPress: ({ navigation }) => handleLogout(navigation),
                        }}
                        component={Logout} // Sử dụng component Logout vừa tạo
                    />
                </>
            ) : (
                <Drawer.Screen
                    name="Login"
                    options={{
                        drawerLabel: "Đăng nhập",
                        title: "Login",
                        headerShadowVisible: false,
                        drawerIcon: ({ color }) => (
                            <MaterialIcons name="account-circle" size={24} color={color} />
                        ),
                    }}
                    component={Login}
                />
            )}
        </Drawer.Navigator>
    )
}

export default DrawerNavigation
