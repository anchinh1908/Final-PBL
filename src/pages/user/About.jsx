import { Container } from "@mui/material"

const About = () => {
    return (
        <div className="bg-white">
            <Container fixed className="py-12 text-gray-800">
                <h1 className="text-4xl font-bold text-center mb-6 text-oceanSlate">
                    Giới thiệu về DNTrip
                </h1>

                <p className="text-lg mb-8 text-center">
                    DNTrip là nền tảng ứng dụng trí tuệ nhân tạo (AI) giúp bạn cá nhân hóa
                    trải nghiệm du lịch – từ lựa chọn khách sạn, địa điểm tham quan đến lịch trình
                    tối ưu, phù hợp nhất với sở thích và điều kiện của bạn.
                </p>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mb-2">🎯 Sứ mệnh của DNTrip</h2>
                    <p className="leading-relaxed">
                        <strong>
                            “Tại DNTrip, chúng tôi tin rằng mỗi chuyến đi đều là một hành
                            trình riêng biệt,
                        </strong>{" "}
                        phản ánh cá tính, nhu cầu và cảm xúc của từng người.” Với sứ mệnh kiến tạo
                        một nền tảng du lịch thông minh, DNTrip sử dụng sức mạnh của trí tuệ
                        nhân tạo để giúp người dùng thiết kế hành trình du lịch hoàn toàn cá nhân
                        hóa – không còn phụ thuộc vào các tour đại trà hay lựa chọn rập khuôn.
                    </p>

                    <p className="leading-relaxed">
                        Chúng tôi không đơn thuần là một nền tảng đặt khách sạn hay tìm kiếm địa
                        điểm. <strong>DNTrip là người bạn đồng hành kỹ thuật số,</strong>{" "}
                        hiểu rõ bạn qua từng lượt tìm kiếm, mỗi điểm dừng chân và cả những sở thích
                        tưởng chừng rất riêng tư – từ kiểu phòng bạn thích, loại địa điểm bạn quan
                        tâm đến thói quen ăn uống, thời gian du lịch và ngân sách mong muốn.
                    </p>

                    <p className="leading-relaxed">
                        Thông qua việc phân tích dữ liệu người dùng, hành vi truy cập và xu hướng du
                        lịch toàn cầu,{" "}
                        <strong>
                            DNTrip hướng tới một mục tiêu lớn hơn: tái định nghĩa trải
                            nghiệm lên kế hoạch du lịch.
                        </strong>{" "}
                        Với hệ thống gợi ý lịch trình thông minh, DNTrip giúp bạn tiết kiệm
                        thời gian, tối ưu ngân sách, và tận hưởng trọn vẹn chuyến đi mà không phải
                        lo lắng quá nhiều trong khâu chuẩn bị.
                    </p>

                    <p className="leading-relaxed">
                        <strong>
                            Chúng tôi mong muốn làm cầu nối giữa công nghệ hiện đại và khát khao
                            khám phá của con người.
                        </strong>{" "}
                        DNTrip không chỉ giúp bạn đi đến những nơi mới – mà còn đưa bạn đến
                        gần hơn với những trải nghiệm thực sự phù hợp, đáng nhớ và giàu cảm xúc.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mb-2">🤖 Công nghệ AI phía sau</h2>
                    <p className="mb-2">
                        DNTrip tích hợp các mô hình học máy và phân tích hành vi để hiểu bạn
                        hơn sau mỗi lần sử dụng. Cụ thể:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Phân tích lịch sử tìm kiếm, đặt phòng và lượt xem của bạn.</li>
                        <li>
                            Xử lý thông tin vị trí, thời gian du lịch, ngân sách và loại hình ưa
                            thích.
                        </li>
                        <li>
                            Đưa ra đề xuất khách sạn, điểm đến và lịch trình theo thời tiết, mật độ
                            du khách và khoảng cách.
                        </li>
                        <li>
                            Luôn cập nhật dữ liệu mới từ cộng đồng và xu hướng du lịch toàn cầu.
                        </li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mb-2">🚀 Lợi ích bạn nhận được</h2>
                    <ul className="list-disc list-inside space-y-1">
                        <li>
                            <strong>Tiết kiệm thời gian:</strong> Không cần tra cứu hàng giờ để chọn
                            khách sạn hay điểm tham quan.
                        </li>
                        <li>
                            <strong>Phù hợp cá nhân:</strong> Mỗi đề xuất là duy nhất, dành riêng
                            cho bạn.
                        </li>
                        <li>
                            <strong>Trải nghiệm mượt mà:</strong> Giao diện thân thiện, dễ dùng cho
                            mọi đối tượng.
                        </li>
                        <li>
                            <strong>Gợi ý thông minh:</strong> Lên lịch trình linh hoạt sáng – trưa
                            – tối, phù hợp với điều kiện thực tế.
                        </li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mb-2">👥 Dành cho ai?</h2>
                    <p className="mb-2">DNTrip phù hợp với mọi đối tượng:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Du khách cá nhân muốn tự khám phá và kiểm soát chuyến đi.</li>
                        <li>Gia đình và nhóm bạn cần một kế hoạch hợp lý cho nhiều người.</li>
                        <li>Người mới đi du lịch lần đầu chưa có kinh nghiệm.</li>
                        <li>Người bận rộn muốn có lịch trình thông minh trong vài phút.</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mb-2">💡 Tính năng nổi bật</h2>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Gợi ý khách sạn phù hợp với ngân sách và phong cách cá nhân.</li>
                        <li>
                            Phân tích điểm đến và đề xuất theo sở thích (biển, núi, văn hóa, ẩm
                            thực,...).
                        </li>
                        <li>Lên lịch trình thông minh với thứ tự di chuyển hợp lý.</li>
                        <li>Tích hợp đánh giá, ảnh thực tế và thời gian mở cửa.</li>
                        <li>Giao diện trực quan và AI chatbot tư vấn hành trình (sắp ra mắt).</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-2xl font-semibold mb-2">🌱 Cam kết phát triển</h2>
                    <p>
                        DNTrip cam kết không ngừng cập nhật công nghệ, cải thiện thuật toán
                        và mở rộng cơ sở dữ liệu điểm đến, để mỗi chuyến đi của bạn trở nên thuận
                        tiện, an toàn và đáng nhớ hơn. Trong tương lai gần, chúng tôi sẽ tích hợp:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Gợi ý phương tiện di chuyển phù hợp giữa các điểm.</li>
                        <li>Dự báo tình trạng thời tiết, mật độ khách du lịch theo ngày.</li>
                        <li>Hệ thống đánh giá thông minh bằng AI.</li>
                        <li>Chế độ du lịch &ldquo;không cần suy nghĩ&rdquo; – mọi thứ AI lo!</li>
                    </ul>
                </section>

                <section className="text-center mt-12">
                    <h2 className="text-3xl font-bold text-blue-500 mb-4">
                        ✈️ Sẵn sàng cho hành trình du lịch thông minh?
                    </h2>
                    <p className="text-lg mb-4">
                        Khám phá thế giới theo cách của riêng bạn cùng với DNTrip – nền tảng
                        du lịch AI đầu tiên tại Việt Nam mang đến hành trình tối ưu nhất cho bạn.
                    </p>
                    <a
                        href="/"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full transition duration-300">
                        Khám phá ngay
                    </a>
                </section>
            </Container>
        </div>
    )
}

export default About
