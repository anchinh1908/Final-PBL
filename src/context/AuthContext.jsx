import { useReducer, useEffect } from "react"
import { getAccount } from "~/services/UserService"
import PropTypes from "prop-types"
import { authReducer } from "~/reducers/authReducer"
import { AuthContext } from "~/constants/context"
import { jwtDecode } from "jwt-decode"

export const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, {
        user: null,
    })

    useEffect(() => {
        const get_Account_By_Token = async () => {
            const token = localStorage.getItem("token")
            if (!token) return null

            try {
                console.log(token)

                const account = await getAccount(token)

                const decoded = jwtDecode(token)
                console.log(decoded)
                account.role = decoded.role

                if (account) dispatch({ type: "LOGIN", payload: account })
            } catch (error) {
                console.error("Failed to fetch account:", error)
                localStorage.removeItem("token")
            }
        }
        get_Account_By_Token()
    }, [])

    return <AuthContext.Provider value={{ ...state, dispatch }}>{children}</AuthContext.Provider>
}

AuthContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
}
