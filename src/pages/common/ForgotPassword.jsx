import { useState } from "react"
import { RotatingLines } from "react-loader-spinner"
import { useNavigate } from "react-router-dom"
import Notification from "~/components/common/Notification"
import { forgotPassword } from "~/services/UserService"

const ForgotPassword = () => {
    const navigate = useNavigate()

    const [email, setEmail] = useState("")

    const [loading, setLoading] = useState(false)
    const [notification, setNotification] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()

        setLoading(true)
        try {
            const result = await forgotPassword(email)
            if (result) {
                setNotification({
                    type: "success",
                    message: "Mã đặt lại mật khẩu đã được gửi về email của bạn.",
                })
                setTimeout(() => {
                    navigate("/reset-password", { state: { email } })
                }, 2000)
            }
        } catch (error) {
            setNotification({
                type: "error",
                message: error.message || "Không thể gửi yêu cầu đặt lại mật khẩu.",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-2">Quên mật khẩu</h2>
                <p className="text-sm text-gray-600 mb-6">
                    Nhập email để nhận OTP đặt lại mật khẩu của bạn.
                </p>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold">
                        Gửi OTP đặt lại mật khẩu
                    </button>
                </form>
                <div className="mt-4 text-sm text-center">
                    <a href="/" className="text-blue-500 hover:underline">
                        Quay lại trang chủ
                    </a>
                </div>
            </div>

            {loading && (
                <div className="fixed inset-0 z-50 bg-black/30 flex justify-center items-center">
                    <RotatingLines
                        visible={true}
                        height="40"
                        width="40"
                        strokeColor="#a8dadc"
                        strokeWidth="5"
                        animationDuration="0.5"
                        ariaLabel="rotating-lines-loading"
                    />
                </div>
            )}

            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                    duration={3000}
                />
            )}
        </div>
    )
}

export default ForgotPassword
