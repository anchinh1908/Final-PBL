export const calculateAverageReviewScore = (reviews) => {
    const values = Object.values(reviews)
    if (values.length === 0) return 0

    const total = values.reduce((sum, score) => sum + score, 0)
    return (total / values.length).toFixed(1)
}

export const splitParagraphBySentence = (paragraph) => {
    return paragraph
        .split(/(?<=[.!?])\s+/)
        .map((sentence) => sentence.trim())
        .filter(Boolean)
}

export const isDiscounted = (originalPrice, price) => {
    return originalPrice - price > 0
}

export const splitIntoColumns = (roomServices, columnCount = 3) => {
    // Bước 1: Tính tổng số giá trị
    const totalValues = Object.values(roomServices).reduce(
        (total, section) => total + section.length,
        0
    )

    const totalKeys = Object.keys(roomServices).length
    const total = totalValues + totalKeys

    // console.log("Tổng số giá trị:", totalValues) // 151

    // Bước 2: Chia đều cho 3 cột
    const valuesPerColumn = Math.ceil(total / columnCount)

    // Bước 3: Xác định điểm cắt
    const sections = Object.entries(roomServices)
    let accumulatedValues = 0
    const columnBreaks = []

    for (let i = 0; i < sections.length; i++) {
        const sectionValues = sections[i][1].length + 1 // Số giá trị trong section hiện tại
        accumulatedValues += sectionValues

        // Nếu tổng số giá trị tích lũy vượt qua ngưỡng của cột hiện tại
        if (accumulatedValues >= valuesPerColumn * (columnBreaks.length + 1)) {
            columnBreaks.push(i) // Đánh dấu điểm cắt (index + 1)
        }

        // Dừng khi đã tìm đủ điểm cắt cho 2 cột (cột thứ 3 sẽ lấy phần còn lại)
        if (columnBreaks.length === columnCount - 1) break
    }

    // Bước 4: Phân chia sections thành 3 cột dựa trên điểm cắt
    const columns = []
    let start = 0

    for (let i = 0; i < columnCount; i++) {
        const end = i < columnBreaks.length ? columnBreaks[i] : sections.length
        columns.push(sections.slice(start, end))
        start = end
    }

    return columns
}

export const addViewedHotel = (hotelid) => {
    const history = JSON.parse(localStorage.getItem("viewed_hotels")) || []
    const newHistory = [hotelid, ...history.filter((h) => h !== hotelid)]
    localStorage.setItem("viewed_hotels", JSON.stringify(newHistory))
}

export const splitName = (name) => {
    const [first, ...rest] = name.trim().split(/\s+/)
    return [first, rest.join(" ")]
}
