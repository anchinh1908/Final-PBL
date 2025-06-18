// import PropTypes from "prop-types"
// import FooterPage from "~/components/footer/FooterPage"
// import Navbar from "~/components/header/Navbar"

// const UserLayout = ({ children }) => {
//     return (
//         <div className="min-h-screen">
//             <header className="h-20">
//                 <Navbar />
//             </header>

//             <main className="min-height-main bg-background">{children}</main>

//             <footer>
//                 <FooterPage />
//             </footer>
//         </div>
//     )
// }

// UserLayout.propTypes = {
//     children: PropTypes.node.isRequired, // Kiểm tra kiểu dữ liệu của 'children'
// }

// export default UserLayout

import FooterPage from "~/components/footer/FooterPage"
import Navbar from "~/components/header/Navbar"
import { Outlet } from "react-router-dom"
import ChatWidget from "~/pages/common/ChatWidget"

const UserLayout = () => {
    return (
        <div className="min-h-screen">
            <header className="h-20">
                <Navbar />
            </header>
            {/* min-height-main  */}
            <main className="bg-background">
                <Outlet />
            </main>

            <footer>
                <FooterPage />
            </footer>

            <ChatWidget />
        </div>
    )
}

export default UserLayout
