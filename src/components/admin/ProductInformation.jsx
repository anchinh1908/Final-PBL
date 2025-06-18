import PropTypes from "prop-types"

const ProductInformation = ({ product }) => {
    return (
        <div className="mr-5">
            <h1>Thông số kĩ thuật</h1>

            <p className="infor-title">Bộ xử lý</p>
            <div className="infor-table">
                <div className="infor-row bg-rowTable rounded-t-lg">
                    <p className="flex-1">Công nghệ CPU</p>
                    <p className="flex-1">{product.processor.technology}</p>
                </div>
                <div className="infor-row">
                    <p className="flex-1">Số nhân</p>
                    <p className="flex-1">{product.processor.cores}</p>
                </div>
                <div className="infor-row bg-rowTable">
                    <p className="flex-1">Số luồng</p>
                    <p className="flex-1">{product.processor.threads}</p>
                </div>
                <div className="infor-row">
                    <p className="flex-1">Tốc độ CPU</p>
                    <p className="flex-1">{product.processor.base_speed}</p>
                </div>
                <div className="infor-row bg-rowTable">
                    <p className="flex-1">Tốc độ tối đa</p>
                    <p className="flex-1">{product.processor.max_speed}</p>
                </div>
                <div className="infor-row">
                    <p className="flex-1">Bộ nhớ đệm</p>
                    <p className="flex-1">{product.processor.cache}</p>
                </div>
            </div>

            <p className="infor-title">Ram, Ổ cứng</p>
            <div className="infor-table">
                <div className="infor-row bg-rowTable rounded-t-lg">
                    <p className="flex-1">RAM</p>
                    <p className="flex-1">{product.ram.size}</p>
                </div>
                <div className="infor-row">
                    <p className="flex-1">Loại RAM</p>
                    <p className="flex-1">{product.ram.type}</p>
                </div>
                <div className="infor-row bg-rowTable">
                    <p className="flex-1">Tốc độ Bus</p>
                    <p className="flex-1">{product.ram.bus_speed}</p>
                </div>
                <div className="infor-row">
                    <p className="flex-1">Hỗ trợ RAM tối đa</p>
                    <p className="flex-1">{product.ram.max_support}</p>
                </div>
                <div className="infor-row bg-rowTable rounded-b-lg">
                    <p className="flex-1">Ổ cứng</p>
                    <p className="flex-1">{product.storage}</p>
                </div>
            </div>

            <p className="infor-title">Màn hình</p>
            <div className="infor-table">
                <div className="infor-row bg-rowTable rounded-t-lg">
                    <p className="flex-1">Kích thước</p>
                    <p className="flex-1">{product.screen.size} inch</p>
                </div>
                <div className="infor-row">
                    <p className="flex-1">Chất liệu tấm nền</p>
                    <p className="flex-1">{product.screen.panel_type}</p>
                </div>
                <div className="infor-row bg-rowTable">
                    <p className="flex-1">Tần số quét</p>
                    <p className="flex-1">{product.screen.refresh_rate}</p>
                </div>
                <div className="infor-row">
                    <p className="flex-1">Độ phân giải</p>
                    <p className="flex-1">{product.screen.resolution}</p>
                </div>
                <div className="infor-row bg-rowTable rounded-b-lg">
                    <p className="flex-1">Công nghệ màn hình</p>
                    <p className="flex-1">{product.screen.technology}</p>
                </div>
            </div>

            <p className="infor-title">Thông tin kỹ thuật khác</p>
            <div className="infor-table">
                <div className="infor-row bg-rowTable rounded-t-lg">
                    <p className="flex-1">Pin</p>
                    <p className="flex-1">{product.battery}</p>
                </div>
                <div className="infor-row">
                    <p className="flex-1">Hệ điều hành</p>
                    <p className="flex-1">{product.operating_system}</p>
                </div>
                <div className="infor-row bg-rowTable">
                    <p className="flex-1">Bảo hành</p>
                    <p className="flex-1">{product.warranty}</p>
                </div>
                <div className="infor-row">
                    <p className="flex-1">Card đồ hoạ</p>
                    <p className="flex-1">{product.graphic_card}</p>
                </div>
                <div className="infor-row bg-rowTable">
                    <p className="flex-1">Khối lượng</p>
                    <p className="flex-1">{product.weight} kg</p>
                </div>
                <div className="infor-row">
                    <p className="flex-1">Kích thước</p>
                    <p className="flex-1">
                        {product.dimensions.length_screen} cm x {product.dimensions.width_screen} cm
                        x {product.dimensions.thinkness_screen} cm
                    </p>
                </div>
                <div className="infor-row bg-rowTable rounded-b-lg">
                    <p className="flex-1">Cổng giao tiếp</p>
                    <p className="flex-1">{product.ports.join(", ")}</p>
                </div>
            </div>
        </div>
    )
}

ProductInformation.propTypes = {
    product: PropTypes.object.isRequired,
}

export default ProductInformation
