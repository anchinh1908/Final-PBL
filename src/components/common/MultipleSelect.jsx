import { MenuItem, OutlinedInput, Select, useTheme } from "@mui/material"
import PropTypes from "prop-types"

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
}

function getStyles(name, personName, theme) {
    return {
        fontWeight:
            Array.isArray(personName) && personName.includes(name)
                ? theme.typography.fontWeightMedium
                : theme.typography.fontWeightRegular,
    }
}

const MultipleSelect = ({ name, value, onChange, maxWidth, items }) => {
    const theme = useTheme()
    return (
        <Select
            name={name}
            multiple
            sx={{ maxWidth: maxWidth }}
            value={value}
            onChange={onChange}
            input={<OutlinedInput />}
            MenuProps={MenuProps}>
            {items.map((place) => (
                <MenuItem key={place} value={place} style={getStyles(place, value, theme)}>
                    {place}
                </MenuItem>
            ))}
        </Select>
    )
}

MultipleSelect.propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    maxWidth: PropTypes.number,
    items: PropTypes.array.isRequired,
}

export default MultipleSelect
