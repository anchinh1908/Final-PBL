import { useEffect, useState } from "react"
import Region_API from "../API/Region_API"

const useRegions = () => {
    const [regionsHook, setRegionsHook] = useState([])

    const filterRegions = async () => {
        try {
            const allRegions = await Region_API.get_Region_List()

            setRegionsHook(allRegions.slice().sort((a, b) => a.name.localeCompare(b.name)))
        } catch (error) {
            console.log("Failed to fetch regions:", error)
        }
    }

    const get_Region_By_ID = (data, id) => {
        return data.find((item) => item._id === id)
    }

    useEffect(() => {
        filterRegions()
    }, [])

    return [regionsHook, get_Region_By_ID]
}

export default useRegions

// [
//     "__v",
//     "_id",
//     "is_deleted",
//     "name",
// ]
