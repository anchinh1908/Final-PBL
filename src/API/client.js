// import axios from "axios"
// import { API_URL } from "@env"

// export default axios.create({
//     baseURL: API_URL,
//     headers: {
//         "Content-Type": "application/json",
//     },
// })

import axios from "axios"
import { API_URL } from "@env"
import AsyncStorage from "@react-native-async-storage/async-storage"

const client = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
})

// Nếu cần tự động gắn token cho mọi request
client.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem("token")
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

export default client
