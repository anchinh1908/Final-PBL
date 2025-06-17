// import React, { createContext, useContext, useState, useEffect } from "react"
// import AsyncStorage from "@react-native-async-storage/async-storage"
// import Account_API from "./API/Account_API"

// const AuthContext = createContext()

// export const AuthProvider = ({ children }) => {
//     const [isLoggedIn, setIsLoggedIn] = useState(false)
//     const [user, setUser] = useState({})
//     const [account, setAccount] = useState({})
//     // const [loginPending, setLoginPending] = useState(false) //loading

//     const fetchUserAndAccount = async () => {
//         try {
//             const userString = await AsyncStorage.getItem("user")
//             const user = JSON.parse(userString)

//             if (user?.token) {
//                 setUser(user)

//                 // Gọi API để lấy thông tin tài khoản
//                 const accountData = await Account_API.getUserProfile(user.token)

//                 setAccount(accountData.user)
//                 setIsLoggedIn(true)
//             } else resetState()
//         } catch (error) {
//             console.log("Failed to fetch account:", error)
//             resetState()
//             throw error
//         }
//     }

//     const resetState = () => {
//         setIsLoggedIn(false)
//         setUser({})
//         setAccount({})
//     }

//     useEffect(() => {
//         fetchUserAndAccount()
//     }, [])

//     const userLogout = async () => {
//         try {
//             await AsyncStorage.removeItem("user")
//             setUser({})
//             setAccount({})
//             setIsLoggedIn(false)
//         } catch (error) {
//             console.log("Error logging out: ", error)
//         }
//     }

//     const Forgot_Pass = async (email) => {
//         const response = await Account_API.ForgotPassword(email)
//         if (!response.success) {
//             return { error: response.error }
//         }
//         return response.data
//     }

//     const soft_deleteAccount = async (account_Ids) => {
//         try {
//             const response = await Account_API.softDeleteAccount(account_Ids)
//             return response
//         } catch (error) {
//             throw error
//         }
//     }

//     const perma_deleteAccount = async (account_Ids) => {
//         try {
//             const response = await Account_API.permaDeleteAccount(account_Ids)
//             return response
//         } catch (error) {
//             throw error
//         }
//     }

//     return (
//         <AuthContext.Provider
//             value={{
//                 user,
//                 userLogout,
//                 isLoggedIn,
//                 account,
//                 setAccount,
//                 Forgot_Pass,
//                 soft_deleteAccount,
//                 perma_deleteAccount,
//                 fetchUserAndAccount,
//             }}>
//             {children}
//         </AuthContext.Provider>
//     )
// }

// export const useAuth = () => {
//     return useContext(AuthContext)
// }
