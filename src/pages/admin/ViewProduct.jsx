import PropTypes from "prop-types"
import { useEffect, useState } from "react"
import "~/styles/ViewProduct.css"
import { IoIosCloseCircle } from "react-icons/io"
import { RotatingLines } from "react-loader-spinner"
import { get_Hotel_By_ID } from "~/services/HotelService"
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
import StarBorderIcon from "@mui/icons-material/StarBorder"
import ClearRoundedIcon from "@mui/icons-material/ClearRounded"
import { IoIosArrowDropleftCircle, IoIosArrowDroprightCircle } from "react-icons/io"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import { get_All_Rooms_By_HotelID } from "~/services/RoomService"
import {
    calculateAverageReviewScore,
    isDiscounted,
    splitIntoColumns,
    splitParagraphBySentence,
} from "~/utils/uiHelper"
import map from "~/assets/image.png"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import ReviewBar from "~/components/common/ReviewBar"
import Section from "~/components/common/Section"

const ViewProduct = ({ closeModal, productId }) => {
    const [hotel, setHotel] = useState(null)
    const [isOpenShowImage, setIsOpenShowImage] = useState(false)
    const [imageIndex, setImageIndex] = useState(2)
    const [reviewsAvr, setReviewsAvr] = useState(0)
    const [hotelRooms, setHotelRooms] = useState([])

    useEffect(() => {
        const get_Product_Detail = async () => {
            if (productId) {
                try {
                    const product = await get_Hotel_By_ID(productId)

                    if (product) {
                        const hotel = product.hotel.hotel
                        setHotel(hotel)
                    }
                } catch (error) {
                    console.error(error)
                }
            }
        }

        get_Product_Detail()
    }, [productId])

    useEffect(() => {
        const getHotelRooms = async (hotelid) => {
            try {
                const { rooms } = await get_All_Rooms_By_HotelID(hotelid)

                setHotelRooms(rooms)
            // eslint-disable-next-line no-unused-vars
            } catch (error) {
                // console.log("Lỗi khi lấy danh sách phòng:", error)
            }
        }

        if (hotel?.id) getHotelRooms(hotel.id)

        if (hotel?.reviews) setReviewsAvr(calculateAverageReviewScore(hotel.reviews))
    }, [hotel])

    return (
        <div className="modalBackground">
            {hotel ? (
                <div className="modalContainerView">
                    <IoIosCloseCircle
                        size={28}
                        onClick={() => closeModal(false)}
                        className="close-button"
                    />
                    <div className="modalContainer">
                        {hotel && hotel.name && (
                            <Container fixed>
                                {/* {slug} */}
                                <div className="flex items-center gap-3">
                                    <h1>{hotel.name}</h1>
                                    {hotel.ratingStars > 0 && (
                                        <Rating
                                            defaultValue={hotel.ratingStars}
                                            sx={{ fontSize: 18 }}
                                            emptyIcon={
                                                <StarBorderIcon
                                                    style={{ opacity: 0 }}
                                                    fontSize="inherit"
                                                />
                                            }
                                            readOnly
                                        />
                                    )}
                                </div>
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-start gap-1">
                                        <LocationOnIcon color="primary" fontSize="small" />
                                        <p>{hotel?.address} - </p>
                                        <p className="text-blue-500 font-thin italic underline mb-2 line-clamp-3">
                                            Vị trí trên bản đồ
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className=" bg-blue-500 py-2 px-3 text-white rounded-lg">
                                            Đặt ngay
                                        </button>
                                        <Tooltip
                                            title="Thêm khách sạn này vào chuyến đi để gợi ý lịch trình du lịch phù hợp với bạn"
                                            color="#fff">
                                            <button className=" bg-blue-500 py-2 px-3 text-white rounded-lg">
                                                Chuyến đi
                                            </button>
                                        </Tooltip>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    {hotel?.imageUrls?.length > 0 && (
                                        <div>
                                            <div className="flex gap-2">
                                                <img
                                                    onClick={() => {
                                                        setIsOpenShowImage(true), setImageIndex(0)
                                                    }}
                                                    src={hotel?.imageUrls[0]}
                                                    alt={`Ảnh 1 ${hotel.name}`}
                                                    className="w-[558px] h-[372px] rounded-lg cursor-pointer"
                                                />
                                                <div>
                                                    <img
                                                        onClick={() => {
                                                            setIsOpenShowImage(true),
                                                                setImageIndex(1)
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
                                                                setIsOpenShowImage(true),
                                                                    setImageIndex(2)
                                                            }}
                                                            className="absolute bottom-0 w-full h-full rounded-lg bg-black/50 flex items-center justify-center">
                                                            <span className="text-white text-lg font-semibold underline cursor-pointer">
                                                                +{hotel.imageUrls.length - 3} ảnh
                                                            </span>
                                                        </div>
                                                        {/* modal open */}
                                                        <Modal
                                                            open={isOpenShowImage}
                                                            onClose={setIsOpenShowImage}>
                                                            <div className="w-screen h-screen flex justify-between items-center outline-none relative px-7">
                                                                <IoIosArrowDropleftCircle
                                                                    onClick={() =>
                                                                        imageIndex > 0 &&
                                                                        setImageIndex(
                                                                            imageIndex - 1
                                                                        )
                                                                    }
                                                                    size={40}
                                                                    className="text-white/50 hover:text-white/75"
                                                                />
                                                                <img
                                                                    src={
                                                                        hotel.imageUrls[imageIndex]
                                                                    }
                                                                    alt={`Ảnh 1 ${hotel.name}`}
                                                                    className="h-[90%] rounded-lg"
                                                                />
                                                                <IoIosArrowDroprightCircle
                                                                    onClick={() =>
                                                                        imageIndex <
                                                                            hotel.imageUrls.length -
                                                                                1 &&
                                                                        setImageIndex(
                                                                            imageIndex + 1
                                                                        )
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
                                    )}
                                    <div className="flex-1">
                                        {reviewsAvr > 0 && (
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
                                        )}
                                        <div className="h-36 w-full mt-5 rounded-lg">
                                            <img
                                                className="h-36 w-full object-cover rounded-lg"
                                                src={map}
                                                alt="map"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-6 mt-6 pb-6 border-b">
                                    <div className="flex-1">
                                        {splitParagraphBySentence(hotel.description).map(
                                            (sentence, idx) => (
                                                <p key={idx} className="mb-3 text-justify">
                                                    {sentence}
                                                </p>
                                            )
                                        )}

                                        {hotel?.facilities?.length > 0 && (
                                            <div>
                                                <h2 className="mb-2">Các tiện nghi nổi bật</h2>
                                                <div className="flex gap-x-6 gap-y-1.5 flex-wrap">
                                                    {hotel.facilities.map((facility, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center gap-2">
                                                            <CheckRoundedIcon color="success" />
                                                            <p>{facility}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {hotel?.highlights && typeof hotel.highlights === "object" && (
                                        <div className="w-80 bg-amber-50 rounded-lg p-4">
                                            <h2 className="mb-2">Điểm nổi bật của chỗ nghỉ</h2>
                                            {Object.entries(hotel.highlights).map(
                                                ([key, value]) => (
                                                    <div key={key}>
                                                        <h3>{key}</h3>
                                                        <p className="indent-4 text-sm py-2">
                                                            + {value}
                                                        </p>
                                                    </div>
                                                )
                                            )}
                                            <button
                                                onClick={() =>
                                                    window.open(hotel.hotelLink, "_blank")
                                                }
                                                className="mt-2 w-full py-1.5 px-3.5 bg-gray-800 rounded-md text-white">
                                                Đặt chỗ
                                            </button>
                                        </div>
                                    )}
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
                                                            <TableCell component="th">
                                                                {row.name}
                                                            </TableCell>
                                                            <TableCell>
                                                                {row.numberOfGuests} người
                                                            </TableCell>
                                                            <TableCell>
                                                                {isDiscounted(
                                                                    row.originalPrice,
                                                                    row.price
                                                                ) ? (
                                                                    <>
                                                                        <p className="text-red-600 font-bold">
                                                                            VND{" "}
                                                                            {row.price.toLocaleString()}
                                                                        </p>
                                                                        <p className="line-through text-gray-500 text-sm">
                                                                            VND{" "}
                                                                            {row.originalPrice.toLocaleString()}
                                                                        </p>
                                                                    </>
                                                                ) : (
                                                                    <p className="text-black">
                                                                        VND{" "}
                                                                        {row.originalPrice.toLocaleString()}
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

                                {reviewsAvr > 0 && (
                                    <div className="mt-4 pb-6 border-b">
                                        <h2>Đánh giá</h2>
                                        <Grid2
                                            container
                                            rowSpacing={1}
                                            columnSpacing={{ xs: 1, sm: 2, md: 4 }}>
                                            {Object.entries(hotel.reviews).map(([key, value]) => (
                                                <Grid2 key={key} size={{ xs: 12, sm: 6, md: 4 }}>
                                                    <ReviewBar label={key} score={value} />
                                                </Grid2>
                                            ))}
                                        </Grid2>
                                    </div>
                                )}

                                {hotel?.roomServices && typeof hotel.roomServices === "object" && (
                                    <div className="mt-4">
                                        <h2 className="mb-2">Các tiện nghi của {hotel.name}</h2>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {splitIntoColumns(hotel.roomServices).map(
                                                (column, colIndex) => (
                                                    <div key={colIndex}>
                                                        {column.map(
                                                            ([sectionTitle, items], index) => (
                                                                <Section
                                                                    key={index}
                                                                    title={sectionTitle}
                                                                    items={items}
                                                                />
                                                            )
                                                        )}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                            </Container>
                        )}
                    </div>
                </div>
            ) : (
                <div className="loading-login">
                    <RotatingLines
                        visible={true}
                        height="40"
                        width="40"
                        strokeColor="#00a6a9"
                        strokeWidth="5"
                        animationDuration="0.5"
                        ariaLabel="rotating-lines-loading"
                    />
                </div>
            )}
        </div>
    )
}

ViewProduct.propTypes = {
    closeModal: PropTypes.func.isRequired,
    productId: PropTypes.string.isRequired,
}

export default ViewProduct
