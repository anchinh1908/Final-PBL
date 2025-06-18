import {
    Container,
    Grid2,
    Modal,
    Rating,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
} from "@mui/material"
import { useParams } from "react-router-dom"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import { useEffect, useState } from "react"
import ClearRoundedIcon from "@mui/icons-material/ClearRounded"
import { IoIosArrowDropleftCircle, IoIosArrowDroprightCircle } from "react-icons/io"
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder"
import {
    addViewedHotel,
    calculateAverageReviewScore,
    isDiscounted,
    splitIntoColumns,
    splitParagraphBySentence,
} from "~/utils/uiHelper"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import ReviewBar from "~/components/common/ReviewBar"
import Section from "~/components/common/Section"
import map from "~/assets/image.png"
import { get_Hotel_By_Slug, get_Nearest_Place_By_HotelID } from "~/services/HotelService"
import { get_All_Rooms_By_HotelID } from "~/services/RoomService"
import { useAuthContext } from "~/hooks/useAuthContext"
import FavoriteIcon from "@mui/icons-material/Favorite"
import useMyWishlistContext from "~/hooks/useMyWishlistContext"
import { add_My_Wishlist, delete_My_Wishlist } from "~/services/WishlistService"
import StarBorderIcon from "@mui/icons-material/StarBorder"
import { add_Hotel_My_Trip } from "~/services/TripService"
import Notification from "~/components/common/Notification"
import { RotatingLines } from "react-loader-spinner"
import MapModal from "~/components/user/MapModal"

