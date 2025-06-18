import { NavLink } from "react-router-dom"
import { IoHome, IoMenu } from "react-icons/io5"
import { MdAccountCircle, MdHotelClass, MdMenuOpen } from "react-icons/md"
import { FaMapLocationDot } from "react-icons/fa6"
import { useState } from "react"
import "~/styles/Sidebar.css"
import {
    ADMIN_ACCOUNTS,
    ADMIN_ADD_HOTEL,
    ADMIN_ADD_PLACE,
    ADMIN_DASHBOARD,
    ADMIN_HOTELS,
    ADMIN_PlACES,
} from "~/constants/routes"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { LuDiamond } from "react-icons/lu"
// import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"

const Sidebar = () => {
    // const navigate = useNavigate()
    // const location = useLocation()

    const [closedNav, setClosedNav] = useState(false)
    const [cyclingBinExpand, setCyclingBinExpand] = useState(false)
    const [placeExpand, setPlaceExpand] = useState(false)

    const getNavWidth = () => {
        return closedNav ? "w-[2.25rem]" : "w-44"
    }

    const checkActiveLink = () => {
        const currentUrl = location.pathname

        if (closedNav && [ADMIN_ADD_HOTEL, ADMIN_HOTELS].includes(currentUrl))
            return "bg-oceanSlate text-white"
    }

    const checkPlaceActiveLink = () => {
        const currentUrl = location.pathname

        if (closedNav && [ADMIN_ADD_PLACE, ADMIN_PlACES].includes(currentUrl))
            return "bg-oceanSlate text-white"
    }

    // const handleLinkClick = (url) => {
    //     navigate(url, { replace: true })
    // }

    return (
        <aside>
            <nav className={"mx-3 transition-width " + getNavWidth()}>
                <button
                    onClick={() => setClosedNav(!closedNav)}
                    className="my-4 rounded-full p-2 hover:bg-slate-100">
                    {closedNav ? (
                        <IoMenu size={25} className="sidebar-button" />
                    ) : (
                        <MdMenuOpen size={25} className="sidebar-button" />
                    )}
                </button>

                <ul>
                    <li>
                        <NavLink
                            to={ADMIN_DASHBOARD}
                            end
                            className={({ isActive }) =>
                                `sidebar-link ${isActive && "active-link"}`
                            }>
                            <IoHome size={20} className="sidebar-icon" />
                            {!closedNav && <p>Trang chủ</p>}
                        </NavLink>
                    </li>
                    {/* <li>
                        <NavLink
                            to={ADMIN_HOTELS}
                            // onClick={() => handleLinkClick(ADMIN_PRODUCTS)}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive && "active-link"}`
                            }>
                            <MdHotelClass size={20} className="sidebar-icon" />
                            {!closedNav && <p>Khách sạn</p>}
                        </NavLink>
                    </li> */}
                    <li>
                        <div
                            className={`sidebar-link ${checkActiveLink()}`}
                            onClick={() => {
                                setCyclingBinExpand(!cyclingBinExpand)
                            }}>
                            <MdHotelClass
                                size={20}
                                className={`sidebar-icon ${checkActiveLink()}`}
                            />
                            {!closedNav && (
                                <>
                                    <p>Khách sạn</p>
                                    {cyclingBinExpand ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                                </>
                            )}
                        </div>
                        {cyclingBinExpand && !closedNav && (
                            <>
                                <NavLink
                                    to={ADMIN_HOTELS}
                                    className={({ isActive }) =>
                                        `expand-link ${isActive && "active-expand-link"}`
                                    }>
                                    <LuDiamond className="sidebar-icon" />
                                    {!closedNav && <p>Danh sách</p>}
                                </NavLink>
                                <NavLink
                                    to={ADMIN_ADD_HOTEL}
                                    className={({ isActive }) =>
                                        `expand-link ${isActive && "active-expand-link"}`
                                    }>
                                    <LuDiamond className="sidebar-icon" />
                                    {!closedNav && <p>Thêm mới</p>}
                                </NavLink>
                            </>
                        )}
                    </li>
                    {/* <li>
                        <NavLink
                            to={ADMIN_PlACES}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive && "active-link"}`
                            }>
                            <FaMapLocationDot size={20} className="sidebar-icon" />
                            {!closedNav && <p>Địa điểm</p>}
                        </NavLink>
                    </li> */}
                    <li>
                        <div
                            className={`sidebar-link ${checkPlaceActiveLink()}`}
                            onClick={() => {
                                setPlaceExpand(!placeExpand)
                            }}>
                            <FaMapLocationDot
                                size={20}
                                className={`sidebar-icon ${checkPlaceActiveLink()}`}
                            />
                            {!closedNav && (
                                <>
                                    <p>Địa điểm</p>
                                    {placeExpand ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                                </>
                            )}
                        </div>
                        {placeExpand && !closedNav && (
                            <>
                                <NavLink
                                    to={ADMIN_PlACES}
                                    className={({ isActive }) =>
                                        `expand-link ${isActive && "active-expand-link"}`
                                    }>
                                    <LuDiamond className="sidebar-icon" />
                                    {!closedNav && <p>Danh sách</p>}
                                </NavLink>
                                <NavLink
                                    to={ADMIN_ADD_PLACE}
                                    className={({ isActive }) =>
                                        `expand-link ${isActive && "active-expand-link"}`
                                    }>
                                    <LuDiamond className="sidebar-icon" />
                                    {!closedNav && <p>Thêm mới</p>}
                                </NavLink>
                            </>
                        )}
                    </li>
                    {/* <li>
                        <NavLink
                            to={ADMIN_ORDERS}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive && "active-link"}`
                            }>
                            <FaCartPlus size={20} className="sidebar-icon" />
                            {!closedNav && <p>Đơn Hàng</p>}
                        </NavLink>
                    </li> */}
                    <li>
                        <NavLink
                            to={ADMIN_ACCOUNTS}
                            // onClick={() => handleLinkClick(ADMIN_PRODUCTS)}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive && "active-link"}`
                            }>
                            <MdAccountCircle size={20} className="sidebar-icon" />
                            {!closedNav && <p>Tài khoản</p>}
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </aside>
    )
}

export default Sidebar
