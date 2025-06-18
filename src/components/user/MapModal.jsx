import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import PropTypes from "prop-types"
import "leaflet-routing-machine"
import "leaflet-routing-machine/dist/leaflet-routing-machine.css"
import gps from "~/assets/gps.png"

const MapModal = ({ isOpen, onClose, lat, lng, hotelName }) => {
    const mapRef = useRef(null)
    const mapInstance = useRef(null)
    const routingControl = useRef(null)

    useEffect(() => {
        if (!isOpen) return

        // Lấy vị trí hiện tại
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude
                const userLng = position.coords.longitude

                setTimeout(() => {
                    if (!mapInstance.current) {
                        mapInstance.current = L.map(mapRef.current).setView([userLat, userLng], 13)

                        // MapTiler tile layer
                        L.tileLayer(
                            `${import.meta.env.VITE_MAPTILER_URL}?key=${
                                import.meta.env.VITE_MAPTILER_KEY
                            }`,
                            {
                                tileSize: 512,
                                zoomOffset: -1,
                                attribution:
                                    '&copy; <a href="https://www.maptiler.com/">MapTiler</a> & <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                            }
                        ).addTo(mapInstance.current)
                    }

                    // Xóa route cũ nếu có
                    if (routingControl.current) {
                        mapInstance.current.removeControl(routingControl.current)
                    }

                    // Hiển thị tuyến đường
                    routingControl.current = L.Routing.control({
                        waypoints: [L.latLng(userLat, userLng), L.latLng(lat, lng)],
                        lineOptions: {
                            styles: [{ color: "blue", weight: 4 }],
                        },
                        createMarker: function (i, waypoint) {
                            const startIcon = L.icon({
                                iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // icon người dùng (màu xanh)
                                iconSize: [32, 32],
                                iconAnchor: [16, 32],
                                popupAnchor: [0, -32],
                            })

                            const endIcon = L.icon({
                                iconUrl: gps, // icon khách sạn (màu đỏ)
                                iconSize: [32, 32],
                                iconAnchor: [16, 32],
                                popupAnchor: [0, -32],
                            })

                            if (i === 0) {
                                return L.marker(waypoint.latLng, { icon: startIcon })
                                    .bindPopup("Vị trí của bạn")
                                    .openPopup()
                            } else {
                                return L.marker(waypoint.latLng, { icon: endIcon })
                                    .bindPopup(hotelName)
                                    .openPopup()
                            }
                        },
                        // router: L.Routing.mapbox("YOUR_MAPBOX_ACCESS_TOKEN"), // Nếu dùng Mapbox
                        // Nếu dùng mặc định OSRM miễn phí:
                        router: L.Routing.osrmv1({
                            serviceUrl: "https://router.project-osrm.org/route/v1",
                        }),
                    }).addTo(mapInstance.current)
                }, 300)
            },
            (err) => {
                console.error("Lỗi lấy vị trí:", err)
                alert("Không thể lấy vị trí hiện tại.")
            }
        )
    }, [isOpen, lat, lng, hotelName])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-[80%] rounded-xl overflow-hidden shadow-lg relative">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold">Chỉ đường đến khách sạn</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-xl">
                        &times;
                    </button>
                </div>
                <div className="p-4">
                    <div id="map" ref={mapRef} className="h-[500px] w-full rounded-lg" />
                </div>
            </div>
        </div>
    )
}

MapModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
    hotelName: PropTypes.string,
}

export default MapModal
