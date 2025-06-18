import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import PlaceForm from "~/pages/admin/PlaceForm"
import { get_Place_By_Slug } from "~/services/PlaceService"
import "~/styles/ManagerOrders.css"

const UpdatePlace = () => {
    const location = useLocation()
    const [place, setPlace] = useState({})

    const { placeSlug } = location.state || {}

    useEffect(() => {
        const get_Product_Detail = async () => {
            if (placeSlug) {
                try {
                    const { place } = await get_Place_By_Slug(placeSlug)
                    
                    if (place) {
                        const formattedPlace = {
                            ...place,
                            services:
                                Array.isArray(place.services) &&
                                place.services.length > 0 &&
                                typeof place.services[0] === "object"
                                    ? place.services[0]
                                    : place.services || {},
                        }

                        setPlace(formattedPlace)
                    }
                } catch (error) {
                    console.error(error)
                }
            }
        }

        get_Product_Detail()
    }, [placeSlug])


    return <div>{place?.title && <PlaceForm place={place} />}</div>
}

export default UpdatePlace