const HotelDetail = () => {
    // const navigate = useNavigate()
    const { user } = useAuthContext()
    const { myWishlists, dispatch } = useMyWishlistContext()

    const { slug } = useParams()
    const [isOpenShowImage, setIsOpenShowImage] = useState(false)
    const [imageIndex, setImageIndex] = useState(2)
    const [reviewsAvr, setReviewsAvr] = useState(0)
    const [hotel, setHotel] = useState({})
    const [nearestPlace, setNearestPlace] = useState([])
    const [hotelRooms, setHotelRooms] = useState([])
    const [wishlist, setWishlist] = useState(false)

    const [loading, setLoading] = useState(false)
    const [notification, setNotification] = useState(null)
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        const getHotelBySlug = async (slug) => {
            try {
                setLoading(true)
                const { hotel } = await get_Hotel_By_Slug(slug)
                setHotel(hotel.hotel)
            } catch (error) {
                setNotification({
                    type: "error",
                    message: error.message || "Không thể tải lên khách sạn",
                })
            } finally {
                setLoading(false)
            }
        }

        window.scrollTo({ top: 0, behavior: "instant" })
        getHotelBySlug(slug)
    }, [slug])

    useEffect(() => {
        const getNearestPlace = async (hotelid, distance) => {
            try {
                const { places } = await get_Nearest_Place_By_HotelID(hotelid, distance)
                setNearestPlace(places)
            } catch (error) {
                setNotification({
                    type: "error",
                    message: error.message || "Không thể tải danh sách địa điểm gần khách sạn",
                })
            }
        }

        const getHotelRooms = async (hotelid) => {
            try {
                const { rooms } = await get_All_Rooms_By_HotelID(hotelid)
                setHotelRooms(rooms)
            } catch (error) {
                setNotification({
                    type: "error",
                    message: error.message || "Không thể tải danh sách phòng của khách sạn",
                })
            }
        }

        if (hotel?.id) {
            getNearestPlace(hotel.id)
            getHotelRooms(hotel.id)
            if (user) addViewedHotel(hotel.id)
        }

        if (hotel?.reviews) {
            setReviewsAvr(calculateAverageReviewScore(hotel.reviews))
        }
    }, [hotel])

    useEffect(() => {
        const checkMyWishlist = async (hotelId) => {
            if (myWishlists.length > 0) {
                const check = myWishlists.some((item) => item.id === hotelId)
                if (check) setWishlist(true)
                else setWishlist(false)
            }
        }

        checkMyWishlist(hotel.id)
    }, [hotel.id, myWishlists])

    const addMyWishlist = async (token) => {
        try {
            const result = await add_My_Wishlist(token, hotel.id)
            if (result) {
                setWishlist(true)
                dispatch({
                    type: "ADD_MYWISHLIST",
                    payload: hotel,
                })
                setNotification({
                    type: "success",
                    message: "Đã thêm khách sạn này vào danh sách yêu thích!",
                })
            }
        } catch (error) {
            setNotification({
                type: "error",
                message: error.message || "Không thể thêm khách sạn này vào danh sách yêu thích!",
            })
            setWishlist(false)
        }
    }

    const deleteMyWishlist = async (token) => {
        try {
            const result = await delete_My_Wishlist(token, hotel.id)
            if (result) {
                setWishlist(false)
                dispatch({
                    type: "DELETE_MYWISHLIST",
                    payload: hotel,
                })
                setNotification({
                    type: "success",
                    message: "Đã xoá khách sạn này khỏi danh sách yêu thích!",
                })
            }
        } catch (error) {
            setNotification({
                type: "error",
                message: error.message || "Không thể xoá khách sạn này khỏi danh sách yêu thích!",
            })
            setWishlist(true)
        }
    }

    const handleWishlist = async () => {
        if (!user) {
            setNotification({
                type: "warning",
                message: "Vui lòng đăng nhập trước khi thực hiện!",
            })
        } else {
            const token = localStorage.getItem("token")
            if (!wishlist) addMyWishlist(token)
            else deleteMyWishlist(token)
        }
    }

    const addHotelToMyTrip = async (token) => {
        try {
            const result = await add_Hotel_My_Trip(token, hotel.id)
            if (result) {
                setNotification({
                    type: "success",
                    message: "Thêm khách sạn vào chuyến đi thành công!",
                })
            }
        } catch (error) {
            setNotification({
                type: "error",
                message: error.message || "Không thể thêm khách sạn này vào chuyến đi!",
            })
        }
    }

    const handleMyTrip = async () => {
        if (!user) {
            setNotification({
                type: "warning",
                message: "Vui lòng đăng nhập trước khi thực hiện!",
            })
        } else {
            const token = localStorage.getItem("token")
            await addHotelToMyTrip(token)
        }
    }

    return (
        <div className="bg-white py-6">
            {hotel && hotel.name && (
                <Container fixed>
                    <div className="flex items-center gap-3">
                        <h1>{hotel.name}</h1>
                        {hotel.ratingStars > 0 && (
                            <Rating
                                defaultValue={hotel.ratingStars}
                                sx={{ fontSize: 18 }}
                                emptyIcon={
                                    <StarBorderIcon style={{ opacity: 0 }} fontSize="inherit" />
                                }
                                readOnly
                            />
                        )}
                    </div>
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-start gap-1">
                            <LocationOnIcon color="primary" fontSize="small" />
                            <p>{hotel?.address}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div
                                className="hover:bg-amber-50 rounded-md p-2"
                                onClick={() => handleWishlist()}>
                                {/* <FavoriteBorderIcon className="text-amber-600" /> */}
                                {wishlist ? (
                                    <FavoriteIcon className="text-coralBlaze" />
                                ) : (
                                    <FavoriteBorderIcon className="text-coralBlaze" />
                                )}
                            </div>
                            <button
                                onClick={() => window.open(hotel.hotelLink, "_blank")}
                                className=" bg-blue-500 py-2 px-3 text-white rounded-lg text-base">
                                Đặt ngay
                            </button>
                            <Tooltip
                                title="Thêm khách sạn này vào chuyến đi để gợi ý lịch trình du lịch phù hợp với bạn"
                                color="#fff">
                                <button
                                    onClick={() => handleMyTrip()}
                                    className=" bg-blue-500 py-2 px-3 text-white rounded-lg text-base">
                                    Chuyến đi
                                </button>
                            </Tooltip>
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <div>
                            <div className="flex gap-2">
                                <img
                                    onClick={() => {
                                        setIsOpenShowImage(true), setImageIndex(0)
                                    }}
                                    src={hotel.imageUrls[0]}
                                    alt={`Ảnh 1 ${hotel.name}`}
                                    className="w-[558px] h-[372px] rounded-lg cursor-pointer"
                                />
                                <div>
                                    <img
                                        onClick={() => {
                                            setIsOpenShowImage(true), setImageIndex(1)
                                        }}
                                        src={hotel.imageUrls[1]}
                                        alt={`Ảnh 2 ${hotel.name}`}
                                        className="w-[273px] h-[182px] mb-2 rounded-lg cursor-pointer"
                                    />
                                    <div className="relative">
                                        <img
                                            src={hotel.imageUrls[2]}
                                            alt={`Ảnh 3 ${hotel.name}`}
                                            className="w-[273px] h-[182px] rounded-lg"
                                        />
                                        <div
                                            onClick={() => {
                                                setIsOpenShowImage(true), setImageIndex(2)
                                            }}
                                            className="absolute bottom-0 w-full h-full rounded-lg bg-black/50 flex items-center justify-center">
                                            <span className="text-white text-lg font-semibold underline cursor-pointer">
                                                +{hotel.imageUrls.length - 3} ảnh
                                            </span>
                                        </div>
                                        {/* modal open */}
                                        <Modal open={isOpenShowImage} onClose={setIsOpenShowImage}>
                                            <div className="w-screen h-screen flex justify-between items-center outline-none relative px-7">
                                                <IoIosArrowDropleftCircle
                                                    onClick={() =>
                                                        imageIndex > 0 &&
                                                        setImageIndex(imageIndex - 1)
                                                    }
                                                    size={40}
                                                    className="text-white/50 hover:text-white/75"
                                                />
                                                <img
                                                    src={hotel.imageUrls[imageIndex]}
                                                    alt={`Ảnh 1 ${hotel.name}`}
                                                    className="h-[90%] rounded-lg"
                                                />
                                                <IoIosArrowDroprightCircle
                                                    onClick={() =>
                                                        imageIndex < hotel.imageUrls.length - 1 &&
                                                        setImageIndex(imageIndex + 1)
                                                    }
                                                    size={40}
                                                    className="text-white/50 hover:text-white/75"
                                                />
                                                <ClearRoundedIcon
                                                    onClick={() => {
                                                        setIsOpenShowImage(false)
                                                    }}
                                                    fontSize="medium"
                                                    className="text-white absolute top-4 right-4"
                                                />
                                            </div>
                                        </Modal>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-end gap-2">
                                <p className="text-lg">
                                    {reviewsAvr > 9
                                        ? "Tuyệt vời"
                                        : reviewsAvr > 8
                                        ? "Rất tốt"
                                        : reviewsAvr > 7
                                        ? "Tốt"
                                        : "Dễ chịu"}
                                </p>
                                <div className="h-9 bg-blue-600 px-1.5 rounded-t-lg rounded-br-lg flex items-center text-white font-bold text-xl">
                                    {reviewsAvr}
                                </div>
                            </div>
                            <div className="h-52 mt-5 rounded-lg relative">
                                <img className="h-52 object-cover rounded-lg" src={map} alt="map" />
                                <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-center">
                                    <button
                                        onClick={() => setShowModal(true)}
                                        className="w-4/5 text-center text-base text-white bg-oceanSlate py-2 rounded-xl shadow-lg">
                                        Xem đường đi
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-start gap-6 mt-6 pb-6 border-b">
                        <div className="flex-1">
                            {splitParagraphBySentence(hotel.description).map((sentence, idx) => (
                                <p key={idx} className="mb-3 text-justify">
                                    {sentence}
                                </p>
                            ))}

                            <h2 className="mb-2">Các tiện nghi nổi bật</h2>
                            <div className="flex gap-x-6 gap-y-1.5 flex-wrap">
                                {hotel.facilities.map((facility, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <CheckRoundedIcon color="success" />
                                        <p>{facility}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="w-80 bg-amber-50 rounded-lg p-4">
                            <h2 className="mb-2">Điểm nổi bật của chỗ nghỉ</h2>
                            {Object.entries(hotel.highlights).map(([key, value]) => (
                                <div key={key}>
                                    <h3>{key}</h3>
                                    {value.map((itm, idx) => (
                                        <p key={idx} className="indent-4 text-sm py-2">
                                            + {itm}
                                        </p>
                                    ))}
                                </div>
                            ))}
                            <button
                                onClick={() => window.open(hotel.hotelLink, "_blank")}
                                className="mt-2 w-full py-1.5 px-3.5 bg-gray-800 rounded-md text-white text-base">
                                Đặt chỗ
                            </button>
                        </div>
                    </div>
                    <div className="mt-4 pb-3 border-b">
                        <h1 className="mb-2">Các địa điểm tham quan gần đây</h1>
                        <Grid2 container rowSpacing={1} columnSpacing={{ xs: 1, sm: 3, md: 6 }}>
                            {nearestPlace.length > 0 &&
                                nearestPlace.map((item) => (
                                    <Grid2 key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
                                        <div className="flex items-end mb-1.5">
                                            <p className="leading-none">{item.title}</p>
                                            <div className="flex-1 mx-3 mb-0.5 border-b-2 border-dotted border-gray-400"></div>
                                            <p className="leading-none">
                                                {(item.distanceInMeters / 1000).toFixed(2)} km
                                            </p>
                                        </div>
                                    </Grid2>
                                ))}
                        </Grid2>
                    </div>
                    {hotelRooms.length > 0 && (
                        <div className="mt-4 pb-3">
                            <h1>Phòng trống</h1>
                            <TableContainer className="bg-white no-padding-shadow-box-hover mt-6">
                                <Table aria-label="simple table" size="small">
                                    <TableHead>
                                        <TableRow style={{ height: 65 }}>
                                            <TableCell>Tên phòng</TableCell>
                                            <TableCell>Số lượng</TableCell>
                                            <TableCell>Giá</TableCell>
                                            <TableCell>Ghi chú</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {hotelRooms.map((row) => (
                                            <TableRow
                                                key={row.id}
                                                style={{ height: 65 }}
                                                className={`table-row`}>
                                                <TableCell component="th">{row.name}</TableCell>
                                                <TableCell>{row.numberOfGuests} người</TableCell>
                                                <TableCell>
                                                    {isDiscounted(row.originalPrice, row.price) ? (
                                                        <>
                                                            <p className="text-red-600 font-bold">
                                                                VND {row.price.toLocaleString()}
                                                            </p>
                                                            <p className="line-through text-gray-500 text-sm">
                                                                VND{" "}
                                                                {row.originalPrice.toLocaleString()}
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <p className="text-black">
                                                            VND {row.originalPrice.toLocaleString()}
                                                        </p>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {row.taxesAndFeesUnderPrice && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            (Đã bao gồm thuế và phí)
                                                        </p>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                    )}

                    <div className="mt-4 pb-6 border-b">
                        <h2>Đánh giá</h2>
                        <Grid2 container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 4 }}>
                            {Object.entries(hotel.reviews).map(([key, value]) => (
                                <Grid2 key={key} size={{ xs: 12, sm: 6, md: 4 }}>
                                    <ReviewBar label={key} score={value} />
                                </Grid2>
                            ))}
                        </Grid2>
                    </div>

                    <div className="mt-4">
                        <h2 className="mb-2">Các tiện nghi của {hotel.name}</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {splitIntoColumns(hotel.roomServices).map((column, colIndex) => (
                                <div key={colIndex}>
                                    {column.map(([sectionTitle, items], index) => (
                                        <Section key={index} title={sectionTitle} items={items} />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </Container>
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

            {hotel?.latitude && (
                <MapModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    lat={hotel.latitude}
                    lng={hotel.longitude}
                    hotelName={hotel.name}
                />
            )}
        </div>
    )
}

export default HotelDetail
