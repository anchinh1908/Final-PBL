import PlaceForm from "~/pages/admin/PlaceForm"
import { defaultPlaceDetails } from "~/utils/defaultTable"

const AddPlace = () => {
    const place = defaultPlaceDetails
    return <PlaceForm place={place} />
}

export default AddPlace
