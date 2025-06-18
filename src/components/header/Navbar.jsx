import { useEffect, useState } from "react"
import { FaAngleDown } from "react-icons/fa"
import { NavLink, useNavigate } from "react-router-dom"
import logo from "~/assets/logoHotel.png"
import { useAuthContext } from "~/hooks/useAuthContext"
import { useLogout } from "~/hooks/useLogout"
import LoginRegister_Model from "~/pages/common/LoginRegister_Model"
// import Signup from "~/pages/common/Signup"
import "~/styles/Navbar.css"

const navItems = [
    { label: "Khách sạn", to: "/hotels" },
    { label: "Địa điểm du lịch", to: "/places" },
    { label: "Giới thiệu", to: "/about" },
    // { label: "Phản hồi", to: "/feedback" },
    { label: "Liên hệ", to: "/" },
]

const Navbar = () => {
    // const { logout } = useLogout()
    // const { user } = useAuthContext()

    // const [wishlist, setWishlist] = useState(0)
    // const [cart, setCart] = useState(0)

    // const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    // const toggleDropdown = (e) => {
    //     e.stopPropagation()
    //     setIsDropdownOpen((prev) => !prev)
    // }

    // const closeDropdown = (e) => {
    //     if (!e.target.closest(".account-header") && !e.target.closest(".dropdown-user")) {
    //         setIsDropdownOpen(false)
    //     }
    // }

    // useEffect(() => {
    //     document.addEventListener("click", closeDropdown)
    //     return () => {
    //         document.removeEventListener("click", closeDropdown)
    //     }
    // }, [])

    // const handleLogout = () => {
    //     logout()
    // }

    // const [brands, setBrands] = useState([])

    // useEffect(() => {
    //     const fetchBrands = async () => {
    //         const response = await fetch("http://localhost:8000/brands")
    //         const json = await response.json()

    //         if (response.ok && json.success) setBrands(json.data)
    //     }

    //     fetchBrands()
    // }, [])
    const navigate = useNavigate()
    const { logout } = useLogout()
    const { user } = useAuthContext()

    const [showLogin, setShowLogin] = useState(false)
    const [showRegister, setShowRegister] = useState(false)

    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    const handleLogout = () => {
        logout()
    }

    const toggleDropdown = () => {
        setIsDropdownOpen((prev) => !prev)
    }

    const closeDropdown = (e) => {
        if (!e.target.closest(".open-dropdown")) {
            setIsDropdownOpen(false)
        }
    }

    useEffect(() => {
        document.addEventListener("click", closeDropdown)
        return () => {
            document.removeEventListener("click", closeDropdown)
        }
    }, [])

    return (
        <div className="relative h-20 border-b z-50">
            <img
                className="absolute left-10 w-44 h-full cursor-pointer"
                onClick={() => navigate("/")}
                src={logo}
                alt="Logo"
            />
            <div className="flex items-center justify-between w-full py-6 pr-24 gap-6">
                <div className="flex flex-1 justify-end gap-1.5 flex-wrap">
                    {navItems.map((item, index) => (
                        <NavLink
                            key={index}
                            to={item.to}
                            className="p-1.5 rounded-lg cursor-pointer text-base font-arial hover:bg-amber-50 hover:font-normal hover:text-black">
                            {item.label}
                        </NavLink>
                    ))}
                </div>

                {!user ? (
                    <div className="flex w-56 gap-3">
                        <button
                            onClick={() => {
                                setShowLogin(true)
                                setShowRegister(false)
                            }}
                            className="flex-1 p-1.5 bg-amber-50 rounded-lg outline outline-1 text-base font-arial">
                            Đăng nhập
                        </button>
                        <button
                            onClick={() => {
                                setShowLogin(true)
                                setShowRegister(true)
                            }}
                            className="flex-1 p-1.5 bg-black text-white rounded-lg outline outline-1 text-base font-arial">
                            Đăng kí
                        </button>
                    </div>
                ) : (
                    <nav className="open-dropdown z-50">
                        <div onClick={toggleDropdown} className="open-expand bg-amber-50">
                            <p className="mr-2 text-base">{user?.fullName}</p>
                            <FaAngleDown size={15} />
                        </div>

                        {isDropdownOpen && (
                            <ul className="dropdown-admin">
                                <li
                                    onClick={() => {
                                        toggleDropdown()
                                        navigate("/my-account/personal")
                                    }}>
                                    Tài khoản
                                </li>
                                <li
                                    onClick={() => {
                                        navigate("/trip-schedule")
                                    }}>
                                    Lên lịch chuyến đi
                                </li>
                                <li onClick={handleLogout}>Đăng xuất</li>
                            </ul>
                        )}
                    </nav>
                )}
            </div>
            <LoginRegister_Model
                isLoginOpen={showLogin}
                setIsLoginOpen={setShowLogin}
                isRegister={showRegister}
                setIsRegister={setShowRegister}
            />
        </div>
    )
}

export default Navbar

// <div className="header bg-white shadow-user-main">
//     <a href="/">
//         <img src={logo} alt="Logo" className="h-14" />
//     </a>

//     <div className="navbar">
//         <nav className="menu rounded-xl flex mr-2.5">
//             <TbCategoryFilled size={24} color="#00a6a9" />
//             <NavLink to="#" className="menu-link">
//                 Danh mục
//             </NavLink>

//             <div className="dropdown">
//                 <ul className="dropdown-menu">
//                     <li>
//                         <NavLink to="#" className="">
//                             Tất cả các thương hiệu
//                         </NavLink>
//                     </li>
//                     {brands &&
//                         brands.map((item) => (
//                             <li key={item._id}>
//                                 <NavLink to="#" key={item._id}>
//                                     {item.name}
//                                 </NavLink>
//                             </li>
//                         ))}
//                 </ul>
//             </div>
//         </nav>
//         <div className="search rounded-full">
//             <input type="text" name="txtSearch" id="" />
//             <FaSearch size={20} className="search-icon" />
//         </div>
//     </div>

//     <nav className="flex flex-row items-center">
//         <div className="flex flex-row">
//             <div className="mr-3 header-cart">
//                 <FaRegHeart size={30} color="#00a6a9" />
//                 <span className="number-cart rounded-full">{wishlist}</span>
//             </div>

//             <div className="mr-3 header-cart">
//                 <GrCart size={29} color="#00a6a9" />
//                 <span className="number-cart rounded-full">{cart}</span>
//             </div>
//         </div>

//         {user ? (
//             <div className="account-header">
//                 <img src={loopy} alt="avatar" onClick={toggleDropdown} />

//                 {isDropdownOpen && (
//                     <ul className="dropdown-user">
//                         <li className="flex items-center" onClick={() => {}}>
//                             <MdOutlineAccountCircle
//                                 size={20}
//                                 className="mr-2 text-gray-600"
//                             />
//                             Tài khoản
//                         </li>
//                         <li className="flex items-center" onClick={() => {}}>
//                             <MdPassword size={20} className="mr-2 text-gray-600" />
//                             Đặt lại mật khẩu
//                         </li>
//                         <li className="flex items-center" onClick={handleLogout}>
//                             <MdLogout size={20} className="mr-2 text-gray-600" />
//                             Đăng xuất
//                         </li>
//                     </ul>
//                 )}
//             </div>
//         ) : (
//             <div className="menu rounded-full flex">
//                 <RiAccountCircleLine size={25} color="#00a6a9" />
//                 <NavLink to="/login" className="menu-link">
//                     Đăng nhập
//                 </NavLink>
//             </div>
//         )}
//     </nav>
// </div>
