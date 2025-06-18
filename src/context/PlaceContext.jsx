import PropTypes from "prop-types"
import { useReducer } from "react"
import { PlaceContext } from "~/constants/context"
import { placeReducer } from "~/reducers/placeReducer"

export const PlaceContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(placeReducer, {
        places: [],
        currentPage: 1,
        totalPages: 1,
    })

    return <PlaceContext.Provider value={{ ...state, dispatch }}>{children}</PlaceContext.Provider>
}

PlaceContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
}
