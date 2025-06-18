import { useState } from "react"
import { RotatingLines } from "react-loader-spinner"
import { useLocation, useNavigate } from "react-router-dom"
import Notification from "~/components/common/Notification"
import { resetPassword } from "~/services/UserService"

const ResetPassword = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { email } = location.state || {}

    const [otp, setOtp] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [message, setMessage] = useState("")

    const [loading, setLoading] = useState(false)
    const [notification, setNotification] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!otp.trim()) {
            setMessage("Vui lòng nhập mã OTP.")
            return
        }

        if (password !== confirmPassword) {
            setMessage("Mật khẩu không khớp!")
            return
        }

        setLoading(true)
        setMessage("")

        try {
            const result = await resetPassword(email, otp, password)
            if (result) {
                setNotification({
                    type: "success",
                    message: `Đã đổi mật khẩu thành công. Vui lòng đăng nhập để sử dụng!`,
                })
                setTimeout(() => {
                    navigate("/")
                }, 2000)
            }
        } catch (error) {
            setMessage(error.message || "Đổi mật khẩu thất bại. Vui lòng thử lại.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Đặt lại mật khẩu</h2>
                <p className="text-sm text-gray-600 mb-6">
                    Nhập mã OTP và mật khẩu mới để khôi phục tài khoản của bạn.
                </p>

                {message && <p className="mb-4 text-red-500 text-sm">{message}</p>}

                <form onSubmit={handleSubmit}>
                    {/* OTP */}
                    <label className="block mb-2 text-sm font-medium text-gray-700">Mã OTP</label>
                    <input
                        type="text"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                    />

                    {/* Password */}
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                        Mật khẩu mới
                    </label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                    />

                    {/* Confirm Password */}
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                        Xác nhận mật khẩu
                    </label>
                    <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg mb-6"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold">
                        Đặt lại mật khẩu
                    </button>

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
                </form>
            </div>

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

export default ResetPassword
