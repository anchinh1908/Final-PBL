import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination } from "swiper/modules"
import "~/styles/Slider.css"
import { IoIosArrowDroprightCircle, IoIosArrowDropleftCircle } from "react-icons/io"

import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import PropTypes from "prop-types"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { get_All_Rooms_By_HotelID } from "~/services/RoomService"

const Slider = ({ hotels }) => {
    const navigate = useNavigate()
    const [firstRooms, setFirstRooms] = useState([])

    useEffect(() => {
        const fetchFirstRooms = async () => {
            try {
                const roomsData = await Promise.all(
                    hotels.map(async (item) => {
                        try {
                            const { rooms } = await get_All_Rooms_By_HotelID(item.hotel.id)
                            return rooms[0] || {}
                        // eslint-disable-next-line no-unused-vars
                        } catch (error) {
                            return {} // Trả về object rỗng nếu lỗi
                        }
                    })
                )
                setFirstRooms(roomsData)
            } catch (error) {
                console.error("Lỗi không xác định:", error)
            }
        }

        if (hotels.length > 0) {
            fetchFirstRooms()
        }
    }, [hotels])

    return (
        <div className="mt-6">
            <div className="relative">
                <Swiper
                    modules={[Navigation, Pagination]}
                    spaceBetween={10}
                    centeredSlides={false}
                    slidesPerView={4}
                    navigation={{
                        nextEl: ".next-slide2",
                        prevEl: ".prev-slide2",
                    }}
                    // onSwiper={(swiper) => console.log(swiper)}
                    pagination={{ clickable: true }}>
                    {hotels &&
                        Array.isArray(hotels) &&
                        hotels.map((item, idx) => {
                            const firstRoom = firstRooms[idx] || {}
                            return (
                                <SwiperSlide key={item.hotel.id}>
                                    {item.hotel.slug && (
                                        <div
                                            onClick={() => navigate(`hotels/${item.hotel.slug}`)}
                                            className="border-[1px] m-2 bg-pureWhite border-gray-300 rounded-2xl cursor-pointer hover:scale-105 hover:bg-amber-50">
                                            <div className="relative">
                                                <img
                                                    src={item.hotel.imageUrls[0]}
                                                    alt={item.hotel.name}
                                                    className="w-full h-44 object-cover rounded-t-2xl"
                                                />
                                            </div>
                                            <div className="p-4 h-40 flex flex-col justify-between">
                                                <h3 className="font-normal">{item.hotel.name}</h3>
                                                {firstRoom.price && (
                                                    <p className="text-lg mt-2 font-bold">
                                                        VND {firstRoom?.price?.toLocaleString()}
                                                    </p>
                                                )}
                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                    {item.hotel.description}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </SwiperSlide>
                            )
                        })}
                </Swiper>

                <div className="next-slide2">
                    <IoIosArrowDroprightCircle size={40} />
                </div>

                <div className="prev-slide2">
                    <IoIosArrowDropleftCircle size={40} />
                </div>
            </div>
        </div>
    )
}

Slider.propTypes = {
    hotels: PropTypes.array.isRequired,
}

export default Slider

{
    /* <div className="w-9 h-9 absolute top-2 left-2 bg-white hover:bg-white/85 rounded-full flex justify-center items-center">
                                            {item.wishlist ? (
                                                <FavoriteIcon
                                                    sx={{ color: red[400], fontSize: 22 }}
                                                />
                                            ) : (
                                                <FavoriteBorderIcon sx={{ fontSize: 20 }} />
                                            )}
                                        </div> */
}
