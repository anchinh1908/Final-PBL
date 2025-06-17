export const hotelReducer = (state, action) => {
    switch (action.type) {
        case "FETCH_HOTELS":
            return {
                ...state,
                hotels: action.payload.hotels,
                currentPage: action.payload.currentPage,
                totalPages: action.payload.totalPages,
            }
        case "ADD_HOTEL":
            return { ...state, hotels: [...state.hotels, action.payload] }
        case "UPDATE_HOTEL":
            return { ...state, hotels: [...state.hotels, action.payload] }
        case "SOFT_DELETE_HOTEL":
            return {
                ...state,
                hotels: state.hotels.filter((brand) =>
                    brand._id === action.payload._id ? action.payload : brand
                ),
            }
        case "PERMA_DELETE_HOTEL":
            return {
                ...state,
                hotels: state.hotels.filter((brand) => brand._id !== action.payload._id),
            }
        default:
            return state
    }
}
