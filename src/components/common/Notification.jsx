import { useEffect } from "react"
import PropTypes from "prop-types"
import "~/styles/Notification.css"

const Notification = ({ type, message, onClose, duration }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose()
        }, duration)
        return () => clearTimeout(timer)
    }, [duration, onClose])

    return (
        <div className={`notification ${type}`}>
            <span>{message}</span>
            <button onClick={onClose} className="close-btn">
                &times;
            </button>
        </div>
    )
}

Notification.propTypes = {
    type: PropTypes.oneOf(["success", "error", "warning", "info"]),
    message: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    duration: PropTypes.number,
}

export default Notification
