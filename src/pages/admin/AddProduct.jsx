import ProductForm from "~/pages/admin/ProductForm"
import { defaultHotelDetails } from "~/utils/defaultTable"

const AddProduct = () => {
    const productDetails = defaultHotelDetails

    return <ProductForm hotel={productDetails} />
}

export default AddProduct
