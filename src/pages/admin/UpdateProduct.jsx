import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import ProductForm from "~/pages/admin/ProductForm"
import { get_Hotel_By_ID } from "~/services/HotelService"
import { get_All_Rooms_By_HotelID } from "~/services/RoomService"
import "~/styles/ManagerOrders.css"

const UpdateProduct = () => {
    const location = useLocation()
    const [hotel, setHotel] = useState({})

    const { productId } = location.state || {}

    useEffect(() => {
        const get_Product_Detail = async () => {
            if (productId) {
                try {
                    const product = await get_Hotel_By_ID(productId)

                    if (product) {
                        const hotel = product.hotel.hotel

                        setHotel((prev) => ({ ...prev, ...hotel }))
                    }
                } catch (error) {
                    console.error(error)
                }
            }
        }

        const get_All_Room = async () => {
            if (productId) {
                try {
                    const { rooms } = await get_All_Rooms_By_HotelID(productId)
                    setHotel((prev) => ({ ...prev, roomTypes: rooms }))
                // eslint-disable-next-line no-unused-vars
                } catch (error) {
                    // console.error(error)
                    setHotel((prev) => ({ ...prev, roomTypes: [] }))
                }
            }
        }

        get_Product_Detail()
        get_All_Room()
    }, [productId])

    // useEffect(() => {
    //     console.log("hotel:", hotel)
    // }, [hotel])

    return <div>{hotel?.name && <ProductForm hotel={hotel} />}</div>
}

export default UpdateProduct
