// import { useState } from "react"
// import { useSignup } from "~/hooks/useSignup"
// import { MdAttachEmail } from "react-icons/md"
// import { NavLink } from "react-router-dom"
// import "~/styles/Signup.css"
// import InputPassword from "~/components/common/InputPassword"

// const Signup = () => {
//     const [fullname, setFullname] = useState("")
//     const [phone, setPhone] = useState("")
//     const [email, setEmail] = useState("")
//     const [password, setPassword] = useState("")
//     const [verifyPassword, setVerifyPassword] = useState("")
//     const { signup, error, isLoading } = useSignup()

//     const handleSubmit = async (e) => {
//         e.preventDefault()

//         await signup(email, password)
//     }

//     return (
//         <form className="signup" onSubmit={handleSubmit}>
//             <div className="signup-form">
//                 <h1>ĐĂNG KÍ</h1>
//                 <div className="flex items-center input-style">
//                     <MdAttachEmail size={22} className="mr-3" color="gray" />
//                     <input
//                         type="text"
//                         value={fullname}
//                         onChange={(e) => setFullname(e.target.value)}
//                         placeholder="Họ và tên"
//                     />
//                 </div>

//                 <div className="flex items-center input-style">
//                     <MdAttachEmail size={22} className="mr-3" color="gray" />
//                     <input
//                         type="number"
//                         value={phone}
//                         onChange={(e) => setPhone(e.target.value)}
//                         placeholder="Số điện thoại"
//                     />
//                 </div>

//                 <div className="flex items-center input-style">
//                     <MdAttachEmail size={22} className="mr-3" color="gray" />
//                     <input
//                         type="email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         placeholder="Email"
//                     />
//                 </div>

//                 <InputPassword password={password} setPassword={setPassword} />

//                 <InputPassword
//                     password={verifyPassword}
//                     setPassword={setVerifyPassword}
//                     placeholder="Nhập lại mật khẩu"
//                 />

//                 <button disabled={isLoading} className="button">
//                     Đăng kí
//                 </button>
//                 {error && <div className="error">{error}</div>}

//                 <div className="button-signup">
//                     Bạn đã có tài khoản?
//                     <NavLink to="/signup">Đăng nhập</NavLink>
//                 </div>
//             </div>
//         </form>
//     )
// }

// export default Signup

import GitHubIcon from "@mui/icons-material/GitHub"
import GoogleIcon from "@mui/icons-material/Google"
import FacebookIcon from "@mui/icons-material/Facebook"
import PropTypes from "prop-types"

const Signup = ({ isSignupOpen, setIsSignupOpen, setIsLoginOpen }) => {
    const openSignupModal = () => {
        setIsSignupOpen(true)
    }

    const showRegisterForm = () => {
        setIsLoginOpen(true)
        setIsSignupOpen(false)
    }

    return (
        <div className="container mx-auto px-4">
            <div className="flex justify-center items-center min-h-screen">
                <div className="flex flex-col sm:flex-row sm:space-x-4">
                    <div className="flex-1"></div>
                    <div className="flex-1 text-center">
                        <button
                            onClick={openSignupModal}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg m-2 transition duration-300">
                            Đăng kí
                        </button>
                    </div>
                    <div className="flex-1"></div>
                </div>
            </div>

            {isSignupOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-md animate-fadeIn">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h4 className="text-lg font-semibold">Tạo tài khoản mới</h4>
                            <button
                                onClick={() => setIsSignupOpen(false)}
                                className="text-gray-600 hover:text-gray-800 text-2xl">
                                ×
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-center space-x-4">
                                <button className="w-10 h-10 flex items-center justify-center bg-gray-800 text-white rounded-full hover:bg-gray-900 transition">
                                    <GitHubIcon />
                                </button>
                                <button className="w-10 h-10 flex items-center justify-center bg-red-600 text-white rounded-full hover:bg-red-700 transition">
                                    <GoogleIcon />
                                </button>
                                <button className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
                                    <FacebookIcon />
                                </button>
                            </div>
                            <div className="flex items-center justify-center space-x-2">
                                <div className="h-px bg-gray-300 w-16" />
                                <span className="text-gray-500">hoặc</span>
                                <div className="h-px bg-gray-300 w-16" />
                            </div>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Email"
                                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />

                                <input
                                    type="password"
                                    placeholder="Repeat Password"
                                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={() => {}}
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition duration-300">
                                    ĐĂNG KÍ
                                </button>
                            </div>
                        </div>
                        <div className="p-4 border-t text-center">
                            <span className="flex justify-center gap-1">
                                Bạn đã có tài khoản?
                                <div
                                    onClick={showRegisterForm}
                                    className="text-blue-500 hover:underline">
                                    Đăng nhập
                                </div>
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

Signup.propTypes = {
    isSignupOpen: PropTypes.bool.isRequired,
    setIsSignupOpen: PropTypes.func.isRequired,
    setIsLoginOpen: PropTypes.func,
}

export default Signup
