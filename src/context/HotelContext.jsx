import PropTypes from "prop-types"
import { useReducer } from "react"
import { HotelContext } from "~/constants/context"
import { hotelReducer } from "~/reducers/hotelReducer"

export const HotelContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(hotelReducer, {
        hotels: [],
        currentPage: 1,
        totalPages: 1,
    })

    return <HotelContext.Provider value={{ ...state, dispatch }}>{children}</HotelContext.Provider>
}

HotelContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
}
