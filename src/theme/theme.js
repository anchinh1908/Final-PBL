import { createTheme } from "@mui/material/styles"
import palette from "~/theme/palette"
import typography from "~/theme/typography"
import overrides from "~/theme/overrides"

const theme = createTheme({
    palette,
    typography,
    components: overrides,
    spacing: 8,
})

export default theme
