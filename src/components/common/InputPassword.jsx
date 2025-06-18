// import PropTypes from "prop-types"
// import { useState } from "react"
// import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai"
// import { RiLockPasswordFill } from "react-icons/ri"
// // import "../styles/InputPassword.css";

// const InputPassword = ({ password, setPassword, placeholder, onFocus }) => {
//     const [showPassword, setShowPassword] = useState(false)

//     const handleTogglePassword = () => {
//         setShowPassword(!showPassword) // Chuyển đổi trạng thái hiển thị
//     }
//     return (
//         <div className="flex items-center input-style">
//             <RiLockPasswordFill size={22} className="mr-3" color="gray" />
//             <input
//                 type={showPassword ? "text" : "password"}
//                 placeholder={placeholder || "●●●●●●"}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 onFocus={onFocus}
//             />
//             <button
//                 type="button"
//                 onClick={handleTogglePassword} // Chuyển đổi trạng thái hiển thị
//                 className="ml-2">
//                 {showPassword ? (
//                     <AiFillEye size={22} color="gray" />
//                 ) : (
//                     <AiFillEyeInvisible size={22} color="gray" />
//                 )}
//             </button>
//         </div>
//     )
// }

// InputPassword.propTypes = {
//     password: PropTypes.string.isRequired,
//     setPassword: PropTypes.func.isRequired,
//     placeholder: PropTypes.string,
//     onFocus: PropTypes.func,
// }

// export default InputPassword

import PropTypes from "prop-types"
import { useState } from "react"
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai"

const InputPassword = ({ password, setPassword, placeholder }) => {
    const [showPassword, setShowPassword] = useState(false)

    const handleTogglePassword = () => {
        setShowPassword(!showPassword) // Chuyển đổi trạng thái hiển thị
    }
    return (
        <div className="flex items-center input-style border rounded-lg flex-1  focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500">
            <input
                className="outline-none flex-1 p-3 rounded-l-lg"
                type={showPassword ? "text" : "password"}
                placeholder={placeholder || "●●●●●●●●"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button
                type="button"
                onClick={handleTogglePassword} // Chuyển đổi trạng thái hiển thị
                className="mr-3">
                {showPassword ? (
                    <AiFillEye size={22} color="gray" />
                ) : (
                    <AiFillEyeInvisible size={22} color="gray" />
                )}
            </button>
        </div>
    )
}

InputPassword.propTypes = {
    password: PropTypes.string.isRequired,
    setPassword: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    onFocus: PropTypes.func,
}

export default InputPassword
