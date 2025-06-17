import { useReducer } from "react"
import { hotelReducer } from "../reducers/hotelReducer"
import { HotelContext } from "../constants/context"

export const HotelContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(hotelReducer, {
        hotels: [],
        currentPage: 1,
        totalPages: 1,
    })

    return <HotelContext.Provider value={{ ...state, dispatch }}>{children}</HotelContext.Provider>
}
