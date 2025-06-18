import PropTypes from "prop-types"
import { useEffect, useState } from "react"
import SearchableMapPicker from "~/components/charts/SearchableMapPicker"

const MapPickerModal = ({
    isOpen,
    onClose,
    selectedPosition,
    setSelectedPosition,
    selectedAddress,
    setSelectedAddress,
}) => {
    const [tempPosition, setTempPosition] = useState(selectedPosition)
    const [tempAddress, setTempAddress] = useState(selectedAddress)

    useEffect(() => {
        if (isOpen) {
            setTempPosition(selectedPosition)
            setTempAddress(selectedAddress)
        }
    }, [isOpen, selectedPosition, selectedAddress])

    const handleConfirm = () => {
        if (tempPosition) {
            setSelectedPosition(tempPosition)
            setSelectedAddress(tempAddress)
            onClose()
        } else {
            alert("Vui lòng chọn vị trí trên bản đồ.")
        }
    }

    // const handleClose = () => {
    //     setSelectedPosition({ lat: 0, lng: 0 })
    //     setSelectedAddress("")
    //     onClose()
    // }

    const handleClose = () => {
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-[90vw] max-w-3xl p-4 relative">
                <button
                    className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-xl font-bold"
                    onClick={handleClose}
                    aria-label="Đóng modal">
                    &times;
                </button>

                <h2 className="text-lg font-semibold mb-4">Chọn vị trí trên bản đồ</h2>

                <SearchableMapPicker
                    position={tempPosition}
                    setPosition={setTempPosition}
                    address={tempAddress}
                    setAddress={setTempAddress}
                />

                <div className="mt-4 flex justify-end space-x-2">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">
                        Hủy
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        OK
                    </button>
                </div>
            </div>
        </div>
    )
}

MapPickerModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    selectedPosition: PropTypes.object.isRequired,
    setSelectedPosition: PropTypes.func.isRequired,
    selectedAddress: PropTypes.string.isRequired,
    setSelectedAddress: PropTypes.func.isRequired,
}

export default MapPickerModal
