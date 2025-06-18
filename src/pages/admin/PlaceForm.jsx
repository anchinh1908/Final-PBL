import { useEffect, useState } from "react"
import "~/styles/ProductForm.css"
import { IoClose } from "react-icons/io5"
import { Rating } from "@mui/material"
import CustomInput from "~/components/common/CustomInput"
import { createSlug } from "~/utils/slugHelper"
import PropTypes from "prop-types"
import { placeServices } from "~/utils/placeServices"
import { defaultPlaceDetails } from "~/utils/defaultTable"
import MultipleSelect from "~/components/common/MultipleSelect"
import { RotatingLines } from "react-loader-spinner"
import Notification from "~/components/common/Notification"
import { add_New_Place, update_Place } from "~/services/PlaceService"
import MapPickerModal from "~/components/admin/MapPickerModal"

const PlaceForm = ({ place }) => {
    const [placeDetails, setPlaceDetails] = useState(defaultPlaceDetails)

    const [loading, setLoading] = useState(false)
    const [notification, setNotification] = useState(null)

    const [modalOpen, setModalOpen] = useState(false)
    const [location, setLocation] = useState({ lat: 0, lng: 0 })
    const [address, setAddress] = useState("")

    // const { brands, dispatch } = useBrand()

    useEffect(() => {
        setPlaceDetails(place)
    }, [place])

    const handlePlaceDetailsChange = (e, field = null) => {
        const { name, value } = e.target

        const simpleFields = ["title", "rating", "review", "slug", "description"]
        if (simpleFields.includes(name)) {
            setPlaceDetails((prevProductDetails) => ({
                ...prevProductDetails,
                [name]: name === "rating" ? Number(value) : value,
            }))

            if (name === "title" && !placeDetails?.id)
                setPlaceDetails((prev) => ({ ...prev, slug: createSlug(value) }))

            return
        }

        if (name === "services") {
            if (!field) {
                const selectedGroups = typeof value === "string" ? value.split(",") : value

                setPlaceDetails((prev) => {
                    const updated = {}

                    selectedGroups.forEach((group) => {
                        updated[group] = prev.services?.[group] || []
                    })

                    return {
                        ...prev,
                        services: updated,
                    }
                })
            } else {
                setPlaceDetails((prevProductDetails) => ({
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

    const handleImageChange = (event) => {
        const file = event.target.files[0]
        if (file) {
            setPlaceDetails((prevProductDetails) => ({
                ...prevProductDetails,
                imageUrl: file,
            }))
        }
    }

    const handlePosition = (value, name) => {
        if (name === "address") {
            if (value) {
                setPlaceDetails((prevProductDetails) => ({
                    ...prevProductDetails,
                    [name]: value,
                }))
                setAddress(value)
            } else
                setPlaceDetails((prevProductDetails) => ({
                    ...prevProductDetails,
                    [name]: address,
                }))
        } else {
            if (value.lat && value.lng) {
                setPlaceDetails((prevProductDetails) => ({
                    ...prevProductDetails,
                    latitude: value.lat,
                    longitude: value.lng,
                }))
                setLocation(value)
            } else {
                console.log(value)

                setPlaceDetails((prevProductDetails) => ({
                    ...prevProductDetails,
                    latitude: location.lat,
                    longitude: location.lng,
                }))
            }
        }
    }

    const handleAddNewPlace = async (token, newPlace) => {
        try {
            const result = await add_New_Place(token, newPlace)
            if (result)
                setNotification({
                    type: "success",
                    message: "Đã thêm địa điểm mới thành công!",
                })
        } catch (error) {
            setNotification({
                type: "error",
                message: error.message || "Không thể thêm địa điểm này vào danh sách!",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleUpdatePlace = async (token, newPlace) => {
        try {
            const result = await update_Place(token, newPlace.id, newPlace)

            if (result)
                setNotification({
                    type: "success",
                    message: "Đã cập nhật thông tin địa điểm thành công!",
                })
        } catch (error) {
            setNotification({
                type: "error",
                message: error.message || "Không thể cập nhật thông tin địa điểm này!",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = () => {
        setLoading(true)
        const token = localStorage.getItem("token")
        const revertedPlace = {
            ...placeDetails,
            services:
                placeDetails.services &&
                typeof placeDetails.services === "object" &&
                !Array.isArray(placeDetails.services)
                    ? [placeDetails.services]
                    : placeDetails.services || [],
        }

        if (place?.id) handleUpdatePlace(token, revertedPlace)
        else handleAddNewPlace(token, revertedPlace)
    }

    return (
        <div className="mx-[5%] mt-5">
            <div className="shadow-box">
                <div className="title-box px-3">
                    <h1>Hình ảnh địa điểm du lịch</h1>
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

                {placeDetails?.imageUrl ? (
                    <div className="w-96 rounded-xl h-60 relative mb-4">
                        <img
                            src={
                                placeDetails.imageUrl
                                    ? typeof placeDetails.imageUrl === "string"
                                        ? placeDetails.imageUrl
                                        : URL.createObjectURL(placeDetails.imageUrl)
                                    : ""
                            }
                            alt="selected"
                            className="w-96 object-cover rounded-xl h-60"
                        />

                        <IoClose
                            name="imageUrl"
                            size={18}
                            className="delete-button"
                            onClick={() => setPlaceDetails((prev) => ({ ...prev, imageUrl: "" }))}
                        />
                    </div>
                ) : (
                    <p className="px-3">Chưa chọn hình ảnh nào</p>
                )}
            </div>

            <div className="shadow-box mt-8">
                <div className="title-box px-3">
                    <h1>Thông tin địa điểm</h1>
                </div>

                <div className="flex gap-[4%] px-3">
                    <div className="flex-1">
                        <h2>Tên địa điểm</h2>
                        <input
                            name="title"
                            value={placeDetails?.title}
                            onChange={(event) => handlePlaceDetailsChange(event)}
                            type="text"
                            className="product-input"
                            placeholder="Công viên 29/3"
                        />

                        <h2>Slug</h2>
                        <input
                            type="text"
                            name="slug"
                            disabled={placeDetails?.id}
                            value={placeDetails?.slug}
                            onChange={(event) => handlePlaceDetailsChange(event)}
                            className="product-input"
                            placeholder="may-beach-hotel"
                        />
                    </div>
                    <div className="flex-1">
                        <h2>Mô tả</h2>
                        <textarea
                            type="text"
                            name="description"
                            value={placeDetails?.description}
                            onChange={(event) => handlePlaceDetailsChange(event)}
                            rows={4}
                            placeholder="Mô tả"
                            className="product-input description-input"
                        />
                    </div>
                </div>

                <div className="flex gap-[4%] px-3">
                    <div className="flex flex-1 gap-[5%]">
                        <div className="flex-1">
                            <h2>Địa chỉ</h2>
                            <input
                                type="text"
                                name="address"
                                value={placeDetails?.address}
                                onClick={() => setModalOpen(true)}
                                className="product-input"
                                readOnly
                                placeholder="231 Huy Cận, Cẩm Lệ, Đà Nẵng"
                            />
                        </div>

                        <div className="flex-1">
                            <h2>Số đánh giá</h2>
                            <CustomInput
                                type="number"
                                name="review"
                                value={placeDetails?.review}
                                onChange={(event) => handlePlaceDetailsChange(event)}
                                title="Đánh giá"
                            />
                        </div>
                    </div>

                    <div>
                        <h2>Chất lượng</h2>
                        <div className="mt-3">
                            <Rating
                                name="rating"
                                value={placeDetails?.rating}
                                onChange={(event) => handlePlaceDetailsChange(event)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="shadow-box mt-8">
                <div className="flex justify-between items-center px-3 mb-2">
                    <h1>Dịch vụ</h1>
                </div>

                <div className="flex-1 px-3 border-b border-lightGray pb-2 mb-2">
                    <MultipleSelect
                        name="services"
                        value={placeDetails?.services ? Object.keys(placeDetails?.services) : []}
                        onChange={(event) => handlePlaceDetailsChange(event)}
                        maxWidth={1025}
                        items={Object.keys(placeServices)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[4%] px-3">
                    {placeDetails?.services &&
                        Object.keys(placeDetails?.services).map((room_service, idx) => (
                            <div key={idx}>
                                <h2>{room_service}</h2>
                                <MultipleSelect
                                    name="services"
                                    value={placeDetails?.services[room_service] || []}
                                    onChange={(event) =>
                                        handlePlaceDetailsChange(event, room_service)
                                    }
                                    maxWidth={490}
                                    items={placeServices[room_service] || []}
                                />
                            </div>
                        ))}
                </div>

                <div className="h-3" />
            </div>

            <MapPickerModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                selectedPosition={{ lat: placeDetails?.latitude, lng: placeDetails?.longitude }}
                setSelectedPosition={(latlng) => handlePosition(latlng, "latLng")}
                selectedAddress={placeDetails?.address}
                setSelectedAddress={(address) => handlePosition(address, "address")}
            />

            <button
                type="button"
                onClick={() => handleSubmit()}
                className="mt-10 mb-4 submit-button">
                {place?.id ? "Cập nhật thông tin địa điểm" : "Thêm địa điểm mới"}
            </button>

            {place?.id && (
                <button
                    type="button"
                    onClick={() => setPlaceDetails(place)}
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

PlaceForm.propTypes = {
    place: PropTypes.object,
}

export default PlaceForm
