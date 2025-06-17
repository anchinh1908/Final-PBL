import { useState } from "react"
import { registerAccount } from "../API/Account_API"

export const useSignup = () => {
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const signup = async (email, password, fullname, otp) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await registerAccount(email, password, fullname, otp)
            console.log("Đăng ký response:", response)

            if (response.status === 200) {
                setSuccess(true)
                return { success: true }
            } else {
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

    return { signup, isLoading, error, success }
}
