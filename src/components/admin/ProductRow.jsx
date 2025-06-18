import { BsThreeDotsVertical } from "react-icons/bs";
import { FaEdit } from "react-icons/fa";
import { TbListDetails } from "react-icons/tb";
import exampleproduct from "~/assets/loopy.jpg";
// import "../../styles/ProductRow.css"

const ProductRow = ({ data }) => {
  return (
    <div
      className="product-table-cols-name border-bottom-row">
      <p className="flex items-center w-full ml-5 text-sm whitespace-nowrap overflow-hidden">
        <img src={exampleproduct} alt="" className="product-img-admin" />
        <span className="w-[80%] overflow-hidden text-ellipsis">Nguyen Thi Thanh Thao Nguyen Thi Thanh Thao Nguyen Thi Thanh Thao</span>
      </p>
      <p className="order-table-cell">20-09-2024 00:00:00</p>
      <p className="order-table-cell">COD</p>
      <p className="order-table-cell">Đã thanh toán</p>
      <p className="order-table-cell">Đã giao</p>
      <p className="order-table-cell">20.000.000 VND</p>
      <div className="order-table-cell open-expand">
        <BsThreeDotsVertical />
        <ul className="item-dropdown">
          <li>
            <FaEdit size={15} className="mr-2" />
            Chỉnh sửa
          </li>
          <li>
            <TbListDetails size={15} className="mr-2" />
            Xem
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ProductRow;
