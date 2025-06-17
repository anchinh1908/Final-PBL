import AsyncStorage from "@react-native-async-storage/async-storage"
import { useReducer, useEffect } from "react"
import PropTypes from "prop-types"
import { getAccount } from "../API/Account_API"
import { authReducer } from "../reducers/authReducer"
import { AuthContext } from "../constants/context"
import { jwtDecode } from "jwt-decode"

export const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, {
        user: null,
    })

    useEffect(() => {
        let isCancelled = false

        const get_Account_By_Token = async () => {
            try {
                const token = await AsyncStorage.getItem("token")
                if (!token) {
                    if (!isCancelled) dispatch({ type: "LOGOUT" }) // hoặc dispatch khác tùy reducer
                    return
                }

                console.log("Token:", token)

                const account = await getAccount(token)

                if (!isCancelled && account) {
                    const decoded = jwtDecode(token)
                    account.role = decoded.role
                    console.log("acc", account);
                    
                    dispatch({ type: "LOGIN", payload: account })
                }
            } catch (error) {
                // console.log("Failed to fetch account:", error)
                await AsyncStorage.removeItem("token")
                if (!isCancelled) dispatch({ type: "LOGOUT" })
            }
        }

        get_Account_By_Token()

        return () => {
            isCancelled = true
        }
    }, [])

    return <AuthContext.Provider value={{ ...state, dispatch }}>{children}</AuthContext.Provider>
}

AuthContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
}
