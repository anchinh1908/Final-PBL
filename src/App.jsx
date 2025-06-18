import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import UserRoutes from "~/routes/UserRoutes"
import AdminRoutes from "~/routes/AdminRoutes"
import { useAuthContext } from "~/hooks/useAuthContext"
import { ADMIN_DASHBOARD, HOME } from "~/constants/routes"
import ScrollToTop from "~/utils/ScrollToTop"
// import ProtectedRoute from "./routes/ProtectedRoute"

function App() {
    const { user } = useAuthContext()

    const default_url = user && user.role === "ADMIN" ? ADMIN_DASHBOARD : HOME

    return (
        <BrowserRouter>
            <ScrollToTop />
            <Routes>
                {user && user.role === "ADMIN" ? (
                    <Route path="/admin/*" element={<AdminRoutes />} />
                ) : (
                    <Route path="/*" element={<UserRoutes />} />
                )}

                <Route path="*" element={<Navigate to={default_url} replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App

{
    /* <Route
                    path="/admin/*"
                    element={user && user.role === "admin" ? <AdminRoutes /> : <Navigate to="/" />}
                />
                <Route
                    path="/*"
                    element={
                        user?.role !== "admin" ? <UserRoutes /> : <Navigate to="/admin/dashboard" />
                    }
                /> */
}

{
    /* 
                <Route
                    path="/login"
                    element={!user ? <Login /> : <Navigate to={default_url} replace />}
                />
                <Route
                    path="/signup"
                    element={!user ? <Signup /> : <Navigate to={default_url} replace />}
                /> */
}
