import { useEffect, useReducer } from "react"
import { myWishlistReducer } from "../reducers/myWishlistReducer"
import { useAuthContext } from "../hooks/useAuthContext"
import { MyWishlistContext } from "../constants/context"
import { get_My_Wishlist } from "../API/Wishlist_API"
import AsyncStorage from "@react-native-async-storage/async-storage"

export const MyWishlistContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(myWishlistReducer, {
        myWishlists: [],
        currentPage: 1,
        totalPages: 1,
    })

    const { user } = useAuthContext()

    useEffect(() => {
        const get_MyWishlist_By_Token = async () => {
            if (user) {
                const token = await AsyncStorage.getItem("token")
                if (!token)
                    dispatch({
                        type: "FETCH_MYWISHLISTS",
                        payload: { myWishlists: [], totalPages: 0 },
                    })

                try {
                    const mywlst = await get_My_Wishlist(token)

                    if (mywlst && mywlst.content)
                        dispatch({
                            type: "FETCH_MYWISHLISTS",
                            payload: {
                                myWishlists: mywlst.content,
                                totalPages: mywlst.totalPages,
                            },
                        })
                } catch (error) {
                    // console.log("Failed to fetch my wishlist:", error)
                    dispatch({
                        type: "FETCH_MYWISHLISTS",
                        payload: { myWishlists: [], totalPages: 0 },
                    })
                }
            }
        }
        get_MyWishlist_By_Token()
    }, [user])

    return (
        <MyWishlistContext.Provider value={{ ...state, dispatch }}>
            {children}
        </MyWishlistContext.Provider>
    )
}
