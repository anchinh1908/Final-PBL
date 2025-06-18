import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuthContext } from "~/hooks/useAuthContext"
import { getAccount } from "~/services/UserService"

const OAuth2Redirect = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const { dispatch } = useAuthContext()

    const getProfile = async (token) => {
        try {
            localStorage.setItem("token", token)

            const account = await getAccount(token)

            if (account) {
                dispatch({ type: "LOGIN", payload: account })
                navigate("/")
            }
        } catch (error) {
            console.error("Lỗi get profile:", error)
        }
    }

    useEffect(() => {
        const token = searchParams.get("token") || ""
        const message = searchParams.get("message") || ""
        const status = searchParams.get("status") || ""

        if (status === "false") {
            console.error("OAuth2 failed:", message)
            navigate("/")
            return
        }

        if (status === "true" && token) {
            console.log(token)
            getProfile(token)
        }
    }, [searchParams])

    return (
        <div style={{ textAlign: "center", marginTop: "20%" }}>
            <h2>Đang đăng nhập bằng Google...</h2>
        </div>
    )
}

export default OAuth2Redirect
