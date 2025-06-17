export const myWishlistReducer = (state, action) => {
    switch (action.type) {
        case "FETCH_MYWISHLISTS":
            return {
                ...state,
                myWishlists: action.payload.myWishlists,
                currentPage: action.payload.currentPage,
                totalPages: action.payload.totalPages,
            }
        case "ADD_MYWISHLIST":
            return { ...state, myWishlists: [...state.myWishlists, action.payload] }
        case "DELETE_MYWISHLIST":
            return {
                ...state,
                myWishlists: state.myWishlists.filter((hotel) => hotel.id !== action.payload.id),
            }
        default:
            return state
    }
}
