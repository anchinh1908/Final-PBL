import { Container } from "@mui/material"
import { Outlet } from "react-router-dom"
import UserSidebar from "~/components/sidebar/UserSidebar"

const UserProfileLayout = () => {
    return (
        <div className="py-8 bg-white">
            <Container fixed className="flex gap-10 items-start">
                <UserSidebar />
                <div className="flex-1 flex flex-col gap-4">
                    <Outlet />
                </div>
            </Container>
        </div>
    )
}

export default UserProfileLayout
