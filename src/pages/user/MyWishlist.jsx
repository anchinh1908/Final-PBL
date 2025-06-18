import FavoriteIcon from "@mui/icons-material/Favorite"
import { useNavigate } from "react-router-dom"
import { red } from "@mui/material/colors"
import useMyWishlistContext from "~/hooks/useMyWishlistContext"
import { useEffect, useState } from "react"
import { get_All_Rooms_By_HotelID } from "~/services/RoomService"
import { delete_My_Wishlist } from "~/services/WishlistService"
import { useAuthContext } from "~/hooks/useAuthContext"
import { RotatingLines } from "react-loader-spinner"
import Notification from "~/components/common/Notification"

const MyWishlist = () => {
    const navigate = useNavigate()
    const { user } = useAuthContext()
    const { myWishlists, dispatch } = useMyWishlistContext()

    const [firstRooms, setFirstRooms] = useState([])

    const [loading, setLoading] = useState(false)
    const [notification, setNotification] = useState(null)

    useEffect(() => {
        const fetchFirstRooms = async () => {
            setLoading(true)
            try {
                const roomsData = await Promise.all(
                    myWishlists.map(async (item) => {
                        try {
                            const { rooms } = await get_All_Rooms_By_HotelID(item.id)
                            return rooms[0] || {}
                        // eslint-disable-next-line no-unused-vars
                        } catch (error) {
                            // console.log(
                            //     `Lỗi khi lấy phòng của khách sạn ID ${item.id}:`,
                            //     error.message || error
                            // )
                            return {}
                        }
                    })
                )
                setFirstRooms(roomsData)
            } catch (error) {
                setNotification({
                    type: "error",
                    message: error.message || "Không thể tải danh sách phòng yêu thích.",
                })
            } finally {
                setLoading(false)
            }
        }

        if (myWishlists.length > 0) {
            fetchFirstRooms()
        }
    }, [myWishlists])

    const deleteMyWishlist = async (token, hotel) => {
        try {
            const result = await delete_My_Wishlist(token, hotel.id)
            if (result) {
                dispatch({
                    type: "DELETE_MYWISHLIST",
                    payload: hotel,
                })
                setNotification({
                    type: "success",
                    message: `Đã xóa khách sạn ${hotel.name} khỏi danh sách yêu thích.`,
                })
            }
        } catch (error) {
            setNotification({
                type: "error",
                message: error.message || "Không thể xóa khách sạn khỏi danh sách yêu thích.",
            })
        }
    }

    const handleWishlist = async (hotel) => {
        if (!user) {
            setNotification({
                type: "warning",
                message: "Vui lòng đăng nhập để xóa khách sạn khỏi danh sách yêu thích.",
            })
        } else {
            const token = localStorage.getItem("token")
            await deleteMyWishlist(token, hotel)
        }
    }

    return (
        <div>
            <h1>Khách sạn đã lưu</h1>
            {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {myWishlists.length > 0 ? (
                        myWishlists.map((item, idx) => {
                            const firstRoom = firstRooms[idx] || {}
                            return (
                                <div
                                    key={item.id}
                                    onClick={() => navigate(`/hotels/${item.slug}`)}
                                    className="border border-gray-300 rounded-2xl cursor-pointer hover:shadow-md hover:bg-amber-50">
                                    <div className="relative">
                                        <img
                                            src={item.imageUrls[0]}
                                            alt={item.name}
                                            className="w-full h-44 object-cover rounded-t-2xl"
                                        />
                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleWishlist(item)
                                            }}
                                            className="w-9 h-9 absolute top-2 left-2 bg-white hover:bg-white/85 rounded-full flex justify-center items-center">
                                            <FavoriteIcon sx={{ color: red[400], fontSize: 22 }} />
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-normal">{item.name}</h3>
                                        <p className="text-lg mt-2 font-bold">
                                            VND {firstRoom?.price?.toLocaleString()}
                                        </p>
                                        <p className="text-sm text-gray-600 line-clamp-2">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div>Chưa thêm khách sạn nào vào danh sách yêu thích</div>
                    )}
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
        </div>
    )
}

export default MyWishlist
