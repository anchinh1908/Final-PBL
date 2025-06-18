import { format } from "date-fns"

const root = import.meta.env.VITE_API_URL

export const loginAccount = async (email, password) => {
    try {
        const response = await fetch(`${root}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        })

        const json = await response.json()

        if (!response.ok) throw new Error(json.message || "Đăng nhập thất bại")

        return json
    } catch (error) {
        console.error("Lỗi đăng nhập:", error)
        throw error
    }
}

export const registerAccount = async (email, password, fullname, otp) => {
    try {
        const response = await fetch(`${root}/auth/register?otp=${otp}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, fullName: fullname }),
        })
        const json = await response.json()

        if (!response.ok) throw new Error(json.message || "Đăng ký thất bại")

        return json
    } catch (error) {
        console.error("Lỗi đăng ký:", error)
        throw error
    }
}

export const forgotPassword = async (email) => {
    try {
        const response = await fetch(`${root}/auth/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        })
        const json = await response.json()

        if (!response.ok) throw new Error(json.message || "Gửi mã OTP thất bại")

        return json
    } catch (error) {
        console.error("Lỗi gửi OTP:", error)
        throw error
    }
}

export const sendOTP = async (email) => {
    try {
        const response = await fetch(`${root}/auth/register/send-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        })
        const json = await response.json()

        if (!response.ok) throw new Error(json.message || "Gửi mã OTP thất bại")

        return json
    } catch (error) {
        console.error("Lỗi gửi OTP:", error)
        throw error
    }
}

export const resetPassword = async (email, otp, newPassword) => {
    try {
        const response = await fetch(`${root}/auth/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp, newPassword }),
        })
        const json = await response.json()

        if (!response.ok) throw new Error(json.message || "Reset mật khẩu thất bại")

        return json
    } catch (error) {
        console.error("Lỗi khi reset mật khẩu:", error)
        throw error
    }
}

export const getAccount = async (token) => {
    try {
        const response = await fetch(`${root}/user/profile`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
        const json = await response.json()

        if (!response.ok) throw new Error(json.message || "Lấy thông tin tài khoản thất bại!")

        return json
    } catch (error) {
        console.error("Lỗi khi lấy thông tin tài khoản bằng token:", error)
        throw error
    }
}

export const updateProfile = async (token, user) => {
    try {
        const formData = new FormData()
        if (user.fullName) formData.append("fullName", user.fullName)
        if (user.phoneNumber) formData.append("phoneNumber", user.phoneNumber)
        if (user.dateOfBirth) formData.append("dateOfBirth", format(user.dateOfBirth, "dd-MM-yyyy"))
        if (user.address) formData.append("address", user.address)
        if (user.avatar) formData.append("avatar", user.avatar)

        // formData.append("avatar", {
        //     uri: user.avatar.uri,
        //     type: user.avatar.mimeType || "image/jpeg",
        //     name: user.avatar.fileName || "anh.jpg",
        // })

        const response = await fetch(`${root}/user/profile`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        })
        const json = await response.json()

        if (!response.ok) throw new Error(json.message || "Cập nhật thông tin thất bại.")

        return json
    } catch (error) {
        console.error("Lỗi cập nhật hồ sơ người dùng:", error)
        throw error
    }
}

export const changePassword = async (token, oldPassword, newPassword) => {
    try {
        const response = await fetch(`${root}/user/update-password`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ oldPassword: oldPassword, newPassword: newPassword }),
        })
        const json = await response.json()

        if (!response.ok) throw new Error(json.message || "Đổi mật khẩu thất bại")

        return json
    } catch (error) {
        console.error("Đổi mật khẩu thất bại", error)
        throw error
    }
}

export const getAllUser = async (token, page = 1, size = 20) => {
    try {
        const formData = new FormData()
        formData.append("page", page)
        formData.append("size", size)

        const response = await fetch(`${root}/admin/users`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        })
        const json = await response.json()

        if (!response.ok) throw new Error(json.message || "Lấy thông tin tài khoản thất bại!")

        return json
    } catch (error) {
        console.error("Lỗi khi lấy thông tin tài khoản bằng token:", error)
        throw error
    }
}

// export const getAllUser = async (token) => {
//     try {
//         const response = await fetch(`${root}/admin/users`, {
//             method: "GET",
//             headers: {
//                 Authorization: `Bearer ${token}`,
//             },
//         })
//         const json = await response.json()
//         console.log(json)

//         if (!response.ok) throw new Error(json.message || "Lấy thông tin tài khoản thất bại!")

//         return json
//     } catch (error) {
//         console.error("Lỗi khi lấy thông tin tài khoản bằng token:", error)
//         throw error
//     }
// }

export const search_Users = async (token, email) => {
    try {
        // , page = 1, size = 20
        const formData = new FormData()
        // formData.append("page", page)
        // formData.append("size", size)
        formData.append("email", email)

        const response = await fetch(`${root}/admin/search-user`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        })

        const json = await response.json()

        if (!response.ok) throw new Error(json.message || "Tìm kiếm người dùng thất bại")

        return json
    } catch (error) {
        console.error("Tìm kiếm người dùng thất bại:", error)
        throw error
    }
}

export const block_User = async (token, userid) => {
    try {
        const response = await fetch(`${root}/admin/users/${userid}/disable`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        const json = await response.json()

        if (!response.ok) throw new Error(json.message || "Vô hiệu hoá tài khoản thất bại.")

        return json
    } catch (error) {
        console.error("Vô hiệu hoá tài khoản thất bại:", error)
        throw error
    }
}

export const restore_User = async (token, userid) => {
    try {
        const response = await fetch(`${root}/admin/users/${userid}/restore`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        const json = await response.json()

        if (!response.ok) throw new Error(json.message || "Khôi phục tài khoản thất bại.")

        return json
    } catch (error) {
        console.error("Khôi phục tài khoản thất bại:", error)
        throw error
    }
}

export const get_User_By_Id = async (token, userid) => {
    try {
        const response = await fetch(`${root}/admin/user/${userid}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        const json = await response.json()

        if (!response.ok) throw new Error(json.message || "Lỗi khi lấy người dùng.")

        return json
    } catch (error) {
        console.error("Lỗi khi lấy người dùng:", error)
        throw error
    }
}

export const delete_User = async (token, userid) => {
    try {
        const response = await fetch(`${root}/admin/delete-user/${userid}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        const json = await response.json()

        if (!response.ok) throw new Error(json.message || "Xoá tài khoản thất bại.")

        return json
    } catch (error) {
        console.error("Xoá tài khoản thất bại:", error)
        throw error
    }
}

export const count_Number = async (token) => {
    try {
        const response = await fetch(`${root}/admin/count-number`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        const json = await response.json()

        if (!response.ok) throw new Error(json.message || "Lấy số lượng thất bại.")

        return json
    } catch (error) {
        console.error("Lấy số lượng thất bại:", error)
        throw error
    }
}
