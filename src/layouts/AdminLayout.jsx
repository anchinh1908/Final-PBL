import PropTypes from "prop-types"
import Sidebar from "~/components/sidebar/Sidebar"
import AdminNavbar from "~/components/header/AdminNavbar"

const AdminLayout = ({ children }) => {
    return (
        <div className="min-h-screen">
            <AdminNavbar />
            <div className="flex min-height-main">
                <Sidebar />
                <main className="p-4 flex-1 bg-background shadow-admin-main">{children}</main>
            </div>
        </div>
    )
}

AdminLayout.propTypes = {
    children: PropTypes.node.isRequired,
}

export default AdminLayout
