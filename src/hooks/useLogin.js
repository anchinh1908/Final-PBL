import { jwtDecode } from "jwt-decode"
import { useState } from "react"
import { useAuthContext } from "~/hooks/useAuthContext"
import { getAccount, loginAccount } from "~/services/UserService"
export const useLogin = () => {
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(null)
    const { dispatch } = useAuthContext()

    const login = async (email, password) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await loginAccount(email, password)

            if (!response || !response.token) {
                throw new Error("Đăng nhập thất bại: Token không hợp lệ")
            }

            localStorage.setItem("token", response.token)

            const account = await getAccount(response.token)
            const decoded = jwtDecode(response.token)
            account.role = decoded.role

            if (!account) {
                throw new Error("Không thể lấy thông tin tài khoản")
            }

            dispatch({ type: "LOGIN", payload: account })
            return { success: true }
        } catch (error) {
            const message = error.message || "Đăng ký thất bại"

            setError(message)
            return { success: false, error: message }
        } finally {
            setIsLoading(false)
        }
    }

    return { login, isLoading, error }
}
