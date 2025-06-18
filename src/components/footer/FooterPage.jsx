import { Container } from "@mui/material"
import logo from "~/assets/logoHotel.png"

const FooterPage = () => {
    return (
        <div className="border-t border-[#d9d9d9] ">
            <Container fixed className="pb-20 bg-white flex flex-wrap gap-4 overflow-hidden">
                <img src={logo} alt="logo" className="flex-1 h-[6.5rem] w-40 mt-2" />
                {[
                    {
                        title: "Khám phá thêm",
                        items: [
                            "Chương trình khách hàng thân thiết Genius",
                            "Ưu đãi theo mùa và dịp lễ",
                            "Bài viết về du lịch",
                            "Traveller Review Awards",
                            "Cho thuê xe hơi",
                            "Booking.com dành cho Đại Lý Du Lịch",
                            "Team collaboration",
                        ],
                    },
                    {
                        title: "Điều khoản và cài đặt",
                        items: [
                            "Bảo mật & Cookie",
                            "Điều khoản và điều kiện",
                            "Tranh chấp đối tác",
                            "Chính sách về Quyền con người",
                            "Collaboration features",
                            "Design process",
                        ],
                    },
                    {
                        title: "Về chúng tôi",
                        items: [
                            "Về DNTrip",
                            "Chúng tôi hoạt động như thế nào",
                            "Du lịch bền vững",
                            "Truyền thông",
                            "Liên hệ công ty",
                            "Developers",
                        ],
                    },
                ].map((col, index) => (
                    <div key={index} className="flex pt-8 flex-1 flex-col gap-4">
                        <h3 className="text-base font-semibold text-slateGray">{col.title}</h3>
                        {col.items.map((item, i) => (
                            <p key={i} className="text-base text-slateGray leading-snug">
                                {item}
                            </p>
                        ))}
                    </div>
                ))}
            </Container>
        </div>
    )
}

export default FooterPage
