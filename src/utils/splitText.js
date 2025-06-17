export const splitText = (text) => {
    const validText = text || ""
    const sections = validText.split(/(?=GIỚI THIỆU|QUÁ TRÌNH CÔNG TÁC|QUÁ TRÌNH HỌC TẬP)/g)

    const result = {
        introduction: "",
        workExperience: "",
        education: "",
    }

    sections.forEach((section) => {
        if (section.startsWith("GIỚI THIỆU")) {
            result.introduction = section.replace("GIỚI THIỆU", "").trim()
        } else if (section.startsWith("QUÁ TRÌNH CÔNG TÁC")) {
            result.workExperience = section.replace("QUÁ TRÌNH CÔNG TÁC", "").trim()
        } else if (section.startsWith("QUÁ TRÌNH HỌC TẬP")) {
            result.education = section.replace("QUÁ TRÌNH HỌC TẬP", "").trim()
        }
    })

    return result
}
