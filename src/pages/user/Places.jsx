import { Container, Radio } from "@mui/material"
import { useEffect, useState } from "react"
import { RotatingLines } from "react-loader-spinner"
import { useNavigate } from "react-router-dom"
import Notification from "~/components/common/Notification"
import usePlaceContext from "~/hooks/usePlaceContext"
import { get_All_Places, search_Places_By_District } from "~/services/PlaceService"
import { district } from "~/utils/district"

const Places = () => {
    const navigate = useNavigate()

    const [selectedDistrict, setSelectedDistrict] = useState("")
    const { places, dispatch } = usePlaceContext()

    const [loading, setLoading] = useState(false)
    const [notification, setNotification] = useState(null)

    const getAllPlaces = async (page, size) => {
        try {
            setLoading(true)
            const { data, totalPages, currentPage } = await get_All_Places(page, size)

            dispatch({
                type: "FETCH_PLACES",
                payload: {
                    places: data,
                    totalPages,
                    currentPage,
                },
            })
        } catch (error) {
            setNotification({
                type: "error",
                message: error.message || "Không thể tải danh sách địa điểm",
            })
        } finally {
            setLoading(false)
        }
    }

    const searchPlaces = async (district) => {
        try {
            setLoading(true)
            const { data, totalPages, currentPage } = await search_Places_By_District(district)

            dispatch({
                type: "FETCH_PLACES",
                payload: {
                    places: data,
                    totalPages,
                    currentPage,
                },
            })
        } catch (error) {
            setNotification({
                type: "error",
                message: error.message || "Không thể tải danh sách địa điểm",
            })
            dispatch({
                type: "FETCH_PLACES",
                payload: {
                    places: [],
                    totalPages: 1,
                    currentPage: 1,
                },
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getAllPlaces(1, 200)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (selectedDistrict) searchPlaces(selectedDistrict)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDistrict])

    return (
        <Container fixed className="py-6 flex gap-5 items-start">
            <div className="rounded-lg w-64 bg-white shadow-lg">
                <div className="pr-3 pt-3 border-b">
                    <p className="pl-3 font-bold">Khu vực</p>
                    <div>
                        {district.map((item, idx) => (
                            <div key={idx} className="flex items-start">
                                <Radio
                                    checked={selectedDistrict === item}
                                    onChange={() => setSelectedDistrict(item)}
                                    size="small"
                                    color="default"
                                />
                                <p className="text-sm pt-[9px]">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {!loading && (
                <div className="flex-1 flex flex-col gap-4">
                    <div className="pb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {places.map((item) => (
                            <div key={item.id}>
                                {item.slug && (
                                    <div
                                        key={item.id}
                                        onClick={() => navigate(`/places/${item.slug}`)}
                                        className="no-padding-shadow-box-hover border border-amber-50 relative cursor-pointer rounded-2xl overflow-hidden">
                                        <img
                                            src={item.imageUrl}
                                            alt={item.title}
                                            className="w-full h-48 object-cover"
                                        />
                                        <div className="w-full h-20 absolute bottom-0 bg-black/50 flex justify-center items-center p-3 text-center">
                                            <p className="text-white">{item.title}</p>
                                        </div>

                                        <div className="bg-amber-50 w-8 h-8 rounded-full absolute top-1.5 right-1.5 flex items-center justify-center">
                                            <p className="font-bold">{item.rating}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

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

            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                    duration={3000}
                />
            )}
        </Container>
    )
}

export default Places
