import { useState } from "react"
import { SketchPicker } from "react-color"
import "~/styles/ColorPicker.css"

const ColorPicker = ({color, onChangeComplete}) => {
    const [openColorPicker, setOpenColorPicker] = useState(false)

    const handleChangeComplete = (color) => {
        onChangeComplete({ background: color.hex })
    }

    return (
        <div className="relative custom-input">
            <input type="text" value={color} />
            <div
                className="h-3 w-3 bg-black"
                onClick={() => setOpenColorPicker(!openColorPicker)}
            />
            {openColorPicker && (
                <SketchPicker
                    color={color.background}
                    onChangeComplete={handleChangeComplete}
                    className="sketch-picker"
                />
            )}
        </div>
    )
}

export default ColorPicker
