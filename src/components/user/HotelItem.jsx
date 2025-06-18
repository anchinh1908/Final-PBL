import { calculateAverageReviewScore } from "~/utils/uiHelper"
// import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder"
// import FavoriteIcon from "@mui/icons-material/Favorite"
import PropTypes from "prop-types"
import { Rating } from "@mui/material"
import { green } from "@mui/material/colors"
import StarBorderIcon from "@mui/icons-material/StarBorder"
import DoneIcon from "@mui/icons-material/Done"
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"
import { useEffect, useState } from "react"
import { get_All_Rooms_By_HotelID } from "~/services/RoomService"

const HotelItem = ({ item, navigate, smallImage = false }) => {
    const [firstRoom, setFirstRoom] = useState({})
    // const text = smallImage ? "text-sm" : "text-base"

    const averageReviewScore = calculateAverageReviewScore(item.hotel.reviews || [])

    useEffect(() => {
        const firstRoomHotels = async (hotelid) => {
            try {
                const { rooms } = await get_All_Rooms_By_HotelID(hotelid)
                setFirstRoom(rooms[0])
                // eslint-disable-next-line no-unused-vars
            } catch (error) {
                // console.log("Lỗi khi lấy danh sách phòng:", error)
                return
            }
        }

        if (item.rooms) setFirstRoom(item.rooms[0])
        else firstRoomHotels(item.hotel.id)
    }, [item])

    // if (!firstRoom || !firstRoom.name || !firstRoom.price) return null

    return (
        <div key={item.hotel.id} className="shadow-box flex gap-4">
            <div className="relative">
                <img
                    src={item.hotel.imageUrls[0]}
                    alt={item.hotel.name}
                    className={`rounded-lg ${smallImage ? "size-40" : "size-60"}`}
                />
                {/* <div className="w-9 h-9 absolute top-2 right-2 bg-white hover:bg-white/85 rounded-full flex justify-center items-center">
                    {item.hotel?.wishlist ? (
                        <FavoriteIcon sx={{ color: red[400], fontSize: 22 }} />
                    ) : (
                        <FavoriteBorderIcon sx={{ fontSize: 20 }} />
                    )}
                </div> */}
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                    <p className={`font-bold ${smallImage ? "text-xl" : "text-2xl"}`}>
                        {item.hotel.name}
                    </p>
                    {item.hotel.ratingStars > 0 && (
                        <Rating
                            defaultValue={item.hotel.ratingStars}
                            sx={{ fontSize: 20 }}
                            emptyIcon={<StarBorderIcon style={{ opacity: 0 }} fontSize="inherit" />}
                            readOnly
                        />
                    )}
                    {calculateAverageReviewScore(item.hotel.reviews) > 9 ? (
                        <span className="font-thin text-base border-[1px] text-gray-600 border-gray-600 rounded-lg px-2 py-1">
                            Nổi bật
                        </span>
                    ) : null}
                </div>
                <p className="text-justify line-clamp-3 text-base">{item.hotel.description}</p>
                <div className="flex gap-1 mt-2 text-base">
                    <p className="font-bold text-base">Dịch vụ phòng:</p>
                    {item.hotel.facilities.join(", ")}
                </div>
                <div className="flex gap-4 mt-2">
                    <div className="outline outline-1 outline-gray-300" />
                    <div>
                        <p className="font-bold text-base">{firstRoom?.name}</p>
                        {item.hotel.facilities.slice(0, 3).map((item, i) => (
                            <div key={i} className="flex gap-4">
                                <DoneIcon
                                    sx={{
                                        color: green["700"],
                                        fontSize: 20,
                                    }}
                                />
                                <p className="text-green-700 text-base">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex flex-col justify-between">
                {averageReviewScore > 0 ? (
                    <div className="flex items-center justify-end gap-2">
                        <p className="text-lg">
                            {averageReviewScore > 9
                                ? "Tuyệt vời"
                                : averageReviewScore > 8
                                ? "Rất tốt"
                                : averageReviewScore > 7
                                ? "Tốt"
                                : "Dễ chịu"}
                        </p>
                        <div className="h-10 bg-blue-800 px-2 rounded-t-lg rounded-br-lg flex items-center text-white font-bold text-2xl">
                            {averageReviewScore}
                        </div>
                    </div>
                ) : (
                    <div />
                )}
                {firstRoom && firstRoom.price && item.hotel.slug ? (
                    <div className="flex flex-col items-end">
                        <p className="text-gray-500 text-base">
                            1 đêm, {firstRoom.numberOfGuests} người lớn
                        </p>
                        <p className={`text-black font-bold ${smallImage ? "text-xl" : "text-2xl"}`}>
                            VND {firstRoom?.price?.toLocaleString()}
                        </p>
                        <button
                            onClick={() => navigate(`/hotels/${item.hotel.slug}`)}
                            className="mt-2 py-1.5 px-3.5 bg-blue-500 rounded-md text-white">
                            Xem phòng
                            <ArrowForwardIosIcon
                                sx={{
                                    fontSize: 15,
                                    color: "white",
                                    marginLeft: 1,
                                }}
                            />
                        </button>
                    </div>
                ) : (
                    <div></div>
                )}
            </div>
        </div>
    )
}

HotelItem.propTypes = {
    item: PropTypes.object.isRequired,
    navigate: PropTypes.func.isRequired,
    smallImage: PropTypes.bool,
}

export default HotelItem
