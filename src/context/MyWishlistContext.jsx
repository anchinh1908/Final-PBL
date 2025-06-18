import PropTypes from "prop-types"
import { useEffect, useReducer } from "react"
import { MyWishlistContext } from "~/constants/context"
import { useAuthContext } from "~/hooks/useAuthContext"
import { myWishlistReducer } from "~/reducers/myWishlistReducer"
import { get_My_Wishlist } from "~/services/WishlistService"

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
                const token = localStorage.getItem("token")
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
                    console.error("Failed to fetch my wishlist:", error)
                    dispatch({
                        type: "FETCH_MYWISHLISTS",
                        payload: { myWishlists: [], totalPages: 0 },
                    })
                    // localStorage.removeItem("token")
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

MyWishlistContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
}
