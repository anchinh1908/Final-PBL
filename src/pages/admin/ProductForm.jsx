import { useEffect, useState } from "react"
import "~/styles/ProductForm.css"
import { IoClose } from "react-icons/io5"
import { Checkbox, FormControlLabel, MenuItem, Rating, Select } from "@mui/material"
import { FaMinusCircle } from "react-icons/fa"
import { MdAddCircleOutline } from "react-icons/md"
import CustomInput from "~/components/common/CustomInput"
import { district } from "~/utils/district"
import { facilities } from "~/utils/facilities"
import { createSlug } from "~/utils/slugHelper"
import { highlights } from "~/utils/hightlights"
import { roomServices } from "~/utils/roomServices"
import PropTypes from "prop-types"
import Notification from "~/components/common/Notification"
import { add_New_Hotel, update_Hotel } from "~/services/HotelService"
import { add_New_Room, delete_Rooms, update_Room } from "~/services/RoomService"
import { RotatingLines } from "react-loader-spinner"
import MultipleSelect from "~/components/common/MultipleSelect"
import { defaultHotelDetails, defaultRoomDetails } from "~/utils/defaultTable"
import { reviews } from "~/utils/reviews"
import MapPickerModal from "~/components/admin/MapPickerModal"

const ProductForm = ({ hotel }) => {
    const [productDetails, setProductDetails] = useState(defaultHotelDetails)
    const [imageLocal, setImageLocal] = useState([])
    const [location, setLocation] = useState({ lat: 0, lng: 0 })
    const [address, setAddress] = useState("")

    const [modalOpen, setModalOpen] = useState(false)
    // const [selectedLocation, setSelectedLocation] = useState(null)

    const [loading, setLoading] = useState(false)
    const [notification, setNotification] = useState(null)

    const setDefaultHotel = (hotel) => {
        setProductDetails(hotel)
        setLocation({ lat: hotel?.latitude || 0, lng: hotel?.longitude || 0 })
        setAddress(hotel?.address || "")
    }

    useEffect(() => {
        setDefaultHotel(hotel)
    }, [hotel])

    const handleProductDetailsChange = (e, field = null, index) => {
        const { name, value } = e.target

        const simpleFields = ["name", "district", "slug", "description", "hotelLink", "ratingStars"]
        if (simpleFields.includes(name)) {
            setProductDetails((prevProductDetails) => ({
                ...prevProductDetails,
                [name]: name === "ratingStars" ? Number(value) : value,
            }))

            if (name === "name" && !productDetails?.id)
                setProductDetails((prev) => ({ ...prev, slug: createSlug(value) }))

            return
        }

        if (field === "imageUrls" && typeof index === "number") {
            setProductDetails((prevProductDetails) => ({
                ...prevProductDetails,
                [field]: prevProductDetails[field].filter((_, i) => i !== index),
            }))

            return
        }

        if (name === "facilities") {
            setProductDetails((prev) => ({
                ...prev,
                [name]: typeof value === "string" ? value.split(",") : value,
            }))

            return
        }

        if (name === "highlights" && field) {
            setProductDetails((prevProductDetails) => ({
                ...prevProductDetails,
                [name]: {
                    ...prevProductDetails[name],
                    [field]: typeof value === "string" ? value.split(",") : value,
                },
            }))

            return
        }

        if (name === "reviews" && field) {
            setProductDetails((prevProductDetails) => ({
                ...prevProductDetails,
                [name]: {
                    ...prevProductDetails[name],
                    [field]: value,
                },
            }))

            return
        }

        if (name === "roomServices") {
            if (!field) {
                const selectedGroups = typeof value === "string" ? value.split(",") : value

                setProductDetails((prev) => {
                    const updated = {}

                    selectedGroups.forEach((group) => {
                        updated[group] = prev.roomServices?.[group] || []
                    })

                    return {
                        ...prev,
                        roomServices: updated,
                    }
                })
            } else {
                setProductDetails((prevProductDetails) => ({
                    ...prevProductDetails,
                    [name]: {
                        ...prevProductDetails[name],
                        [field]: typeof value === "string" ? value.split(",") : value,
                    },
                }))
            }

            return
        }
    }

    const handlePosition = (value, name) => {
        if (name === "address") {
            if (value) {
                setProductDetails((prevProductDetails) => ({
                    ...prevProductDetails,
                    [name]: value,
                }))
                setAddress(value)
            } else
                setProductDetails((prevProductDetails) => ({
                    ...prevProductDetails,
                    [name]: address,
                }))
        } else {
            if (value.lat && value.lng) {
                setProductDetails((prevProductDetails) => ({
                    ...prevProductDetails,
                    latitude: value.lat,
                    longitude: value.lng,
                }))
                setLocation(value)
            } else
                setProductDetails((prevProductDetails) => ({
                    ...prevProductDetails,
                    latitude: location.lat,
                    longitude: location.lng,
                }))
        }
    }

    const handleAddRoom = () => {
        setProductDetails((prevProductDetails) => ({
            ...prevProductDetails,
            roomTypes: [...prevProductDetails.roomTypes, defaultRoomDetails],
        }))
    }

    const handleRemoveRoom = (index) => {
        setProductDetails((prevProductDetails) => ({
            ...prevProductDetails,
            roomTypes: prevProductDetails.roomTypes.filter((_, i) => i !== index),
        }))
    }

    const handleUpdateRoom = (e, index) => {
        const { name, value } = e.target

        setProductDetails((prevProductDetails) => ({
            ...prevProductDetails,
            roomTypes: prevProductDetails.roomTypes.map((item, i) =>
                i === index ? { ...item, [name]: value } : item
            ),
        }))
    }

    const handleImageChange = (event) => {
        const files = Array.from(event.target.files)
        if (files.length > 0) {
            setImageLocal((prev) => [...prev, ...files])
        }
    }

    const handleRemoveImageLocal = (indexToRemove) => {
        setImageLocal((prev) => prev.filter((_, index) => index !== indexToRemove))
    }

    const handleAddNewRooms = async (token, hotelId) => {
        try {
            const roomTypes = productDetails.roomTypes.filter(
                (room) => room.name && room.name.trim() !== ""
            )

            const addRoomPromises = roomTypes.map((room) => {
                return add_New_Room(token, hotelId, room)
            })

            await Promise.all(addRoomPromises)

            setNotification({
                type: "success",
                message: "Đã thêm khách sạn thành công!",
            })
            setLoading(false)
        } catch (error) {
            setNotification({
                type: "error",
                message: error.message || "Không thể thêm phòng này vào danh sách!",
            })
            setLoading(false)
        }
    }

    const handleAddNewHotel = async (token) => {
        try {
            const result = await add_New_Hotel(token, productDetails, imageLocal)
            if (result) {
                setProductDetails((prev) => ({
                    ...prev,
                    roomTypes: prev.roomTypes.map((room) => ({
                        ...room,
                        hotelId: result.hotel_id,
                    })),
                }))

                console.log(result.hotel_id)
                await handleAddNewRooms(token, result.hotel_id)
                setLoading(false)
            }
        } catch (error) {
            setNotification({
                type: "error",
                message: error.message || "Không thể thêm khách sạn này vào danh sách!",
            })
            setLoading(false)
        }
    }

    const handleUpdateRooms = async (token) => {
        try {
            const roomTypes = productDetails.roomTypes.filter(
                (room) => room.name && room.name.trim() !== ""
            )

            const roomsWithId = roomTypes.filter((room) => room.id)
            const roomsWithoutId = roomTypes.filter((room) => !room.id)

            const productRoomIds = new Set(roomsWithId.map((room) => room.id))
            const missingRooms = hotel.roomTypes
                .filter((room) => room.id && !productRoomIds.has(room.id))
                .map((room) => room.id)

            const addRoomPromises = roomsWithoutId.map((room) => {
                return add_New_Room(token, productDetails.id, room)
            })

            const updateRoomPromises = roomsWithId.map((room) => {
                return update_Room(token, room.id, room)
            })

            await Promise.all([
                Promise.all(addRoomPromises),
                Promise.all(updateRoomPromises),
                ...(missingRooms.length > 0
                    ? [delete_Rooms(token, { roomIds: missingRooms })]
                    : []),
            ])

            setNotification({
                type: "success",
                message: "Đã cập nhật khách sạn thành công!",
            })
        } catch (error) {
            setNotification({
                type: "error",
                message: error.message || "Không thể cập nhật thông tin phòng!",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateHotel = async (token) => {
        try {
            const result = await update_Hotel(token, productDetails.id, productDetails, imageLocal)

            if (!result) throw new Error("Không thể cập nhật khách sạn.")

            await handleUpdateRooms(token)
        } catch (error) {
            setNotification({
                type: "error",
                message: error.message || "Không thể thêm khách sạn này vào danh sách!",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = () => {
        setLoading(true)
        const token = localStorage.getItem("token")

        if (hotel?.id) handleUpdateHotel(token)
        else handleAddNewHotel(token)
    }

    // const handleLocationSelect = ({ position, address }) => {
    //     console.log("Vị trí:", position)
    //     console.log("Địa chỉ:", address)
    //     setSelectedLocation({ position, address })
    // }

    return (
        <div className="mx-[5%] mt-5">
            <div className="shadow-box">
                <div className="title-box px-3">
                    <h1>Hình ảnh khách sạn</h1>
                    <label htmlFor="file-input" className="custom-file-label">
                        Chọn ảnh
                    </label>
                    <input
                        id="file-input"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden-file-input"
                    />
                </div>

                {productDetails?.imageUrls?.length > 0 || imageLocal?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-5 px-3">
                        {productDetails?.imageUrls.map((image, idx) => (
                            <div key={idx} className="w-full rounded-xl h-52 relative mb-4">
                                <img
                                    src={image}
                                    alt={`image ${idx}`}
                                    className="w-full object-cover rounded-xl h-52"
                                />
                                <IoClose
                                    size={18}
                                    className="delete-button"
                                    onClick={(e) => handleProductDetailsChange(e, "imageUrls", idx)}
                                />
                            </div>
                        ))}
                        {imageLocal.map((image, index) => (
                            <div key={index} className="w-full rounded-xl h-52 relative mb-4">
                                <img
                                    src={URL.createObjectURL(image)}
                                    alt={`image ${index}`}
                                    className="w-full object-cover rounded-xl h-52"
                                />
                                <IoClose
                                    size={18}
                                    className="delete-button"
                                    onClick={() => handleRemoveImageLocal(index)}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="px-3">Chưa chọn hình ảnh nào</p>
                )}
            </div>

            <div className="shadow-box mt-8">
                <div className="title-box px-3">
                    <h1>Thông tin khách sạn</h1>
                </div>

                <div className="flex gap-[4%] px-3">
                    <div className="flex-1">
                        <h2>Tên khách sạn</h2>
                        <input
                            name="name"
                            value={productDetails?.name}
                            onChange={(event) => handleProductDetailsChange(event)}
                            type="text"
                            className="product-input"
                            placeholder="May Beach Hotel"
                        />

                        <h2>Slug</h2>
                        <input
                            type="text"
                            name="slug"
                            disabled={productDetails?.id}
                            value={productDetails?.slug}
                            onChange={(event) => handleProductDetailsChange(event)}
                            className="product-input"
                            placeholder="may-beach-hotel"
                        />
                    </div>
                    <div className="flex-1">
                        <h2>Mô tả</h2>
                        <textarea
                            type="text"
                            name="description"
                            value={productDetails?.description}
                            onChange={(event) => handleProductDetailsChange(event)}
                            rows={4}
                            placeholder="Mô tả"
                            className="product-input description-input"
                        />
                    </div>
                </div>

                <div className="flex gap-[4%] px-3">
                    <div className="flex-1">
                        <h2>Quận</h2>
                        <Select
                            name="district"
                            value={productDetails?.district ?? ""}
                            onChange={(event) => handleProductDetailsChange(event)}
                            displayEmpty
                            inputProps={{ "aria-label": "Without label" }}>
                            <MenuItem value="">
                                <em>Quận</em>
                            </MenuItem>
                            {district.length > 0 &&
                                district.map((brand, index) => (
                                    <MenuItem key={index} value={brand}>
                                        {brand}
                                    </MenuItem>
                                ))}
                        </Select>
                    </div>
                    <div className="flex-1">
                        <h2>Địa chỉ</h2>
                        <input
                            type="text"
                            name="address"
                            value={productDetails?.address}
                            className="product-input"
                            placeholder="231 Huy Cận, Cẩm Lệ, Đà Nẵng"
                            readOnly
                            onClick={() => setModalOpen(true)}
                        />
                    </div>
                </div>

                <div className="flex gap-[4%] px-3">
                    <div className="flex flex-1 gap-[5%]">
                        <div className="flex-1">
                            <h2>Link</h2>
                            <input
                                type="text"
                                name="hotelLink"
                                value={productDetails?.hotelLink}
                                onChange={(event) => handleProductDetailsChange(event)}
                                className="product-input"
                                placeholder="https://booking.com.may-beach"
                            />
                        </div>

                        <div className="flex-1">
                            <h2>Tiện nghi nổi bật</h2>
                            <MultipleSelect
                                name="facilities"
                                value={productDetails?.facilities || []}
                                onChange={(event) => handleProductDetailsChange(event)}
                                maxWidth={420}
                                items={facilities}
                            />
                        </div>
                    </div>

                    <div>
                        <h2>Chất lượng</h2>
                        <div className="mt-3">
                            <Rating
                                name="ratingStars"
                                value={productDetails?.ratingStars ?? 0}
                                onChange={(event) => handleProductDetailsChange(event)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="shadow-box mt-8">
                <div className="title-box px-3">
                    <h1>Điểm nổi bật</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[4%] px-3">
                    {Object.keys(highlights).map((item, i) => (
                        <div key={i} className="flex-1">
                            <h2>{item}</h2>
                            <MultipleSelect
                                name="highlights"
                                value={productDetails?.highlights?.[item] || []}
                                onChange={(event) => handleProductDetailsChange(event, item)}
                                maxWidth={490}
                                items={highlights[item] || []}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="shadow-box mt-8">
                <div className="title-box px-3">
                    <h1>Đánh giá</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-[4%] px-3">
                    {reviews.map((review, idx) => (
                        <div key={idx} className="flex-1">
                            <h2>{review}</h2>
                            <CustomInput
                                type="number"
                                name="reviews"
                                value={productDetails?.reviews?.[review] || 0}
                                onChange={(event) => handleProductDetailsChange(event, review)}
                                title="/10"
                                step={0.1}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="shadow-box mt-8">
                <div className="flex justify-between items-center px-3 mb-2">
                    <h1>Dịch vụ phòng</h1>
                </div>

                <div className="flex-1 px-3 border-b border-lightGray pb-2 mb-2">
                    <MultipleSelect
                        name="roomServices"
                        value={
                            productDetails?.roomServices
                                ? Object.keys(productDetails?.roomServices)
                                : []
                        }
                        onChange={(event) => handleProductDetailsChange(event)}
                        maxWidth={1025}
                        items={Object.keys(roomServices)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[4%] px-3">
                    {productDetails?.roomServices &&
                        Object.keys(productDetails?.roomServices).map((room_service, idx) => (
                            <div key={idx}>
                                <h2>{room_service}</h2>
                                <MultipleSelect
                                    name="roomServices"
                                    value={productDetails?.roomServices[room_service] || []}
                                    onChange={(event) =>
                                        handleProductDetailsChange(event, room_service)
                                    }
                                    maxWidth={490}
                                    items={roomServices[room_service] || []}
                                />
                            </div>
                        ))}
                </div>

                <div className="h-3" />
            </div>

            <div className="shadow-box mt-8">
                <div className="title-box px-3">
                    <h1>Thông tin phòng, giá cả</h1>
                    <MdAddCircleOutline
                        size={25}
                        onClick={handleAddRoom}
                        className="add-color-button"
                    />
                </div>

                {productDetails?.roomTypes?.map((color, index) => (
                    <div key={index} className="color-form">
                        <div className="flex flex-1 gap-[4%]">
                            <div className="flex flex-1 gap-[4%]">
                                <div className="flex-1">
                                    <h2>Tên phòng</h2>
                                    <CustomInput
                                        type="text"
                                        name="name"
                                        value={color.name || ""}
                                        onChange={(event) => handleUpdateRoom(event, index)}
                                        placeholder="Phòng "
                                    />
                                </div>

                                <div className="w-32">
                                    <h2>Số khách</h2>
                                    <CustomInput
                                        type="number"
                                        name="numberOfGuests"
                                        value={color.numberOfGuests}
                                        onChange={(event) => handleUpdateRoom(event, index)}
                                        title="Người"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-1 gap-[4%]">
                                <div className="flex-1">
                                    <h2>Giá gốc</h2>
                                    <CustomInput
                                        type="number"
                                        name="originalPrice"
                                        value={color.originalPrice}
                                        onChange={(event) => handleUpdateRoom(event, index)}
                                        placeholder="30000000"
                                        title="VND"
                                        step={100000}
                                    />
                                </div>

                                <div className="flex-1">
                                    <h2>Giá giảm</h2>
                                    <CustomInput
                                        type="number"
                                        name="price"
                                        value={color.price}
                                        onChange={(event) => handleUpdateRoom(event, index)}
                                        placeholder="26000000"
                                        title="VND"
                                        step={100000}
                                    />
                                </div>

                                <div className="flex-1 flex items-center mt-4">
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="taxesAndFeesUnderPrice"
                                                value={color.taxesAndFeesUnderPrice}
                                                onChange={(event) => handleUpdateRoom(event, index)}
                                            />
                                        }
                                        label="Bao gồm thuế và phí"
                                    />
                                </div>
                            </div>
                        </div>
                        {productDetails?.roomTypes?.length > 1 && (
                            <FaMinusCircle
                                className="remove-color-button"
                                onClick={() => handleRemoveRoom(index)}
                            />
                        )}
                    </div>
                ))}
            </div>

            <MapPickerModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                selectedPosition={{ lat: productDetails?.latitude, lng: productDetails?.longitude }}
                setSelectedPosition={(latlng) => handlePosition(latlng, "latLng")}
                selectedAddress={productDetails?.address}
                setSelectedAddress={(address) => handlePosition(address, "address")}
            />

            <button
                type="button"
                onClick={() => handleSubmit()}
                className="mt-10 mb-4 submit-button">
                {hotel?.id ? "Cập nhật thông tin khách sạn" : "Thêm khách sạn mới"}
            </button>

            {hotel?.id && (
                <button
                    type="button"
                    onClick={() => {
                        setDefaultHotel(hotel)
                    }}
                    className="w-full text-white font-bold text-[18px] py-2 rounded-[10px] uppercase cursor-pointer transition-transform duration-300 hover:scale-[1.01] active:bg-sunsetOrange bg-coralBlaze">
                    Huỷ bỏ thay đổi
                </button>
            )}

            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                    duration={3000}
                />
            )}

            {loading && (
                <div className="fixed inset-0 z-50 bg-black/30 flex justify-center items-center">
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
        </div>
    )
}

ProductForm.propTypes = {
    hotel: PropTypes.object,
}

export default ProductForm
