import { useContext } from "react"
import { HotelContext } from "~/constants/context"

const useHotelContext = () => {
    const context = useContext(HotelContext)

    if (!context) {
        throw new Error("useHotelContext must be used within a HotelProvider")
    }

    return context
}

export default useHotelContext
