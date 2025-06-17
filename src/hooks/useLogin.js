import { useState } from "react"
import { useAuthContext } from "./useAuthContext"
import { getAccount, loginAccount } from "../API/Account_API"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { jwtDecode } from "jwt-decode"

export const useLogin = () => {
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const { dispatch } = useAuthContext()

    const login = async (email, password) => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await loginAccount(email, password)

            if (!response || !response.token) {
                throw new Error("Đăng nhập thất bại: không nhận được token")
            }

            await AsyncStorage.setItem("token", response.token)

            const account = await getAccount(response.token)

            if (account) {
                const decoded = jwtDecode(response.token)
                account.role = decoded.role
                console.log("acc", account);

                dispatch({ type: "LOGIN", payload: account })
                return { success: true, role: decoded.role }
            } else {
                throw new Error("Không lấy được thông tin tài khoản")
            }
        } catch (err) {
            const message = err.message || "Đăng nhập thất bại"
            setError(message)
            return { success: false, error: message }
        } finally {
            setIsLoading(false)
        }
    }

    return { login, isLoading, error }
}
