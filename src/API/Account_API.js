import { format } from "date-fns"
import client from "./client"

const loginAccount = async (email, password) => {
    try {
        const response = await client.post("/auth/login", { email, password })
        return response.data
    } catch (error) {
        console.log("Lỗi đăng nhập:", error.response?.data)
        throw new Error(error.response?.data?.message || "Đăng nhập thất bại")
    }
}

const registerAccount = async (email, password, fullname, otp) => {
    try {
        const response = await client.post(`/auth/register?otp=${otp}`, {
            email,
            password,
            fullName: fullname,
        })
        return response.data
    } catch (error) {
        console.log("Lỗi đăng ký:", error.response?.data)
        throw new Error(error.response?.data?.message || "Đăng ký thất bại")
    }
}

const forgotPassword = async (email) => {
    try {
        console.log(email)
        const response = await client.post("/auth/forgot-password", { email })
        return response.data
    } catch (error) {
        console.log("Lỗi gửi OTP:", error.response?.data)
        throw new Error(error.response?.data?.message || "Gửi mã OTP thất bại")
    }
}

const sendOTP = async (email) => {
    try {
        console.log(email)
        const response = await client.post("/auth/register/send-otp", { email })
        return response.data
    } catch (error) {
        console.log("Lỗi gửi OTP:", error.response?.data)
        throw new Error(error.response?.data?.message || "Gửi mã OTP thất bại")
    }
}

const resetPassword = async (email, otp, newPassword) => {
    try {
        const response = await client.post("/auth/reset-password", {
            email,
            otp,
            newPassword,
        })
        return response.data
    } catch (error) {
        console.log("Lỗi khi reset mật khẩu:", error.response?.data)
        throw new Error(error.response?.data?.message || "Reset mật khẩu thất bại")
    }
}

const getAccount = async (token) => {
    try {
        const response = await client.get("/user/profile", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        
        return response.data
    } catch (error) {
        console.log("Lỗi khi lấy thông tin tài khoản:", error.response?.data)
        throw new Error(error.response?.data?.message || "Lấy thông tin tài khoản thất bại")
    }
}

const updateProfile = async (token, user) => {
    try {
        const formData = new FormData()
        if (user.fullName) formData.append("fullName", user.fullName)
        if (user.phoneNumber) formData.append("phoneNumber", user.phoneNumber)
        if (user.dateOfBirth) formData.append("dateOfBirth", format(user.dateOfBirth, "dd-MM-yyyy"))
        if (user.address) formData.append("address", user.address)
        if (typeof user.avatar === "object")
            formData.append("avatar", {
                uri: user.avatar.uri,
                type: user.avatar.mimeType || "image/jpeg",
                name: user.avatar.fileName || "anh.jpg",
            })

        const response = await client.put("/user/profile", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        })

        return response.data
    } catch (error) {
        console.log("Lỗi cập nhật hồ sơ người dùng:", error.response?.data)
        throw new Error(error.response?.data?.message || "Cập nhật thông tin thất bại.")
    }
}

const changePassword = async (token, oldPassword, newPassword) => {
    try {
        const response = await client.put(
            "/user/update-password",
            { oldPassword, newPassword },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
        return response.data
    } catch (error) {
        console.log("Đổi mật khẩu thất bại:", error.response?.data)
        throw new Error(error.response?.data?.message || "Đổi mật khẩu thất bại")
    }
}

// const getAllUser = async (token, page = 1, size = 20) => {
//     try {
//         const formData = new FormData()
//         formData.append("page", page)
//         formData.append("size", size)

//         const response = await client.post("/admin/users", formData, {
//             headers: {
//                 Authorization: `Bearer ${token}`,
//                 "Content-Type": "multipart/form-data",
//             },
//         })

//         return response.data
//     } catch (error) {
//         console.log("Lỗi khi lấy thông tin tài khoản:", error)
//         throw new Error(error.response?.data?.message || "Lấy thông tin tài khoản thất bại!")
//     }
// }

const getAllUser = async (token) => {
    try {
        const response = await client.get("/admin/users", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        return response.data
    } catch (error) {
        console.log("Lỗi khi lấy danh sách người dùng:", error.response?.data)
        throw new Error(error.response?.data?.message || "Lấy thông tin tài khoản thất bại!")
    }
}

export {
    loginAccount,
    registerAccount,
    forgotPassword,
    resetPassword,
    getAccount,
    updateProfile,
    changePassword,
    getAllUser,
    sendOTP
}
