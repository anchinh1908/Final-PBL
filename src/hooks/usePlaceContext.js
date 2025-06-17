import { useContext } from "react"
import { PlaceContext } from "../constants/context"

const usePlaceContext = () => {
    const context = useContext(PlaceContext)

    if (!context) {
        throw new Error("usePlaceContext must be used within a PlaceProvider")
    }

    return context
}

export default usePlaceContext
