import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "~/index.css"
import App from "~/App.jsx"
import { AuthContextProvider } from "~/context/AuthContext"
import { ThemeProvider } from "@mui/material"
import theme from "~/theme/theme"
import { HotelContextProvider } from "./context/HotelContext"
import { PlaceContextProvider } from "./context/PlaceContext"
import { MyWishlistContextProvider } from "./context/MyWishlistContext"

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <ThemeProvider theme={theme}>
            {/* <CssBaseline /> */}
            <HotelContextProvider>
                <PlaceContextProvider>
                    <AuthContextProvider>
                        <MyWishlistContextProvider>
                            <App />
                        </MyWishlistContextProvider>
                    </AuthContextProvider>
                </PlaceContextProvider>
            </HotelContextProvider>
        </ThemeProvider>
    </StrictMode>
)
