
export const placeReducer = (state, action) => {
    switch (action.type) {
        case "FETCH_PLACES":
            return {
                ...state,
                places: action.payload.places,
                currentPage: action.payload.currentPage,
                totalPages: action.payload.totalPages,
            }
        case "ADD_PLACE":
            return { ...state, places: [...state.places, action.payload] }
        case "UPDATE_PLACE":
            return { ...state, places: [...state.places, action.payload] }
        case "SOFT_DELETE_PLACE":
            return {
                ...state,
                places: state.places.filter((brand) =>
                    brand._id === action.payload._id ? action.payload : brand
                ),
            }
        case "PERMA_DELETE_PLACE":
            return {
                ...state,
                places: state.places.filter((brand) => brand._id !== action.payload._id),
            }
        default:
            return state
    }
}