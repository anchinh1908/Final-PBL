import BarChart from "~/components/charts/BarChart"
import RevenueMapChart from "~/components/charts/MapChart"
import { FaSackDollar, FaBasketShopping, FaUser } from "react-icons/fa6"
import { FaLaptop } from "react-icons/fa"
import { useEffect, useState } from "react"
import "~/styles/Dashboard.css"
import Grid from "@mui/material/Grid2"
import { count_Number } from "~/services/UserService"
import { get_Top_5_Places } from "~/services/PlaceService"
import BarChartVertical from "~/components/charts/BarChartVertical"
import { get_Top_5_Hotels } from "~/services/HotelService"

const Dashboard = () => {
    const [totalRevenue, setTotalRevenue] = useState(0)
    const [totalOrder, setTotalOrder] = useState(0)
    const [totalProduct, setTotalProduct] = useState(0)
    const [totalCustumer, setTotalCustumer] = useState(0)
    const [topPlaces, setTopPlaces] = useState([])
    const [topHotels, setTopHotels] = useState([])

    useEffect(() => {
        const get_Count_Number = async () => {
            try {
                const token = localStorage.getItem("token")
                if (token) {
                    const { ["Total Item"]: totalItem } = await count_Number(token)
                    if (totalItem) {
                        setTotalRevenue(totalItem["Total Hotel"])
                        setTotalOrder(totalItem["Total Places"])
                        setTotalProduct(totalItem["Total Room"])
                        setTotalCustumer(totalItem["Total User"])
                    }

                    // setUsers(products.data)
                    // setTotalPages(products.totalPages)
                }
            } catch (error) {
                console.log("Lỗi khi lấy danh sách người dùng:", error)
            }
        }

        const getTopPlaces = async () => {
            try {
                const { data } = await get_Top_5_Places()
                setTopPlaces(data)
            } catch (error) {
                console.log("Lỗi khi lấy danh sách top khách sạn:", error)
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

        get_Count_Number()
        getTopPlaces()
        getTopHotels()
    }, [])

    return (
        <div className="mx-[5%]">
            <h1 className="title-form">Dashboard</h1>

            <Grid
                container
                spacing={{ xs: 2, sm: 3, md: 5 }}
                columns={{ xs: 1, sm: 2, md: 4 }}
                className="mb-8">
                <Grid size={1} className="dashboard-box shadow-box">
                    <div className="item-icon bg-blue-200">
                        <FaSackDollar className="text-blue-600 size-[50%]" />
                    </div>
                    <div className="my-2">
                        <p className="box-item-title">Tổng số khách sạn</p>
                        <h1 className="box-item-number">{totalRevenue}</h1>
                    </div>
                </Grid>

                <Grid size={1} className="dashboard-box shadow-box">
                    <div className="item-icon bg-orange-200">
                        <FaBasketShopping className="text-orange-600 size-[50%]" />
                    </div>
                    <div className="my-2">
                        <p className="box-item-title">Tổng số địa điểm</p>
                        <h1 className="box-item-number">{totalOrder}</h1>
                    </div>
                </Grid>

                <Grid size={1} className="dashboard-box shadow-box">
                    <div className="item-icon bg-green-200">
                        <FaLaptop className="text-green-600 size-[50%]" />
                    </div>
                    <div className="my-2">
                        <p className="box-item-title">Tổng số phòng</p>
                        <h1 className="box-item-number">{totalProduct}</h1>
                    </div>
                </Grid>

                <Grid size={1} className="dashboard-box shadow-box">
                    <div className="item-icon bg-pink-200">
                        <FaUser className="text-pink-600 size-[50%]" />
                    </div>
                    <div className="my-2">
                        <p className="box-item-title">Tổng khách hàng</p>
                        <h1 className="box-item-number">{totalCustumer}</h1>
                    </div>
                </Grid>
            </Grid>

            <Grid container spacing={{ xs: 3, sm: 3, md: 4 }} columns={1} className="mb-8">
                <Grid size={1} className="shadow-box">
                    <RevenueMapChart hotels={topHotels} />
                </Grid>
            </Grid>

            <Grid
                container
                spacing={{ xs: 3, sm: 3, md: 4 }}
                columns={{ xs: 1, sm: 1, md: 5 }}
                className="mb-5">
                <Grid size={{ xs: 1, sm: 1, md: 3 }} className="shadow-box">
                    {topHotels.length > 0 && <BarChartVertical places={topHotels} />}
                </Grid>

                <Grid size={{ xs: 1, sm: 1, md: 2 }} className="shadow-box">
                    {topPlaces.length > 0 && <BarChart places={topPlaces} />}
                </Grid>
            </Grid>
        </div>
    )
}

export default Dashboard
