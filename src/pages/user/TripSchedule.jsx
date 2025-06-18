import {
    Container,
    IconButton,
    MenuItem,
    OutlinedInput,
    Select,
    Tooltip,
    useTheme,
} from "@mui/material"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { get_All_Places } from "~/services/PlaceService"
import { MdAdd } from "react-icons/md"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
// import MultipleSelect from "~/components/common/MultipleSelect"
import {
    add_Place_My_Trip,
    delete_Hotel_My_Trip,
    delete_Place_My_Trip,
    generate_Trip_Itinerary,
    hotel_Trip_List,
    place_Trip_List,
} from "~/services/TripService"
import CustomInput from "~/components/common/CustomInput"
import Notification from "~/components/common/Notification"
import { RotatingLines } from "react-loader-spinner"

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
}

function getStyles(name, personName, theme) {
    return {
        fontWeight: personName.includes(name)
            ? theme.typography.fontWeightMedium
            : theme.typography.fontWeightRegular,
    }
}

const TripSchedule = () => {
    const theme = useTheme()
    const navigate = useNavigate()
    const [placeSelected, setPlaceSelected] = useState([])
    const [hotelSelected, setHotelSelected] = useState([])
    const [day, setDay] = useState(1)
    const [number, setNumber] = useState(1)
    const [preferences, setPreferences] = useState(null)
    const [placeList, setPlaceList] = useState([])
    const [smartTrip, setSmartTrip] = useState(null)

    const [loading, setLoading] = useState(false)
    const [notification, setNotification] = useState(null)

    useEffect(() => {
        const getAllPlaces = async () => {
            try {
                const { data } = await get_All_Places(1, 100)

                setPlaceList(data)
            } catch (error) {
                console.log(error)
                setPlaceList([])
            }
        }

        const getHotelTripList = async (token) => {
            try {
                const { data } = await hotel_Trip_List(token)
                setHotelSelected(data)
            } catch (error) {
                console.log(error)
                setHotelSelected([])
            }
        }

        const getPlaceTripList = async (token) => {
            try {
                const { data } = await place_Trip_List(token)
                console.log(data)

                setPlaceSelected(data)
            } catch (error) {
                console.log(error)
                setPlaceSelected([])
            }
        }
        getAllPlaces()
        const token = localStorage.getItem("token")
        if (token) {
            getHotelTripList(token)
            getPlaceTripList(token)
        }
    }, [])

    // const handleChange = (event) => {
    //     const value = event.target.value
    //     const selectedPlaceObjects = placeList.filter((p) => value.includes(p.id))
    //     setPlaceSelected(selectedPlaceObjects)
    // }

    const deleteHotelFromMyTrip = async (hotelid) => {
        try {
            const token = localStorage.getItem("token")
            const result = await delete_Hotel_My_Trip(token, hotelid)
            console.log(result)
            if (result)
                setHotelSelected((prev) => prev.filter((hotel) => hotel.hotel.id != hotelid))
        } catch (error) {
            console.log(error.message || "Không thể xoá khách sạn này khỏi chuyến đi!")
        }
    }

    const addPlaceToMyTrip = async (token, hotelid) => {
        try {
            const result = await add_Place_My_Trip(token, hotelid)
            console.log(result)
        } catch (error) {
            console.log(error.message || "Không thể thêm địa điểm này vào chuyến đi!")
        }
    }

    const deletePlaceFromMyTrip = async (token, hotelid) => {
        try {
            console.log(token, hotelid)

            const result = await delete_Place_My_Trip(token, hotelid)
            console.log(result)
        } catch (error) {
            console.log(error.message || "Không thể xoá địa điểm này khỏi chuyến đi!")
        }
    }

    const handleChange1 = async (event) => {
        const {
            target: { value },
        } = event

        const newSelectedIds = typeof value === "string" ? value.split(",") : value
        const prevSelectedIds = placeSelected.map((p) => p.id)

        const added = newSelectedIds.filter((id) => !prevSelectedIds.includes(id))
        const removed = prevSelectedIds.filter((id) => !newSelectedIds.includes(id))

        const token = localStorage.getItem("token")

        await Promise.all(
            added.map((id) => {
                const place = placeList.find((p) => p.id === id)
                return place ? addPlaceToMyTrip(token, place.id) : null
            })
        )

        await Promise.all(
            removed.map((id) => {
                const place = placeList.find((p) => p.id === id)
                return place ? deletePlaceFromMyTrip(token, place.id) : null
            })
        )

        const newSelected = placeList.filter((p) => newSelectedIds.includes(p.id))
        setPlaceSelected(newSelected)
    }

    const handleGenerateTrip = async () => {
        try {
            setLoading(true)
            const response = await generate_Trip_Itinerary(
                hotelSelected,
                placeSelected,
                preferences,
                day,
                number
            )
            console.log(response)

            setSmartTrip(response)
        } catch (error) {
            console.log(error.message || "Không thể tạo chuyến đi!")
        } finally {
            setLoading(false)
        }
    }

    // return (
    //     <div className="bg-white py-6">
    //         <Container fixed>
    //             <div className="flex gap-10 items-center">
    //                 <div className="flex flex-wrap gap-4 flex-1">
    //                     <p className="w-36">Khách sạn:</p>
    //                     {hotelSelected?.map((item) => (
    //                         <div
    //                             key={item?.hotel?.id}
    //                             className="flex items-start p-2 bg-amber-50 rounded-lg gap-2 w-72">
    //                             <img
    //                                 src={item?.hotel?.imageUrls?.[0]}
    //                                 alt={item?.hotel?.name}
    //                                 className="h-12 w-16 object-cover rounded-lg"
    //                             />
    //                             <p
    //                                 onClick={() => navigate(`/hotels/${item?.hotel?.slug}`)}
    //                                 className="flex-1 hover:underline cursor-pointer text-base">
    //                                 {item?.hotel?.name}
    //                             </p>
    //                             <button onClick={() => deleteHotelFromMyTrip(item?.hotel?.id)}>
    //                                 ✖
    //                             </button>
    //                         </div>
    //                     ))}
    //                 </div>
    //                 <button
    //                     onClick={() => navigate("/hotels")}
    //                     className=" bg-blue-500 py-2 px-3 text-white rounded-lg h-10">
    //                     Thêm khách sạn mới
    //                 </button>
    //             </div>

    //             <div className="flex">
    //                 <div className="flex gap-6 items-start mt-10 flex-1">
    //                     <p className="w-36 mt-1">Địa điểm muốn tới:</p>
    //                     <Select
    //                         multiple
    //                         value={placeSelected.map((p) => p.id)}
    //                         onChange={handleChange1}
    //                         sx={{ width: 300 }}
    //                         input={<OutlinedInput />}
    //                         MenuProps={MenuProps}>
    //                         {placeList.map((place) => (
    //                             <MenuItem
    //                                 key={place.id}
    //                                 value={place.id}
    //                                 style={getStyles(
    //                                     place.id,
    //                                     placeSelected.map((p) => p.id),
    //                                     theme
    //                                 )}>
    //                                 {place.title}
    //                             </MenuItem>
    //                         ))}
    //                     </Select>
    //                 </div>
    //                 <div className="flex gap-6 items-start mt-10 flex-1">
    //                     <p className="w-20 mt-1">Số ngày:</p>
    //                     <NumberInput count={day} setCount={setDay} min={1} />
    //                 </div>
    //             </div>

    //             <div className="flex gap-6 items-start mt-8">
    //                 <p className="w-36">Yêu cầu cá nhân:</p>
    //                 <textarea
    //                     multiple
    //                     className="bg-silverMist rounded-lg flex-1 h-20 outline-none resize-none p-3"
    //                 />
    //             </div>

    //             <div className="flex mt-6 justify-end">
    //                 <button className=" bg-blue-500 py-2 px-3 text-white rounded-lg h-10">
    //                     Tạo lịch trình
    //                     <ArrowForwardIosIcon
    //                         sx={{ fontSize: 15, color: "white", marginLeft: 2, marginBottom: 0.3 }}
    //                     />
    //                 </button>
    //             </div>
    //         </Container>
    //     </div>
    // )

    return (
        <div className="bg-white">
            <Container fixed className="py-6 bg-white">
                <div className="shadow-box-6">
                    <h1 className="p-4">Thông tin chuyến đi</h1>
                    <div className="flex gap-6 px-4">
                        <div className="flex-1">
                            <p>Số ngày:</p>
                            <CustomInput
                                value={day}
                                onChange={(e) => setDay(e.target.value)}
                                title="ngày"
                                type="number"
                                step={1}
                            />
                        </div>
                        <div className="flex-1">
                            <p>Số người:</p>
                            <CustomInput
                                value={number}
                                onChange={(e) => setNumber(e.target.value)}
                                title="người"
                                type="number"
                                step={1}
                            />
                        </div>
                    </div>
                    <div className="px-4">
                        <p>Yêu cầu đặc biệt</p>
                        <CustomInput
                            value={preferences}
                            onChange={(e) => setPreferences(e.target.value)}
                            type="text"
                            placeholder="Gần biển, có bể bơi..."
                        />
                    </div>
                    <div className="px-4">
                        <p>Địa điểm muốn đến</p>
                        <Select
                            multiple
                            value={placeSelected.map((p) => p.id)}
                            onChange={handleChange1}
                            sx={{ maxWidth: 535 }}
                            input={<OutlinedInput />}
                            MenuProps={MenuProps}>
                            {placeList.map((place) => (
                                <MenuItem
                                    key={place.id}
                                    value={place.id}
                                    style={getStyles(
                                        place.id,
                                        placeSelected.map((p) => p.id),
                                        theme
                                    )}>
                                    {place.title}
                                </MenuItem>
                            ))}
                        </Select>
                    </div>
                </div>

                <div className="mt-6">
                    <div className="flex items-center h-10 gap-4 mb-2">
                        <h2>Khách sạn muốn ở</h2>
                        <Tooltip title="Add" placement="right">
                            <IconButton onClick={() => navigate("/hotels")}>
                                <MdAdd size={25} color="#457b9d" />
                            </IconButton>
                        </Tooltip>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {hotelSelected?.map((item) => (
                            <div
                                key={item?.hotel?.id}
                                className="flex items-center p-2 bg-amber-50 rounded-lg gap-2">
                                <img
                                    src={item?.hotel?.imageUrls?.[0]}
                                    alt={item?.hotel?.name}
                                    className="h-12 w-16 object-cover rounded-lg"
                                />
                                <div>
                                    <p
                                        onClick={() => navigate(`/hotels/${item?.hotel?.slug}`)}
                                        className="flex-1 hover:underline cursor-pointer text-base">
                                        {item?.hotel?.name}
                                    </p>
                                    <p className="text-sm text-slateGray line-clamp-1">
                                        {item?.hotel?.address}
                                    </p>
                                </div>
                                <button onClick={() => deleteHotelFromMyTrip(item?.hotel?.id)}>
                                    ✖
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex mt-10 justify-center">
                    <button
                        onClick={() => handleGenerateTrip()}
                        className=" bg-oceanSlate py-2 px-3 text-white rounded-lg h-10 w-1/2">
                        GỢI Ý LỊCH TRÌNH THÔNG MINH
                    </button>
                </div>

                {smartTrip && (
                    <div className="mt-10">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{smartTrip}</ReactMarkdown>
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
            </Container>

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

export default TripSchedule
