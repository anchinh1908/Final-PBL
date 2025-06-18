import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import PropTypes from "prop-types"

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

const MapLocation = ({ isOpen, onClose, locations }) => {
    const mapRef = useRef(null)
    const mapInstance = useRef(null)
    const markers = useRef([])

    useEffect(() => {
        if (!isOpen || !locations || locations.length === 0) return

        setTimeout(() => {
            // Xóa bản đồ cũ nếu có
            if (mapInstance.current) {
                mapInstance.current.remove()
                mapInstance.current = null
                markers.current = []
            }

            const initialLatLng = [locations[0].hotel.latitude, locations[0].hotel.longitude]
            mapInstance.current = L.map(mapRef.current).setView(initialLatLng, 13)

            L.tileLayer(
                `${import.meta.env.VITE_MAPTILER_URL}?key=${import.meta.env.VITE_MAPTILER_KEY}`,
                {
                    attribution: import.meta.env.VITE_MAPTILER_ATTRIBUTION,
                    tileSize: 512,
                    zoomOffset: -1,
                }
            ).addTo(mapInstance.current)

            // Thêm tất cả marker
            locations.forEach((loc) => {
                const marker = L.marker([loc.hotel.latitude, loc.hotel.longitude])
                    .addTo(mapInstance.current)
                    .bindPopup(loc.hotel.name)
                markers.current.push(marker)
            })

            // Fit bounds để thấy hết các marker
            const bounds = L.latLngBounds(
                locations.map((l) => [l.hotel.latitude, l.hotel.longitude])
            )
            mapInstance.current.fitBounds(bounds, { padding: [20, 20] })
        }, 300)
    }, [isOpen, locations])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-[80%] rounded-xl overflow-hidden shadow-lg relative">
                <div className="flex justify-between items-center px-4 py-2 border-b">
                    <h2 className="text-lg font-semibold">Xem nhiều địa điểm</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-2xl">
                        &times;
                    </button>
                </div>
                <div className="p-3">
                    <div id="map" ref={mapRef} className="h-[600px] w-full rounded-lg" />
                </div>
            </div>
        </div>
    )
}

MapLocation.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    locations: PropTypes.array.isRequired,
    // lat: PropTypes.number.isRequired,
    // lng: PropTypes.number.isRequired,
    // hotelName: PropTypes.string,
}

export default MapLocation
