import { useContext } from "react"
import { MyWishlistContext } from "~/constants/context"

const useMyWishlistContext = () => {
    const context = useContext(MyWishlistContext)

    if (!context) {
        throw new Error("useMyWishlistContext must be used within a MyWishlistProvider")
    }

    return context
}

export default useMyWishlistContext
