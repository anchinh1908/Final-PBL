import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import { useEffect } from "react"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import PropTypes from "prop-types"
import { getAddressByCoordinates, getCoordinatesByAddress } from "~/services/LocationIqService"

delete L.Icon.Default.prototype._getIconUrl
const gpsIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconSize: [25, 41], // kích thước icon
    iconAnchor: [12, 41], // điểm mỏ neo (điểm ảnh chạm vào map)
    popupAnchor: [1, -34],
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    shadowSize: [41, 41],
})

const MapUpdater = ({ position }) => {
    const map = useMap()

    useEffect(() => {
        if (position) {
            map.setView([position.lat, position.lng], 13)
        }
    }, [position, map])

    return null
}

MapUpdater.propTypes = {
    position: PropTypes.object.isRequired,
}

const SearchableMapPicker = ({ position, setPosition, address, setAddress }) => {
    useEffect(() => {
        if (!position.lat && !position.lng && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const coords = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                    }
                    setPosition(coords)
                },
                (err) => {
                    console.warn("Không thể lấy vị trí hiện tại:", err)
                    // Nếu lỗi hoặc user từ chối thì giữ position null hoặc mặc định
                }
            )
        }
    }, [position])

    useEffect(() => {
        const getCurrentAddress = async (latlng) => {
            const addr = await getAddressByCoordinates(latlng)
            setAddress(addr)
        }

        if (position.lat && position.lng && !address) getCurrentAddress(position)
    }, [position])

    const MapClickHandler = () => {
        // eslint-disable-next-line no-unused-vars
        const map = useMapEvents({
            click: async (e) => {
                const latlng = e.latlng
                setPosition(latlng)

                // Gọi API reverse geocoding lấy address
                const addr = await getAddressByCoordinates(latlng)
                setAddress(addr)
            },
        })

        return null
    }

    const handleSearch = async () => {
        try {
            const coordinates = await getCoordinatesByAddress(address)
            setPosition(coordinates)
        } catch (err) {
            alert(err.message) // hoặc hiển thị bằng Toast/Snackbar
        }
    }

    return (
        <div>
            <div className="flex space-x-2 mb-3">
                <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Nhập địa chỉ..."
                    className="flex-1 border px-3 py-2 rounded"
                />
                <button
                    onClick={handleSearch}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Tìm
                </button>
            </div>

            <MapContainer
                center={position || [16.0544, 108.2022]}
                zoom={13}
                style={{ height: "400px", width: "100%" }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />
                <MapClickHandler />
                {position && (
                    <>
                        <Marker position={position} icon={gpsIcon} />
                        <MapUpdater position={position} />
                    </>
                )}
            </MapContainer>

            {position && (
                <div className="mt-2 text-sm text-gray-700">
                    📍 Tọa độ: <b>{position.lat}</b>, <b>{position.lng}</b>
                </div>
            )}
        </div>
    )
}

SearchableMapPicker.propTypes = {
    position: PropTypes.object.isRequired,
    setPosition: PropTypes.func.isRequired,
    address: PropTypes.string.isRequired,
    setAddress: PropTypes.func.isRequired,
}

export default SearchableMapPicker
