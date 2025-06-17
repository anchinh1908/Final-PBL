import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import AntDesign from "@expo/vector-icons/AntDesign"
import { useCallback, useState } from "react"
import { COLORS } from "../constants"
import CalendarCustom from "./CalendarCustom"

const DatePicker = ({ onChange, placeholder, disabled, schedule, value, onFocus }) => {
    const [openStartDatePicker, setOpenStartDatePicker] = useState(false)
    const [message, setMessage] = useState(null)

    const handleClose = () => {
        onChange({
            date: null,
            dayOfWeek: null,
            time: null,
        })
        setMessage(null)
        setOpenStartDatePicker(false) // Close the modal
    }

    const handleSetDate = () => {
        if (value.time !== null) {
            setOpenStartDatePicker(false)
        } else {
            setMessage("* Chưa chọn ngày - khung giờ")
        }
    }

    return (
        <View>
            <TouchableOpacity
                style={styles.btnDatePicker}
                onPress={() => {
                    onFocus()
                    !disabled && setOpenStartDatePicker(true)
                }} // Prevent opening if disabled
                disabled={disabled} // Disable the button if needed
            >
                <Text
                    style={[
                        { flex: 1, paddingHorizontal: 0 },
                        disabled && { color: COLORS.gray }, // Change text color if disabled
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {value.date !== null && value.dayOfWeek !== null && value.time !== null
                        ? value.time.label + ", " + value.dayOfWeek + " " + value.date
                        : placeholder}
                </Text>
                <AntDesign name="calendar" size={18} color={COLORS.gray} />
            </TouchableOpacity>
            <Modal animationType="slide" transparent visible={openStartDatePicker}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <CalendarCustom
                            schedule={schedule}
                            setMessage={setMessage}
                            setSelectedDay={(val) => {
                                onChange(val)
                            }}
                            selectedDay={value}
                            theme="dark"
                        />

                        {message && (
                            <View style={{ flexDirection: "row", justifyContent: "center" }}>
                                <Text style={{ color: "red", textAlign: "center" }}>{message}</Text>
                            </View>
                        )}

                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-evenly",
                                marginHorizontal: 20,
                            }}>
                            <TouchableOpacity onPress={handleClose}>
                                <Text style={{ color: "white", borderWidth: 1 }}>Close</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSetDate}>
                                <Text style={{ color: COLORS.PersianGreen }}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default DatePicker

const styles = StyleSheet.create({
    btnDatePicker: {
        height: 40,
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: COLORS.white,
        flexDirection: "row",
        width: "100%",
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 15,
        borderColor: COLORS.silver,
    },
    centeredView: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.6)",
    },
    modalView: {
        margin: 5,
        backgroundColor: COLORS.black,
        borderRadius: 20,
        padding: 10,
        width: "90%",
    },
})
