import { useState } from "react"
import { RotatingLines } from "react-loader-spinner"
import InputPassword from "~/components/common/InputPassword"
import { useAuthContext } from "~/hooks/useAuthContext"
import { changePassword } from "~/services/UserService"

const ChangePassword = () => {
    const { dispatch } = useAuthContext()

    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [messageError, setMessageError] = useState("")
    const [messageSuccess, setMessageSuccess] = useState("")

    const [loading, setLoading] = useState(false)

    const change_Password = async (e) => {
        e.preventDefault()
        setLoading(true)

        if (newPassword !== confirmPassword) {
            setMessageError("Mật khẩu mới và mật khẩu xác nhận không trùng khớp.")
            setLoading(false)
            return
        }

        try {
            const token = localStorage.getItem("token")
            if (!token) {
                setMessageError("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.")
                return
            }

            const result = await changePassword(token, currentPassword, newPassword)
            if (result.status === 200) {
                dispatch({ type: "UPDATE_USER", payload: { password: newPassword } })
                setMessageError("")
                setMessageSuccess(result.message || "Đổi mật khẩu thành công")

                setCurrentPassword("")
                setNewPassword("")
                setConfirmPassword("")

                setTimeout(() => setMessageSuccess(""), 3000)
            } else {
                setMessageError(result.message || "Đổi mật khẩu thất bại")
                setTimeout(() => setMessageError(""), 3000)
            }
        } catch (error) {
            setMessageError(error.message || "Có lỗi xảy ra. Vui lòng thử lại.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h1>Đổi mật khẩu</h1>
            <div className="border-b py-5 px-4">
                <div className="flex items-center">
                    <div className="w-56 font-medium text-gray-700">Mật khẩu hiện tại</div>
                    <InputPassword
                        password={currentPassword}
                        setPassword={setCurrentPassword}
                        // placeholder="Xác minh người dùng hiện tại"
                    />
                </div>
            </div>
            <div className="border-b py-5 px-4">
                <div className="flex items-center">
                    <div className="w-56 font-medium text-gray-700">Mật khẩu mới</div>
                    <InputPassword
                        password={newPassword}
                        setPassword={setNewPassword}
                        // placeholder="Mật khẩu muốn thay đổi"
                    />
                </div>
            </div>
            <div className="border-b py-5 px-4">
                <div className="flex items-center">
                    <div className="w-56 font-medium text-gray-700">Nhập lại mật khẩu mới</div>
                    <InputPassword password={confirmPassword} setPassword={setConfirmPassword} />
                </div>
            </div>

            <div className="flex items-center justify-center">
                <button
                    onClick={(e) => change_Password(e)}
                    disabled={loading}
                    className="mt-5 w-1/2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition duration-300">
                    Đổi mật khẩu
                </button>
            </div>

            {messageError && <p className="text-red-500 text-center mt-3">{messageError}</p>}

            {messageSuccess && <p className="text-green-500 text-center mt-3">{messageSuccess}</p>}

            {loading && (
                <div className="w-full flex justify-center mt-10">
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
        </div>
    )
}

export default ChangePassword
