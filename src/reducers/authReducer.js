export const authReducer = (state, action) => {
    switch (action.type) {
        case "LOGIN":
            return { user: action.payload }
        case "UPDATE_USER":
            return { ...state, user: {...state.user, ...action.payload} }
        case "LOGOUT":
            return { user: null }
        default:
            return state
    }
}