import banner from "~/assets/BannerHotel2.png"
import Slider from "~/components/common/Slider"
import { Container } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { get_All_Hotels, get_Top_5_Hotels } from "~/services/HotelService"
import useHotelContext from "~/hooks/useHotelContext"
import { useEffect, useState } from "react"
import HotelItem from "~/components/user/HotelItem"
import usePlaceContext from "~/hooks/usePlaceContext"
import { get_All_Places } from "~/services/PlaceService"
import { districtJson } from "~/utils/district"
import { getSearchHotelByFilterParams } from "~/utils/queryParamsHelper"

const Home = () => {
    const [topHotels, setTopHotels] = useState([])
    const [districtSelected, setDistrictSelected] = useState("")
    const [numberOfGuests, setNumberOfGuests] = useState()
    const [maxPrice, setMaxPrice] = useState()
    const navigate = useNavigate()
    const { hotels, dispatch: hotelDispatch } = useHotelContext()
    const { places, dispatch: placeDispatch } = usePlaceContext()

    const [searchInput, setSearchInput] = useState("")

    useEffect(() => {
        const getAllHotels = async () => {
            try {
                const { data, totalPages, currentPage } = await get_All_Hotels()

                hotelDispatch({
                    type: "FETCH_HOTELS",
                    payload: {
                        hotels: data,
                        totalPages,
                        currentPage,
                    },
                })
            } catch (error) {
                console.log("Lỗi khi lấy danh sách khách sạn:", error)
            }
        }

        const getTopHotels = async () => {
            try {
                const { data } = await get_Top_5_Hotels()
                setTopHotels(data)
            } catch (error) {
                console.log("Lỗi khi lấy danh sách top khách sạn:", error)
            }
        }

        const getAllPlaces = async () => {
            try {
                const { data, totalPages, currentPage } = await get_All_Places()

                placeDispatch({
                    type: "FETCH_PLACES",
                    payload: {
                        places: data,
                        totalPages,
                        currentPage,
                    },
                })
            } catch (error) {
                console.log("Lỗi khi lấy danh sách địa điểm:", error)
            }
        }

        getAllHotels()
        getTopHotels()
        getAllPlaces()
    }, [])

    const handleChange = (event) => {
        setDistrictSelected(event.target.value)
    }

    // const handleSearchByFilter = async () => {
    //     try {
    //         const { data, totalPages, currentPage } = await search_Hotels_By_Filter()

    //         hotelDispatch({
    //             type: "FETCH_HOTELS",
    //             payload: {
    //                 hotels: data,
    //                 totalPages,
    //                 currentPage,
    //             },
    //         })
    //     } catch (error) {
    //         console.log("Lỗi khi search_Hotels_By_Filter:", error)
    //     }
    // }

    return (
        <div>
            <img src={banner} alt="Banner" className="w-full" />
            <div className="w-[65%] absolute top-[440px] left-1/2 -translate-x-1/2">
                <div className="flex gap-4">
                    <div className="flex-1 rounded-lg p-2 bg-white">
                        <select
                            value={districtSelected}
                            onChange={handleChange}
                            className="w-full outline-none rounded-lg">
                            <option value="">-- Chọn quận --</option>
                            {districtJson.map((d) => (
                                <option key={d.id} value={d.id} className="">
                                    {d.value}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1 rounded-lg p-2 bg-white">
                        <input
                            type="number"
                            min={1}
                            value={numberOfGuests}
                            onChange={(e) => setNumberOfGuests(e.target.value)}
                            className="w-full outline-none"
                            placeholder="Số lượng người"
                        />
                    </div>
                    <div className="flex-1 rounded-lg p-2 bg-white flex gap-2">
                        <p className="text-gray-400 border-r border-gray-400 pr-2">VND</p>
                        <input
                            type="number"
                            step={100000}
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="flex-1 outline-none"
                            placeholder="Giá phòng tối đa"
                        />
                    </div>
                    <button
                        onClick={() =>
                            navigate(
                                `/hotels?${getSearchHotelByFilterParams(
                                    districtSelected,
                                    numberOfGuests,
                                    maxPrice
                                )}`
                            )
                        }
                        className="rounded-lg p-2 bg-black text-white">
                        Tìm kiếm
                    </button>
                </div>
                <div className="flex gap-4 mt-4">
                    <div className="flex-1 rounded-lg p-2 bg-white">
                        <input
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full outline-none"
                            placeholder="Bạn muốn tìm kiếm khách sạn đáp ứng yêu cầu gì?"
                        />
                    </div>
                    <button
                        onClick={() => navigate(`hotels?key=${searchInput}`)}
                        className="rounded-lg p-2 bg-black text-white">
                        Tìm kiếm
                    </button>
                </div>
            </div>

            <Container fixed className="mt-6 relative">
                <p className="text-xl pb-2 font-bold">Khách sạn nổi bật</p>
                <div className="w-[490px] h-0 outline outline-[3px] outline-offset-[-1.50px] outline-black" />
                <div className="relative -mx-4">
                    <Slider hotels={topHotels} />
                </div>
            </Container>

            <Container fixed className="mt-6">
                <div className="flex justify-between items-end">
                    <p className="text-xl font-bold leading-none">Tất cả khách sạn</p>
                    <p
                        onClick={() => navigate("/hotels")}
                        className="text-base text-blue-600 leading-none">
                        Xem tất cả
                    </p>
                </div>
                <div className="py-6 flex flex-col gap-4">
                    {Array.isArray(hotels) &&
                        hotels
                            .slice(0, 10)
                            .map((item) => (
                                <HotelItem item={item} key={item.hotel.id} navigate={navigate} />
                            ))}
                </div>
            </Container>
            <Container fixed className="mt-6">
                <div className="flex justify-between items-end">
                    <p className="text-xl font-bold leading-none">Địa điểm du lịch</p>
                    <p className="text-base text-blue-600 leading-none">Xem thêm</p>
                </div>
                <div className="py-6 flex gap-4">
                    {Array.isArray(places) &&
                        places.slice(0, 4).map((item) => (
                            <div
                                key={item.id}
                                onClick={() => navigate(`/places/${item.slug}`)}
                                className="no-padding-shadow-box-hover flex flex-1 border border-amber-50 relative cursor-pointer">
                                <img src={item.imageUrl} alt={item.title} className="rounded-2xl" />
                                <div className="w-full h-20 absolute rounded-b-2xl bottom-0 bg-black/50 flex justify-center items-center">
                                    <p className="text-white ">{item.title}</p>
                                </div>
                            </div>
                        ))}
                </div>
            </Container>
        </div>
    )
}

export default Home
