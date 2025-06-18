// import UserLayout from "~/layouts/UserLayout"
// import { Routes, Route } from "react-router-dom"
// import Home from "~/pages/user/Home"
// import Hotels from "~/pages/user/Hotels"
// import HotelDetail from "~/pages/user/HotelDetail"
// import Places from "~/pages/user/Places"
// import PlaceDetail from "~/pages/user/PlaceDetail"
// import UserProfile from "~/pages/user/UserProfile"
// import ScrollToTop from "~/utils/ScrollToTop"

// const UserRoutes = () => {
//     return (
//         <UserLayout>
//             <ScrollToTop />
//             <Routes>
//                 <Route path="/" element={<Home />} />
//                 <Route path="/hotels" element={<Hotels />} />
//                 <Route path="/hotels/:slug" element={<HotelDetail />} />
//                 <Route path="/places" element={<Places />} />
//                 <Route path="/places/:slug" element={<PlaceDetail />} />
//                 <Route path="/my-account" element={<UserProfile />} />
//                 {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
//             </Routes>
//         </UserLayout>
//     )
// }

import { Route, Routes } from "react-router-dom"
import { useAuthContext } from "~/hooks/useAuthContext"
import UserLayout from "~/layouts/UserLayout"
import UserProfileLayout from "~/layouts/UserProfileLayout"
import ForgotPassword from "~/pages/common/ForgotPassword"
import ResetPassword from "~/pages/common/ResetPassword"
import About from "~/pages/user/About"
import ChangePassword from "~/pages/user/ChangePassword"
import Home from "~/pages/user/Home"
import HotelDetail from "~/pages/user/HotelDetail"
import Hotels from "~/pages/user/Hotels"
import MyWishlist from "~/pages/user/MyWishlist"
import OAuth2Redirect from "~/pages/user/OAuth2Redirect"
import Personal from "~/pages/user/Personal"
import PlaceDetail from "~/pages/user/PlaceDetail"
import Places from "~/pages/user/Places"
import TripSchedule from "~/pages/user/TripSchedule"
// import UserProfile from "~/pages/user/UserProfile"

// export default UserRoutes
const UserRoutes = () => {
    const { user } = useAuthContext()
    return (
        <Routes>
            <Route path="/" element={<UserLayout />}>
                <Route index element={<Home />} />
                <Route path="hotels" element={<Hotels />} />
                <Route path="hotels/:slug" element={<HotelDetail />} />
                <Route path="places" element={<Places />} />
                <Route path="places/:slug" element={<PlaceDetail />} />
                <Route path="forget-password" element={<ForgotPassword />} />
                <Route path="reset-password" element={<ResetPassword />} />
                <Route path="about" element={<About />} />
                <Route path="callback" element={<OAuth2Redirect />} />
                {user && user.role === "USER" && (
                    <Route path="my-account" element={<UserProfileLayout />}>
                        <Route path="personal" element={<Personal />} />
                        <Route path="wishlist" element={<MyWishlist />} />
                        <Route path="change-password" element={<ChangePassword />} />
                    </Route>
                )}
                <Route path="/trip-schedule" element={<TripSchedule />} />
            </Route>
        </Routes>
    )
}

export default UserRoutes
