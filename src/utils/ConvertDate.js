import { format, parse } from "date-fns"
import { vi } from "date-fns/locale"

export const formatDate = (dateString) => {
    const date = new Date(dateString)
    const day = date.getDate()
    const month = date.getMonth() + 1 // Tháng bắt đầu từ 0 nên cần +1
    const year = date.getFullYear()

    return `Ngày ${day} tháng ${month} năm ${year}`
}

export const formatAppoinmentDateToNTN = (dateString) => {
    const datePart = dateString.split(" ")[1]
    const date = parse(datePart, "yyyy-MM-dd", new Date())

    if (isNaN(date)) {
        throw new Error("Invalid date format")
    }
    const day = date.getDate()
    const month = date.getMonth() + 1 // Tháng bắt đầu từ 0 nên cần +1
    const year = date.getFullYear()

    return `Ngày ${day} tháng ${month} năm ${year}`
}

export const formatAppoinmentDateToDayOfWeek = (dateString) => {
    const dayOfWeek = dateString.split(" ")[0]
    return translateDayOfWeek(dayOfWeek)
}

export const translateDayOfWeek = (day) => {
    const days = {
        Monday: "Thứ Hai",
        Tuesday: "Thứ Ba",
        Wednesday: "Thứ Tư",
        Thursday: "Thứ Năm",
        Friday: "Thứ Sáu",
        Saturday: "Thứ Bảy",
        Sunday: "Chủ nhật",
    }
    return days[day] || day // Trả về ngày gốc nếu không tìm thấy
}

export const formatToDDMMYYYY = (dateString) => {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, "0") // Đảm bảo có 2 chữ số
    const month = (date.getMonth() + 1).toString().padStart(2, "0") // Tháng bắt đầu từ 0 nên cần +1
    const year = date.getFullYear()

    return `${day}/${month}/${year}`
}

export const formatToHHMMSS = (dateString) => {
    const date = new Date(dateString)

    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    const seconds = String(date.getSeconds()).padStart(2, "0")

    return `${hours}:${minutes}:${seconds}`
}

export const formatToHHMM = (dateString) => {
    const date = new Date(dateString)

    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")

    return `${hours}:${minutes}`
}

export const convertAppointmentDate = (dateString) => {
    const datePart = dateString.split(" ")[1]
    const parsedDate = parse(datePart, "yyyy-MM-dd", new Date())

    if (isNaN(parsedDate)) {
        throw new Error("Invalid date format")
    }
    return format(parsedDate, "eeee, dd/MM/yyyy", { locale: vi })
}

export const parseAppointmentStartDate = (appointment) => {
    const datePart = appointment.appointment_day.split(" ")[1]
    const parsedDate = parse(datePart, "yyyy-MM-dd", new Date())

    const [hour, minute] = appointment.appointment_time_start.split(":").map(Number)
    parsedDate.setHours(hour, minute)

    return parsedDate
}

export const parseAppointmentEndDate = (appointment) => {
    const datePart = appointment.appointment_day.split(" ")[1]
    const parsedDate = parse(datePart, "yyyy-MM-dd", new Date())

    const [hour, minute] = appointment.appointment_time_end.split(":").map(Number)
    parsedDate.setHours(hour, minute)

    return parsedDate
}
