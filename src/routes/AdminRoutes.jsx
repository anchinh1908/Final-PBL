import { Navigate, Route, Routes } from "react-router-dom"
import Dashboard from "~/pages/admin/Dashboard"
import AdminLayout from "~/layouts/AdminLayout"
import { ADMIN_DASHBOARD } from "~/constants/routes"
import ProductRecycleBin from "~/pages/admin/ProductRecycleBin"
import AddProduct from "~/pages/admin/AddProduct"
import UpdateProduct from "~/pages/admin/UpdateProduct"
import ManagerAccounts from "~/pages/admin/ManagerAccounts"
import ManagerHotels from "~/pages/admin/ManagerHotels"
import ManagerPlaces from "~/pages/admin/ManagerPlaces"
import UpdatePlace from "~/pages/admin/UpdatePlace"
import AddPlace from "~/pages/admin/AddPlace"
// import ScrollToTop from "~/utils/ScrollToTop"

const AdminRoutes = () => {
    return (
        <AdminLayout>
            {/* <ScrollToTop /> */}
            <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/hotels" element={<ManagerHotels />} />
                <Route path="/add-hotel" element={<AddProduct />} />
                <Route path="/update-hotel" element={<UpdateProduct />} />
                <Route path="/places" element={<ManagerPlaces />} />
                <Route path="/add-place" element={<AddPlace />} />
                <Route path="/update-place" element={<UpdatePlace />} />
                {/* <Route path="/orders" element={<ManagerOrders />} /> */}
                <Route path="/accounts" element={<ManagerAccounts />} />
                <Route path="/products-recycling-bin" element={<ProductRecycleBin />} />
                <Route path="/orders-recycling-bin" />
                <Route path="*" element={<Navigate to={ADMIN_DASHBOARD} replace />} />
            </Routes>
        </AdminLayout>
    )
}

export default AdminRoutes
