import { useAuthContext } from "./useAuthContext"
import useMyWishlistContext from "./useMyWishlistContext"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNavigation } from "@react-navigation/native"

export const useLogout = () => {
    const { dispatch } = useAuthContext()
    const navigation = useNavigation()
    const { dispatch: dispatchMyWishlists } = useMyWishlistContext()

    const logout = async () => {
        await AsyncStorage.removeItem("token")

        dispatch({ type: "LOGOUT" })

        dispatchMyWishlists({
            type: "FETCH_MYWISHLISTS",
            payload: { myWishlists: [], totalPages: 0 },
        })

        navigation.navigate("Home")
    }

    return { logout }
}
