import PropTypes from "prop-types"

const CustomMultiSelect = ({
    selected,
    setSelected,
    options,
    label = "Chọn mục",
    className = "",
}) => {
    const displayText =
        selected.length > 0
            ? selected.slice(0, 3).join(", ") + (selected.length > 3 ? ", ..." : "")
            : label

    const toggleOption = (item) => {
        setSelected((prev) =>
            prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
        )
    }

    return (
        <div className={`relative w-full ${className}`}>
            <button className="w-full text-left border rounded p-2 bg-white">{displayText}</button>
            <div className="absolute w-full bg-white border mt-1 rounded max-h-60 overflow-y-auto z-10">
                {options.map((item) => (
                    <div
                        key={item}
                        className={`cursor-pointer px-4 py-2 hover:bg-gray-100 ${
                            selected.includes(item) ? "bg-blue-100 font-semibold" : ""
                        }`}
                        onClick={() => toggleOption(item)}>
                        {item}
                    </div>
                ))}
            </div>
        </div>
    )
}

CustomMultiSelect.propTypes = {
    selected: PropTypes.array.isRequired,
    setSelected: PropTypes.func.isRequired,
    options: PropTypes.array.isRequired,
    label: PropTypes.string,
    className: PropTypes.string,
}

export default CustomMultiSelect
