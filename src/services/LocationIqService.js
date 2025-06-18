const apiKey = import.meta.env.VITE_LOCATIONIQ_KEY

export const getAddressByCoordinates = async (latlng) => {
    try {
        const url = `https://us1.locationiq.com/v1/reverse.php?key=${apiKey}&lat=${latlng.lat}&lon=${latlng.lng}&format=json`

        const res = await fetch(url)
        const data = await res.json()
        const addr = data?.display_name || "Không tìm thấy địa chỉ"
        return addr
    } catch (err) {
        console.error(err)
        return ""
    }
}

export const getCoordinatesByAddress = async (address) => {
    const url = `https://us1.locationiq.com/v1/search?key=${apiKey}&q=${encodeURIComponent(
        address
    )}&format=json`

    try {
        const res = await fetch(url)
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
        }

        const data = await res.json()
        if (data && data.length > 0) {
            const { lat, lon } = data[0]
            return { lat: parseFloat(lat), lng: parseFloat(lon) }
        } else {
            throw new Error("Không tìm thấy địa điểm.")
        }
    } catch (err) {
        console.error("Lỗi khi gọi API LocationIQ:", err)
        throw err // để component xử lý hiển thị lỗi phù hợp
    }
}
