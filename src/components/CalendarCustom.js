import { StyleSheet, Text, View } from "react-native"
import { LocaleConfig, Calendar } from "react-native-calendars"
import { COLORS } from "../constants"
import RadioView from "./RadioView"
import { useEffect, useState } from "react"
import moment from "moment"
import { useAuth } from "../AuthProvider"
import { parse } from "date-fns"
import { formatToDDMMYYYY } from "../utils/ConvertDate"

const darkTheme = {
    calendarBackground: COLORS.black,
    dayTextColor: COLORS.white,
    todayTextColor: COLORS.PersianGreen,
    selectedDayBackgroundColor: COLORS.PersianGreen,
    selectedDayTextColor: COLORS.black,
    arrowColor: COLORS.PersianGreen,
    monthTextColor: COLORS.white,
    selectedDotColor: COLORS.black,
}

const lightTheme = {
    calendarBackground: COLORS.Light20PersianGreen,
    dayTextColor: COLORS.black,
    todayTextColor: COLORS.PersianGreen,
    selectedDayBackgroundColor: COLORS.PersianGreen,
    selectedDayTextColor: COLORS.white,
    arrowColor: COLORS.PersianGreen,
    monthTextColor: COLORS.black,
    selectedDotColor: COLORS.white,
}

const CalendarCustom = ({
    setMessage,
    theme,
    schedule,
    selectedDay,
    setSelectedDay,
    // navigation,
}) => {
    const [markedDates, setMarkedDates] = useState({})

    const { isLoggedIn } = useAuth()

    const getMarkedDatesForMonth = () => {
        let marked = {}
        const currentDate = moment()
        const endOfMonth = moment().add(1, "month")

        // Kiểm tra xem schedule.active_hours có tồn tại và là mảng không
        if (schedule?.active_hours && Array.isArray(schedule.active_hours)) {
            while (currentDate.isBefore(endOfMonth)) {
                const currentDayOfWeek = currentDate.format("dddd")

                schedule.active_hours.forEach((appointment) => {
                    if (appointment.day === currentDayOfWeek) {
                        marked[currentDate.format("YYYY-MM-DD")] = {
                            marked: true,
                            dotColor: COLORS.PersianGreen,
                        }
                    }
                })

                currentDate.add(1, "day")
            }
        } else {
            console.log("schedule.active_hours is not an array or is missing")
        }

        setMarkedDates(marked)
    }

    useEffect(() => {
        getMarkedDatesForMonth()
    }, [])

    const checkHour = (item) => {
        const now = new Date()
        const datePart = selectedDay.date

        const [year, month, day] = datePart.split("-").map(Number)

        if (day === now.getDate() && month === now.getMonth() + 1 && year === now.getFullYear()) {
            const [hour, minute] = item.start_time.split(":").map(Number)

            if (now.getHours() > hour) return false
            else if (now.getHours() === hour) {
                if (now.getMinutes() > minute) return false
            }
        }

        return true
    }

    const checkAppointmentLimit = () => {
        const now = new Date()
        const datePart = formatToDDMMYYYY(selectedDay.date)
        const date = `${selectedDay.dayOfWeek} ${datePart}`

        // Kiểm tra xem fully_booked có tồn tại và là mảng không
        if (schedule?.fully_booked && Array.isArray(schedule.fully_booked)) {
            const filter = schedule.fully_booked.filter((item) => item.date === date)
            // console.log(filter);

            return filter.length > 0
        } else {
            console.log("schedule.fully_booked is not an array or is missing")
            return false // Trả về false nếu dữ liệu không hợp lệ
        }
    }

    const activeHours = () => {
        const appointmentLimitReached = checkAppointmentLimit()
        const hours = schedule.active_hours
            .filter(
                (item) => item.hour_type === "appointment" && item.day === selectedDay.dayOfWeek
            )
            .map((item) => ({
                value: item._id,
                label: `${item.start_time} - ${item.end_time}`,
                start_time: item.start_time,
                end_time: item.end_time,
                status: appointmentLimitReached
                    ? "unavailable"
                    : checkHour(item)
                    ? "available"
                    : "unavailable", // Thêm status
            }))
        return hours
    }

    return (
        <View style={{}}>
            <Calendar
                theme={theme === "light" ? lightTheme : darkTheme}
                style={{ borderRadius: 10 }}
                onDayPress={(date) => {
                    if (markedDates[date.dateString]?.marked) {
                        const dayOfWeek = new Date(date.dateString).toLocaleDateString("en-US", {
                            weekday: "long",
                        })
                        setSelectedDay({
                            ...selectedDay,
                            dayOfWeek: dayOfWeek,
                            date: date.dateString,
                            time: null,
                        })

                        if (setMessage) setMessage(null)
                    } else {
                        setMessage("* Không có lịch khám bệnh cho ngày này")
                    }
                }}
                markedDates={{
                    ...markedDates,
                    [selectedDay.date]: selectedDay.date
                        ? {
                              selected: true,
                              marked: true,
                          }
                        : null,
                }}
            />
            <View style={[{ marginBottom: 5 }, theme !== "light" && { marginHorizontal: 14 }]}>
                <View style={styles.noteContainer}>
                    <View style={[styles.circle, { backgroundColor: COLORS.gray }]} />
                    <Text style={[styles.text, theme === "light" && { color: COLORS.black }]}>
                        Ngày bác sĩ có lịch làm việc
                    </Text>
                </View>
                <View style={styles.noteContainer}>
                    <View style={[styles.circle, { backgroundColor: COLORS.PersianGreen }]} />
                    <Text style={[styles.text, theme === "light" && { color: COLORS.black }]}>
                        Ngày bác sĩ có lịch khám
                    </Text>
                </View>
                <Text
                    style={[
                        styles.text,
                        { marginBottom: 5 },
                        theme === "light" && { color: COLORS.black },
                    ]}>
                    Chọn khung giờ khám
                </Text>
                <View style={{}}>
                    {selectedDay.date !== null ? (
                        <RadioView
                            options={activeHours()} // Gọi hàm activeHours
                            selectedOption={selectedDay.time}
                            onSelect={(val) => {
                                setSelectedDay({ ...selectedDay, time: val })
                            }}
                            textColor={theme === "light" ? COLORS.black : COLORS.white}
                            setMessage={setMessage}
                        />
                    ) : (
                        <Text style={styles.textMessage}>Vui lòng chọn ngày trước</Text>
                    )}
                </View>
            </View>
        </View>
    )
}

export default CalendarCustom

const styles = StyleSheet.create({
    circle: {
        width: 7,
        height: 7,
        borderRadius: 999,
        marginEnd: 6,
    },
    noteContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    text: {
        color: COLORS.white,
        fontSize: 12,
    },
    textMessage: {
        color: COLORS.black,
        fontSize: 12,
        backgroundColor: COLORS.Light20PersianGreen,
        padding: 6,
        borderRadius: 10,
    },
})
