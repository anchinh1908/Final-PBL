import { useEffect, useState } from "react"
import { Checkbox, Container, Pagination, Radio, Slider } from "@mui/material"
import NumberInput from "~/components/common/NumberInput"
import { useNavigate, useSearchParams } from "react-router-dom"
import useHotelContext from "~/hooks/useHotelContext"
import {
    filter_Hotels,
    // get_All_Hotels,
    search_Hotels_By_Filter,
    search_Hotels_By_Model,
} from "~/services/HotelService"
import { getHotelParams } from "~/utils/queryParamsHelper"
import HotelItem from "~/components/user/HotelItem"
import { districtJson } from "~/utils/district"
import { RotatingLines } from "react-loader-spinner"
import { facilities } from "~/utils/facilities"
import Notification from "~/components/common/Notification"
import MapLocation from "~/components/user/MapLocation"

const minSlider = 100000
const maxSlider = 4000000

const Hotels = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const [showAll, setShowAll] = useState(false)
    const maxVisibleItems = 10

    const [isLoading, setIsLoading] = useState(false)
    const [notification, setNotification] = useState(null)

    const [amenities, setAmenities] = useState([])
    const [priceSlider, setPriceSlider] = useState([minSlider, maxSlider])
    const [bedroomNumber, setBedroomNumber] = useState(0)
    const [quantitySelected, setQuantitySelected] = useState()

    const [page, setPage] = useState(
        parseInt(searchParams.get("page") || 1, 10)
    )
    const [searchInput, setSearchInput] = useState(
        searchParams.get("key") || ""
    )

    const districtParam = searchParams.get("district") || ""
    const districtSelected =
        districtJson.find((d) => d.id === districtParam)?.value || ""
    const numberOfGuests = parseInt(searchParams.get("numberOfGuests") || 0, 10)
    const maxPrice = parseInt(searchParams.get("maxPrice") || 0, 10)

    const { hotels, totalPages, dispatch } = useHotelContext()

    const [showModal, setShowModal] = useState(false)

    // const getAllHotels = async (page) => {
    //     try {
    //         window.scrollTo(0, 0)

    //         const { data, totalPages, currentPage } = await get_All_Hotels(page)

    //         dispatch({
    //             type: "FETCH_HOTELS",
    //             payload: {
    //                 hotels: data,
    //                 totalPages,
    //                 currentPage,
    //             },
    //         })
    //         // setTotalHotelPages(totalPages)
    //     } catch (error) {
    //         setNotification({
    //             type: "error",
    //             message: error.message || "Không thể tải danh sách khách sạn",
    //         })
    //         dispatch({
    //             type: "FETCH_HOTELS",
    //             payload: {
    //                 hotels: [],
    //                 totalPages: 1,
    //                 currentPage: 1,
    //             },
    //         })
    //     } finally {
    //         setIsLoading(false)
    //     }
    // }

    const handleSearchByFilter = async () => {
        try {
            window.scrollTo(0, 0)

            const { hotels, totalPages, currentPage } =
                await search_Hotels_By_Filter(
                    districtSelected,
                    numberOfGuests,
                    maxPrice,
                    page
                )

            dispatch({
                type: "FETCH_HOTELS",
                payload: {
                    hotels: hotels,
                    totalPages,
                    currentPage,
                },
            })
        } catch (error) {
            setNotification({
                type: "error",
                message: error.message || "Không thể tải danh sách khách sạn",
            })
            dispatch({
                type: "FETCH_HOTELS",
                payload: {
                    hotels: [],
                    totalPages: 1,
                    currentPage: 1,
                },
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleFilterHotels = async (page) => {
        try {
            window.scrollTo(0, 0)
            setIsLoading(true)

            const { data, totalPages, currentPage } = await filter_Hotels(
                amenities,
                priceSlider[1],
                priceSlider[0],
                bedroomNumber,
                quantitySelected,
                page
            )

            dispatch({
                type: "FETCH_HOTELS",
                payload: {
                    hotels: data,
                    totalPages,
                    currentPage,
                },
            })
        } catch (error) {
            setNotification({
                type: "error",
                message: error.message || "Không thể tải danh sách khách sạn",
            })
            dispatch({
                type: "FETCH_HOTELS",
                payload: {
                    hotels: [],
                    totalPages: 1,
                    currentPage: 1,
                },
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (
            amenities.length > 0 ||
            priceSlider[0] > minSlider ||
            priceSlider[1] < maxSlider ||
            bedroomNumber > 0 ||
            quantitySelected > 0
        ) {
            handleFilterHotels(1)
            setPage(1)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [amenities, priceSlider, bedroomNumber, quantitySelected])

    const handleSearchByModel = async () => {
        try {
            window.scrollTo(0, 0)

            const token = localStorage.getItem("token")
            const { hotels, totalPages, currentPage } =
                await search_Hotels_By_Model(token, searchInput, page)

            dispatch({
                type: "FETCH_HOTELS",
                payload: {
                    hotels: hotels,
                    totalPages,
                    currentPage,
                },
            })
        } catch (error) {
            setNotification({
                type: "error",
                message: error.message || "Không thể tải danh sách khách sạn",
            })
            dispatch({
                type: "FETCH_HOTELS",
                payload: {
                    hotels: [],
                    totalPages: 1,
                    currentPage: 1,
                },
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        setIsLoading(true)

        console.log(page)

        if (searchInput) {
            console.log("search")

            handleSearchByModel()
        } else if (districtParam || numberOfGuests > 0 || maxPrice > 0) {
            console.log("loc gia")
            handleSearchByFilter()
        } else {
            console.log("loc filter")
            handleFilterHotels(page)
        }
    }, [page, districtParam, numberOfGuests, maxPrice, searchParams])

    const handlePageChange = (event, value) => {
        const newLocation = getHotelParams(
            value,
            20,
            searchInput,
            districtParam,
            numberOfGuests,
            maxPrice
        )

        setPage(value)
        navigate(newLocation)
    }

    const handleSearchButton = () => {
        const newLocation = getHotelParams(1, 20, searchInput, "", 0, 0)

        setPage(1)
        navigate(newLocation)
    }

    const handleSliderChange = (event, newValue) => {
        setPriceSlider(newValue)
    }

    const handleAmenitiesChange = (item) => {
        setAmenities((prev) =>
            prev.includes(item)
                ? prev.filter((index) => index !== item)
                : [...prev, item]
        )
    }

    const handleQuantityChange = (value) => {
        setQuantitySelected(value)
    }

    return (
        <Container fixed className="py-6 flex gap-5 items-start">
            <div className="rounded-lg w-64 bg-white shadow-lg">
                <div className="pr-3 pt-3 border-b">
                    <p className="pl-3 font-bold">Tiện nghi</p>
                    {amenities.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2 mx-3">
                            {amenities.map((amenity, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-1 bg-amber-50 border rounded-md p-1 text-sm"
                                >
                                    <p className="px-2">{amenity}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="mb-2">
                        {(showAll
                            ? facilities
                            : facilities.slice(0, maxVisibleItems)
                        ).map((item, idx) => (
                            <div key={idx} className="flex items-start">
                                <Checkbox
                                    checked={amenities.includes(item)}
                                    onChange={() => handleAmenitiesChange(item)}
                                    size="small"
                                    color="default"
                                />
                                <p className="text-sm pt-[9px]">{item}</p>
                            </div>
                        ))}

                        {facilities.length > maxVisibleItems && (
                            <button
                                onClick={() => setShowAll(!showAll)}
                                className="text-blue-500 mt-2 hover:underline text-sm mx-3"
                            >
                                {showAll ? "Thu gọn" : "Xem thêm"}
                            </button>
                        )}
                    </div>
                </div>

                <div className="pt-3 px-3 border-b">
                    <p className="font-bold">Ngân sách của bạn (mỗi đêm)</p>
                    <p className="text-sm my-2">
                        VND {priceSlider[0].toLocaleString()} - VND{" "}
                        {priceSlider[1].toLocaleString()}{" "}
                        {priceSlider[1] == maxSlider && "+"}
                    </p>
                    <div className="mx-2.5">
                        <Slider
                            value={priceSlider}
                            onChange={handleSliderChange}
                            valueLabelDisplay="off"
                            min={minSlider}
                            max={maxSlider}
                            step={minSlider}
                            size="medium"
                        />
                    </div>
                </div>

                <div className="p-3 border-b">
                    <p className="pb-2 font-bold">Số lượng khách 1 phòng</p>
                    <div className="flex justify-between items-center mb-2">
                        <p>Số khách</p>
                        <NumberInput
                            count={bedroomNumber}
                            setCount={setBedroomNumber}
                        />
                    </div>
                </div>

                <div className="pr-3 pt-3">
                    <p className="pl-3 font-bold">Xếp hạng chỗ ngủ</p>
                    <div>
                        {[3, 4, 5].map((item) => (
                            <div key={item} className="flex items-start">
                                <Radio
                                    checked={quantitySelected === item}
                                    onChange={() => handleQuantityChange(item)}
                                    size="small"
                                    color="default"
                                />
                                <p className="text-sm pt-[9px]">{item} sao</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-4">
                <div className="flex gap-4">
                    <div className="flex-1 rounded-lg p-2 bg-white border shadow">
                        <input
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full outline-none"
                            placeholder="Bạn muốn tìm kiếm khách sạn đáp ứng yêu cầu gì?"
                        />
                    </div>
                    <button
                        onClick={() => handleSearchButton()}
                        className="rounded-lg p-2 bg-black text-white"
                    >
                        Tìm kiếm
                    </button>
                </div>

                {!isLoading && (
                    <div className="flex justify-end">
                        <p
                            onClick={() => setShowModal(true)}
                            className="text-blue-600 text-base font-thin underline mb-2 line-clamp-3 cursor-pointer"
                        >
                            Xem trên bản đồ
                        </p>
                    </div>
                )}

                {!isLoading && (
                    <div className="flex-1 flex flex-col gap-4">
                        {Array.isArray(hotels) &&
                            hotels.length > 0 &&
                            hotels.map((item) => (
                                <HotelItem
                                    item={item}
                                    key={item.hotel.id}
                                    navigate={navigate}
                                    smallImage={true}
                                />
                            ))}
                    </div>
                )}

                {isLoading && (
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

                <div className="flex justify-center my-5">
                    <Pagination
                        count={totalPages}
                        color="primary"
                        page={page}
                        onChange={handlePageChange}
                    />
                </div>
            </div>

            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                    duration={3000}
                />
            )}

            {hotels?.length > 0 && (
                <MapLocation
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    locations={hotels}
                />
            )}
        </Container>
    )
}

export default Hotels
