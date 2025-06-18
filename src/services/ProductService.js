const root = import.meta.env.VITE_API_URL + "/products"

export const get_All_Product = async (page, limit, search) => {
    try {
        const response = await fetch(
            `${root}/active-products?page=${page}&limit=${limit}&search=${search}`,
            {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            }
        )
        const json = await response.json()

        if (!response.ok) throw new Error(json.error || "Login failed")

        return json
    } catch (error) {
        console.error("Error logging in:", error)
        throw error
    }
}

export const get_All_Soft_Deleted_Product = async (token, page) => {
    try {
        const response = await fetch(`${root}/inactive-products?page=${page}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
        const json = await response.json()

        if (!response.ok) throw new Error(json.error || "Login failed")

        return json
    } catch (error) {
        console.error("Error logging in:", error)
        throw error
    }
}

export const get_Product = async (id) => {
    try {
        const response = await fetch(`${root}/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
        const json = await response.json()

        if (!response.ok) throw new Error(json.error || "Login failed")

        return json
    } catch (error) {
        console.error("Error logging in:", error)
        throw error
    }
}
