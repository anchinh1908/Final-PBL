import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import DrawerNavigation from "./DrawerNavigation"
import {
    Login,
    Register,
    UpdateUser,
    UserProfile,
    PasswordManage,
    ForgetPassword,
    PlaceDetail,
    Logout,
    MyWishlist,
    ResetPassword,
    ViewHistory,
} from "../screens"
import HotelBottomTab from "./HotelBottomTab"
import AdminBottomTab from "./AdminBottomTab"
const Stack = createNativeStackNavigator()

const AppNavigation = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Main">
                <Stack.Screen name="Main" component={DrawerNavigation} />
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Register" component={Register} />
                <Stack.Screen name="PlaceDetail" component={PlaceDetail} />
                {/* <Stack.Screen name="HotelDetail" component={HotelDetail} /> */}
                <Stack.Screen name="AdminBottomTab" component={AdminBottomTab} />
                <Stack.Screen name="HotelBottomTab" component={HotelBottomTab} />
                <Stack.Screen name="ForgetPassword" component={ForgetPassword} />
                <Stack.Screen name="UserProfile" component={UserProfile} />
                <Stack.Screen name="UpdateUser" component={UpdateUser} />
                <Stack.Screen name="Logout" component={Logout} />
                <Stack.Screen name="MyWishlist" component={MyWishlist} />
                <Stack.Screen name="PasswordManage" component={PasswordManage} />
                <Stack.Screen name="ViewHistory" component={ViewHistory} />
                <Stack.Screen name="ResetPassword" component={ResetPassword} />
                {/* <Stack.Screen name="Specialty" component={Specialties} />
                <Stack.Screen name="Booking" component={Booking} />
                <Stack.Screen name="VerifyBooking" component={VerifyBooking} />
                <Stack.Screen name="SpecialtyDetail" component={SpecialtyDetail} />
                <Stack.Screen name="DoctorInfo" component={DoctorInfo} />
                <Stack.Screen name="Doctor" component={Doctors} />
                <Stack.Screen name="QADetail" component={QADetail} />
                <Stack.Screen name="Myappointment" component={Myappointment} />
                <Stack.Screen name="Privacy" component={Privacy} />
                <Stack.Screen name="AppointmentDetail" component={AppointmentDetail} />
                <Stack.Screen name="DoctorAppointmentDetail" component={DoctorAppointmentDetail} />
                <Stack.Screen name="SettingAccount" component={SettingAccount} />
                <Stack.Screen name="AddArticle" component={AddArticle} />
                <Stack.Screen name="MyArticle" component={MyArticles} />
                <Stack.Screen name="SettingNotification" component={SettingNotification} />
                <Stack.Screen name="ViewArticle" component={ViewArticle} />
                <Stack.Screen name="Articles" component={Articles} />
                <Stack.Screen name="AddPost" component={AddPost} />
                <Stack.Screen name="UpdateDoctor" component={UpdateDoctor} />
                <Stack.Screen name="UpdateOther" component={UpdateOther} />
                <Stack.Screen name="BottomTabNavigation" component={BottomTabNavigation} /> */}
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default AppNavigation
