import { Add, Remove } from "@mui/icons-material"
import { IconButton } from "@mui/material"
import PropTypes from "prop-types"

const NumberInput = ({ count, setCount, min = 0 }) => {
    return (
        <div className="flex items-center gap-2 border rounded-md">
            <IconButton
                disableRipple={count == 0}
                sx={{ borderRadius: 1.5, ":hover": { backgroundColor: count > min && "#FFFBEB" } }}
                onClick={() => setCount((c) => Math.max(min, c - 1))}>
                <Remove />
            </IconButton>
            <p>{count}</p>
            <IconButton
                sx={{ borderRadius: 1.5, ":hover": { backgroundColor: "#FFFBEB" } }}
                onClick={() => setCount((c) => c + 1)}>
                <Add />
            </IconButton>
        </div>
    )
}

NumberInput.propTypes = {
    count: PropTypes.number.isRequired,
    setCount: PropTypes.func.isRequired,
    min: PropTypes.number,
}

export default NumberInput
