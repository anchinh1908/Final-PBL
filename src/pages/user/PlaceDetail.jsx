import { Container, Grid2, Rating } from "@mui/material"
import { useState } from "react"
import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { get_Nearest_Hotel_By_PlaceID, get_Place_By_Slug } from "~/services/PlaceService"
import StarBorderIcon from "@mui/icons-material/StarBorder"
import Notification from "~/components/common/Notification"
import { RotatingLines } from "react-loader-spinner"

const PlaceDetail = () => {
    // const navigate = useNavigate()

    const { slug } = useParams()

    const [place, setPlace] = useState({})
    const [nearestHotel, setNearestHotel] = useState([])

    const [loading, setLoading] = useState(false)
    const [notification, setNotification] = useState(null)

    useEffect(() => {
        const getPlaceBySlug = async (slug) => {
            try {
                setLoading(true)
                const { place } = await get_Place_By_Slug(slug)
                setPlace(place)
            } catch (error) {
                setNotification({
                    type: "error",
                    message: error.message || "Không thể tải địa điểm",
                })
            } finally {
                setLoading(false)
            }
        }

        window.scrollTo({ top: 0, behavior: "instant" })
        getPlaceBySlug(slug)
    }, [slug])

    useEffect(() => {
        const getNearestHotel = async (placeid, distance) => {
            try {
                const { hotels } = await get_Nearest_Hotel_By_PlaceID(placeid, distance)
                setNearestHotel(hotels)
            } catch (error) {
                setNotification({
                    type: "error",
                    message: error.message || "Không thể tải danh sách khách sạn gần địa điểm",
                })
            }
        }

        if (place?.id) getNearestHotel(place.id)
    }, [place])

    return (
        <div className="bg-white py-6">
            {loading && (
                <div className="w-full flex justify-center mt-10">
                    <RotatingLines
                        visible={true}
                        height="40"
                        width="40"
                        strokeColor="#a8dadc"
                        strokeWidth="5"
                        animationDuration="0.5"
                        ariaLabel="rotating-lines-loading"
                    />
                </div>
            )}

            {place && (
                <Container fixed>
                    <div className="flex gap-10">
                        <div className="flex-1">
                            <h1 className="text-4xl">{place?.title}</h1>
                            <div className="flex gap-2 my-3">
                                {place && place.rating && (
                                    <Rating
                                        value={place?.rating}
                                        sx={{ fontSize: 22 }}
                                        emptyIcon={
                                            <StarBorderIcon
                                                style={{ opacity: 0.55 }}
                                                fontSize="inherit"
                                            />
                                        }
                                        precision={0.1}
                                        readOnly
                                    />
                                )}

                                {place.review > 0 && (
                                    <p>{place?.review.toLocaleString()} đánh giá</p>
                                )}
                            </div>
                            <p>{place.address}</p>
                            <p className="text-justify my-2">{place?.description}</p>
                        </div>
                        <div className="flex-1">
                            <img
                                src={place?.imageUrl}
                                alt={place.title}
                                className="w-full rounded-2xl"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
                        {Array.isArray(place?.services) &&
                            place?.services.length > 0 &&
                            place?.services.map((group, index) => {
                                const category = Object.keys(group)[0]
                                const items = group[category]
                                return (
                                    <div key={index} className="bg-gray-50 rounded-xl p-4 border">
                                        <h2 className="font-semibold text-lg mb-2">{category}</h2>
                                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                                            {items.map((item, i) => (
                                                <li key={i}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )
                            })}
                    </div>

                    <div className="mt-10 pt-8 border-t pb-3">
                        <h1 className="mb-2">Các địa điểm tham quan gần đây</h1>
                        <Grid2 container rowSpacing={1} columnSpacing={{ xs: 1, sm: 3, md: 6 }}>
                            {nearestHotel.length > 0 &&
                                nearestHotel.map((item) => (
                                    <Grid2 key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
                                        <div className="flex items-end mb-1.5">
                                            <p className="leading-none">{item.name}</p>
                                            <div className="flex-1 mx-3 mb-0.5 border-b-2 border-dotted border-gray-400"></div>
                                            <p className="leading-none">
                                                {(item.distanceInMeters / 1000).toFixed(2)} km
                                            </p>
                                        </div>
                                    </Grid2>
                                ))}
                        </Grid2>
                    </div>
                </Container>
            )}

            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                    duration={3000}
                />
            )}
        </div>
    )
}

export default PlaceDetail
