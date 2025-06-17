import { useEffect, useState } from "react"
import Account_API from "../API/Account_API"

const useAccount = () => {
    const [doctorsHook, setDoctorsHook] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const filterDoctors = async () => {
        setLoading(true)
        try {
            const allDoctors = await Account_API.get_Doctor_List()
            const dropdown = allDoctors.map(({ username, ...rest }) => ({
                name: username,
                ...rest,
            }))

            setDoctorsHook(dropdown)
        } catch (error) {
            console.log("Failed to fetch doctors:", error)
            setError("Failed to fetch doctors.") // Cập nhật lỗi
        } finally {
            setLoading(false) // Kết thúc loading
        }
    }

    const getDoctorsBySpecialtyAndRegion = (data, specialty, area) => {
        if (!specialty && !area) {
            return data
        } else {
            const doctorBySpecialty = data.filter((item) => {
                const matchArea = area ? item.region_id === area._id : true
                const matchSpecialty = specialty ? item.speciality_id === specialty._id : true
                return matchArea && matchSpecialty
            })
            return doctorBySpecialty
        }
    }

    useEffect(() => {
        filterDoctors()
    }, [])

    return [doctorsHook, getDoctorsBySpecialtyAndRegion, loading, error] // Trả về loading và error
}

export default useAccount
