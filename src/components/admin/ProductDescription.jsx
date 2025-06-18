import { Rating } from "@mui/material"
import PropTypes from "prop-types"
import { useState } from "react"

const ProductDescription = ({ product, availableProduct }) => {
    const [selectedColor, setSelectedColor] = useState(0)

    return (
        <div>
            <h2 className="product-name">{product.name}</h2>

            <div className="flex items-center">
                <h2 className="title-content mr-10">
                    Đã bán:{" "}
                    {product.colors.reduce((total, color) => total + color.sold_quantity, 0)}
                </h2>

                <h2 className="border-l-2 px-2">Đánh giá: </h2>

                <Rating name="simple-controlled" value={2.5} precision={0.5} readOnly />
            </div>

            <div className="flex items-center border-b">
                <h2 className="title-content">Số lượng trong kho: {availableProduct}</h2>

                <span className={availableProduct > 0 ? "instock-tag" : "outofstock-tag"}>
                    {availableProduct > 0 ? "Còn hàng" : "Đã hết hàng"}
                </span>
            </div>

            <div className="border-b flex items-center">
                <h2 className="title-content mr-3">Thương hiệu:</h2>
                {product.brand_id.logo ? (
                    <img
                        className="h-8 my-2"
                        src={product.brand_id.logo}
                        alt={product.brand_id.name}
                    />
                ) : (
                    <h2 className="my-2">{product.brand_id.name}</h2>
                )}
            </div>

            <h2 className="title-content">Màu sắc</h2>
            <div className="flex gap-4 mb-3">
                {product.colors.map((color, index) => (
                    <p
                        key={color._id}
                        className={selectedColor === index ? "selected-color-item" : "color-item"}
                        onClick={() => setSelectedColor(index)}>
                        {color.color || "No color"}
                    </p>
                ))}
            </div>

            <div className="flex items-center pb-2 border-b">
                <p className="discount-price">
                    {product.colors[selectedColor].discount_price.toLocaleString("vi-VN")} ₫
                </p>

                <p className="original-price">
                    {product.colors[selectedColor].original_price.toLocaleString("vi-VN")} ₫
                </p>

                <p className="amount-saved">
                    Tiết kiệm được{" "}
                    {product.colors[selectedColor].original_price -
                        product.colors[selectedColor].discount_price}{" "}
                    ₫
                </p>
            </div>

            <div>Quà tặng khuyến mãi</div>
        </div>
    )
}

ProductDescription.propTypes = {
    product: PropTypes.object.isRequired,
    availableProduct: PropTypes.number.isRequired,
}

export default ProductDescription
