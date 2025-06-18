import { useState } from "react"
import { registerAccount } from "~/services/UserService"

export const useSignup = () => {
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(null)

    const signup = async (email, password, fullname, otp) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await registerAccount(email, password, fullname, otp)

            if (response.status === 200) return { success: true }
            else {
                const message = response.message || "Đăng ký thất bại"
                setError(message)
                return { success: false, error: message }
            }
        } catch (error) {
            const message = error.message || "Đăng ký thất bại"
            
            setError(message)
            return { success: false, error: message }
        } finally {
            setIsLoading(false)
        }
    }

    return { signup, isLoading, error }
}
