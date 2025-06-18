import logo from "~/assets/iconCrop.png"
import loopy from "~/assets/loopy.png"
import "~/styles/AdminNavbar.css"
import { useLogout } from "~/hooks/useLogout"
import { FaAngleDown } from "react-icons/fa6"
import { useAuthContext } from "~/hooks/useAuthContext"
import { useEffect, useState } from "react"

const AdminNavbar = () => {
    const { logout } = useLogout()
    const { user } = useAuthContext()

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
        <header className="pl-12 py-3 flex items-center justify-between">
            <img src={logo} alt="Logo" className="h-12" />

            <div className="flex items-center mr-10 py-2">
                <img alt="Avatar" src={loopy} className="size-9 rounded-xl border-2 mr-1 " />

                <nav className="open-dropdown">
                    <div onClick={toggleDropdown} className="open-expand bg-amber-50">
                        <p className="mr-2">{user?.fullName}</p>
                        <FaAngleDown size={15} />
                    </div>

                    {isDropdownOpen && (
                        <ul className="dropdown-admin">
                            {/* <li onClick={() => {}}>Tài khoản</li>
                            <li onClick={() => {}}>Đặt lại mật khẩu</li> */}
                            <li onClick={handleLogout}>Đăng xuất</li>
                        </ul>
                    )}
                </nav>
            </div>
        </header>
    )
}

export default AdminNavbar
