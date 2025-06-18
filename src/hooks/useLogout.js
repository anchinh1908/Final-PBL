import { useNavigate } from "react-router-dom"
import { useAuthContext } from "~/hooks/useAuthContext"
import useMyWishlistContext from "./useMyWishlistContext"
// import { useWorkoutsContext } from './useWorkoutsContext'

export const useLogout = () => {
    const { dispatch } = useAuthContext()
    const navigate = useNavigate()
    const { dispatch: dispatchMyWishlists } = useMyWishlistContext()

    const logout = () => {
        // remove user from storage
        localStorage.removeItem("token")

        // dispatch logout action
        dispatch({ type: "LOGOUT" })
        navigate("/")

        dispatchMyWishlists({
            type: "FETCH_MYWISHLISTS",
            payload: { myWishlists: [], totalPages: 0 },
        })
    }

    return { logout }
}
