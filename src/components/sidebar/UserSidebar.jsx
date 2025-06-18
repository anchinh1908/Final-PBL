import { NavLink } from "react-router-dom"
import PersonRoundedIcon from "@mui/icons-material/PersonRounded"
// import LockRoundedIcon from "@mui/icons-material/LockRounded"
import KeyRoundedIcon from "@mui/icons-material/KeyRounded"
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded"
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder"
import "~/styles/UserSidebar.css"
import loopy from "~/assets/loopy.png"
import { useLogout } from "~/hooks/useLogout"
import { useAuthContext } from "~/hooks/useAuthContext"

const UserSidebar = () => {
    const { logout } = useLogout()
    const { user } = useAuthContext()

    return (
        <div className="w-64 flex flex-col items-center">
            <img
                src={user.avatarUrl || loopy}
                alt="image"
                className="border rounded-full h-36 w-36 bg-pink-100 object-cover"
            />
            <aside className="rounded-lg border w-full mt-6">
                <NavLink
                    to="personal"
                    end
                    className={({ isActive }) =>
                        `user-sidebar-link border-b ${isActive && "user-sidebar-active-link"}`
                    }>
                    <div>
                        <PersonRoundedIcon sx={{ fontSize: 21 }} />
                    </div>
                    <p>Thông tin cá nhân</p>
                </NavLink>
                <NavLink
                    to="wishlist"
                    end
                    className={({ isActive }) =>
                        `user-sidebar-link border-b ${isActive && "user-sidebar-active-link"}`
                    }>
                    <div>
                        <FavoriteBorderIcon sx={{ fontSize: 21 }} />
                    </div>
                    <p>Khách sạn đã lưu</p>
                </NavLink>
                {/* <NavLink
                    to="history"
                    end
                    className={({ isActive }) =>
                        `user-sidebar-link border-b ${isActive && "user-sidebar-active-link"}`
                    }>
                    <div>
                        <FavoriteBorderIcon sx={{ fontSize: 21 }} />
                    </div>
                    <p>Lịch sử xem</p>
                </NavLink> */}
                <NavLink
                    to="change-password"
                    className={({ isActive }) =>
                        `user-sidebar-link border-b ${isActive && "user-sidebar-active-link"}`
                    }>
                    <div>
                        <KeyRoundedIcon sx={{ fontSize: 21 }} />
                    </div>
                    <p>Đổi mật khẩu</p>
                </NavLink>
                <NavLink
                    to="/"
                    onClick={() => logout()}
                    className={({ isActive }) =>
                        `user-sidebar-link ${isActive && "user-sidebar-active-link"}`
                    }>
                    <div>
                        <LogoutRoundedIcon sx={{ fontSize: 21 }} />
                    </div>
                    <p>Đăng xuất</p>
                </NavLink>
            </aside>
        </div>
    )
}

export default UserSidebar
