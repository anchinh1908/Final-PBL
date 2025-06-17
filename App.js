import AppNavigation from "./src/navigation/AppNavigation"
import { HotelContextProvider } from "./src/context/HotelContext"
import { PlaceContextProvider } from "./src/context/PlaceContext"
import { AuthContextProvider } from "./src/context/AuthContext"
import { MyWishlistContextProvider } from "./src/context/MyWishlistContext"

export default function App() {
    return (
        <HotelContextProvider>
            <PlaceContextProvider>
                <AuthContextProvider>
                    <MyWishlistContextProvider>
                        <AppNavigation />
                    </MyWishlistContextProvider>
                </AuthContextProvider>
            </PlaceContextProvider>
        </HotelContextProvider>
    )
}
