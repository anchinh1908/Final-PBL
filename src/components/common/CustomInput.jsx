import PropTypes from "prop-types"
import "~/styles/CustomInput.css"

const CustomInput = ({ placeholder, value, onChange, title, name, type, step }) => {
    return (
        <div className="custom-input" name={name}>
            <input
                className={`${title ? "pl-[15px] pr-[5px]" : "px-[15px]"}`}
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                {...(step !== undefined && { step })}
            />
            {title && <span>{title}</span>}
        </div>
    )
}

CustomInput.propTypes = {
    placeholder: PropTypes.string,
    value: PropTypes.any.isRequired,
    onChange: PropTypes.func.isRequired,
    title: PropTypes.string,
    name: PropTypes.string.isRequired,
    type: PropTypes.string,
    step: PropTypes.any,
}

export default CustomInput
