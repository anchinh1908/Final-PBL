import { Link } from "react-router-dom"
import { HOME } from "~/constants/routes"

const NotFound = () => {
    return (
        <div style={{ textAlign: "center", padding: "50px" }}>
            <h1>404 - Trang không tồn tại</h1>
            <p>Xin lỗi, trang bạn đang tìm kiếm không được tìm thấy.</p>
            <Link to={HOME}>
                <button
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                    }}>
                    Quay về trang chủ
                </button>
            </Link>
        </div>
    )
}

export default NotFound
