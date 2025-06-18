// import FavoriteIcon from "@mui/icons-material/Favorite"
// import { useNavigate } from "react-router-dom"
// import { red } from "@mui/material/colors"
// import useMyWishlistContext from "~/hooks/useMyWishlistContext"
// import { useEffect, useState } from "react"
// import { get_All_Rooms_By_HotelID } from "~/services/RoomService"
// import { delete_My_Wishlist } from "~/services/WishlistService"
// import { useAuthContext } from "~/hooks/useAuthContext"

const MyViewHistory = () => {
    // const navigate = useNavigate()
    // const { user } = useAuthContext()
    // const [firstRooms, setFirstRooms] = useState([])

    // useEffect(() => {
    //     const fetchFirstRooms = async () => {
    //         try {
    //             const roomsData = await Promise.all(
    //                 myWishlists.map(async (item) => {
    //                     try {
    //                         const { rooms } = await get_All_Rooms_By_HotelID(item.id)
    //                         return rooms[0] || {}
    //                     } catch (error) {
    //                         console.error(`Lỗi khi lấy phòng của khách sạn ID ${item.id}:`, error)
    //                         return {} // Trả về object rỗng nếu lỗi
    //                     }
    //                 })
    //             )
    //             setFirstRooms(roomsData)
    //         } catch (error) {
    //             console.error("Lỗi không xác định:", error)
    //         }
    //     }

    //     if (myWishlists.length > 0) {
    //         fetchFirstRooms()
    //     }
    // }, [myWishlists])

    // // const checkMyWishlist = async (hotelId) => {
    // //     if (myWishlists.length > 0) {
    // //         const check = myWishlists.some((item) => item.id === hotelId)
    // //         if (check) return true
    // //         else return false
    // //     }
    // // }

    // const deleteMyWishlist = async (token, hotel) => {
    //     try {
    //         const result = await delete_My_Wishlist(token, hotel.id)
    //         if (result) {
    //             dispatch({
    //                 type: "DELETE_MYWISHLIST",
    //                 payload: hotel,
    //             })
    //         }
    //     } catch (error) {
    //         console.log("Lỗi khi xoa khoi dsy thich:", error)
    //     }
    // }

    // const handleWishlist = async (hotel) => {
    //     if (!user) {
    //         console.log("Đăng nhập để thêm")
    //     } else {
    //         const token = localStorage.getItem("token")
    //         deleteMyWishlist(token, hotel)
    //     }
    // }

    return (
        <div>
            <h1>Khách sạn đã lưu</h1>
            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {myWishlists.map((item, idx) => {
                    const firstRoom = firstRooms[idx] || {}
                    return (
                        <div
                            key={item.id}
                            onClick={() => navigate(`hotels/${item.slug}`)}
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
                })}
            </div> */}
        </div>
    )
}

export default MyViewHistory
