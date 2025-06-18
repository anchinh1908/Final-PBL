// import PropTypes from "prop-types"
// import { createContext, useReducer } from "react"

// export const BrandContext = createContext()

// export const brandReducer = (state, action) => {
//     switch (action.type) {
//         case "FETCH_BRANDS":
//             return { ...state, brands: action.payload }
//         case "ADD_BRAND":
//             return { ...state, brands: [...state.brands, action.payload] }
//         case "UPDATE_BRAND":
//             return { ...state, brands: [...state.brands, action.payload] }
//         case "SOFT_DELETE_BRAND":
//             return {
//                 ...state,
//                 brands: state.brands.filter((brand) =>
//                     brand._id === action.payload._id ? action.payload : brand
//                 ),
//             }
//         case "PERMA_DELETE_BRAND":
//             return {
//                 ...state,
//                 brands: state.brands.filter((brand) => brand._id !== action.payload._id),
//             }
//         default:
//             return state
//     }
// }

// export const BrandContextProvider = ({ children }) => {
//     const [state, dispatch] = useReducer(brandReducer, {
//         brands: [],
//     })

//     return <BrandContext.Provider value={{ ...state, dispatch }}> {children}</BrandContext.Provider>
// }

// BrandContextProvider.propTypes = {
//     children: PropTypes.node.isRequired,
// }
