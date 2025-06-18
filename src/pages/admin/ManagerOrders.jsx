// import { useState } from "react"
// import { FaTruck, FaMoneyCheck, FaEdit } from "react-icons/fa"
// import { FaBasketShopping } from "react-icons/fa6"
// import { BsFillCartXFill, BsThreeDotsVertical } from "react-icons/bs"
// import { MdConfirmationNumber } from "react-icons/md"
// import "~/styles/ManagerOrders.css"
// import {
//     Checkbox,
//     IconButton,
//     Pagination,
//     Table,
//     TableBody,
//     TableCell,
//     TableContainer,
//     TableHead,
//     TableRow,
//     Tooltip,
// } from "@mui/material"
// import { TbListDetails } from "react-icons/tb"
// import DeleteIcon from "@mui/icons-material/Delete"
// import SearchIcon from "@mui/icons-material/Search"
// import { useNavigate, useSearchParams } from "react-router-dom"
// import { getAdminProductParams } from "~/utils/queryParamsHelper"
// import { DateRangePicker } from "rsuite"
// import "rsuite/DateRangePicker/styles/index.css"
// import { format } from "date-fns"

// const ManagerOrders = () => {
//     const [searchParams] = useSearchParams()
//     const navigate = useNavigate()

//     const [totalAllOrder, setTotalAllOrder] = useState(0)
//     const [totalPending, setTotalPending] = useState(0)
//     const [totalInTransit, setTotalInTransit] = useState(0)
//     const [totalPaying, setTotalPaying] = useState(0)
//     const [totalCancelled, setTotalCancelled] = useState(0)

//     const [startDate, setStartDate] = useState(null)
//     const [endDate, setEndDate] = useState(null)
//     const [dateValue, setDateValue] = useState([])

//     const [cartSelected, setCartSelected] = useState("All")
//     const [searchInput, setSearchInput] = useState(searchParams.get("key") || "")
//     const [page, setPage] = useState(parseInt(searchParams.get("page") || 1, 10))

//     const options = [
//         { label: "Tất cả", value: "All" },
//         { label: "Chờ xác nhận", value: "Pending" },
//         { label: "Đang đóng gói", value: "Packing" },
//         { label: "Đang vận chuyển", value: "InTransit" },
//         { label: "Đã giao hàng", value: "Delivered" },
//         { label: "Đã huỷ", value: "Cancelled" },
//     ]

//     const handlePageChange = (event, value) => {
//         const newLocation = getAdminProductParams(value, 10, searchInput)
//         setPage(value)
//         navigate(newLocation)
//     }

//     const [selectedRows, setSelectedRows] = useState([])

//     const handleCheckboxChange = (rowIndex) => {
//         setSelectedRows((prev) =>
//             prev.includes(rowIndex)
//                 ? prev.filter((index) => index !== rowIndex)
//                 : [...prev, rowIndex]
//         )
//     }

//     const handleSearch = () => {
//         const newLocation = getAdminProductParams(page, rowsPerPage, searchInput)
//         navigate(newLocation)
//     }

//     const handleSelectedDate = (value) => {
//         setDateValue(value)
//     }

//     const fakeData = [
//         {
//             customer: "Nguyễn Văn A",
//             orderDate: "2024-12-25",
//             paymentMethod: "Chuyển khoản",
//             paymentStatus: "Đã thanh toán",
//             orderStatus: "Đang xử lý",
//             totalAmount: "5,000,000 VND",
//         },
//         {
//             customer: "Trần Thị B",
//             orderDate: "2024-12-24",
//             paymentMethod: "Tiền mặt",
//             paymentStatus: "Chưa thanh toán",
//             orderStatus: "Đã giao hàng",
//             totalAmount: "2,500,000 VND",
//         },
//         {
//             customer: "Phạm Văn C",
//             orderDate: "2024-12-23",
//             paymentMethod: "Momo",
//             paymentStatus: "Đã thanh toán",
//             orderStatus: "Đang giao hàng",
//             totalAmount: "1,200,000 VND",
//         },
//         {
//             customer: "Lê Thị D",
//             orderDate: "2024-12-22",
//             paymentMethod: "ZaloPay",
//             paymentStatus: "Chưa thanh toán",
//             orderStatus: "Hủy đơn hàng",
//             totalAmount: "3,000,000 VND",
//         },
//         {
//             customer: "Vũ Văn E",
//             orderDate: "2024-12-21",
//             paymentMethod: "Thẻ tín dụng",
//             paymentStatus: "Đã thanh toán",
//             orderStatus: "Đã giao hàng",
//             totalAmount: "6,000,000 VND",
//         },
//     ]

//     return (
//         <div className="mx-[5%]">
//             <div className="orders-box px-[5%]">
//                 <div className="orders-box-item">
//                     <div className="item-icon bg-blue-200">
//                         <FaBasketShopping className="text-blue-600 size-[50%]" />
//                     </div>
//                     <p className="box-item-title">Tổng đơn hàng</p>
//                     <h1 className="box-item-number">{totalAllOrder}</h1>
//                 </div>

//                 <div className="orders-box-item">
//                     <div className="item-icon bg-orange-200">
//                         <MdConfirmationNumber className="text-orange-600 size-[50%]" />
//                     </div>
//                     <p className="box-item-title">Chờ xác nhận</p>
//                     <h1 className="box-item-number">{totalPending}</h1>
//                 </div>

//                 <div className="orders-box-item">
//                     <div className="item-icon bg-green-200">
//                         <FaTruck className="text-green-600 size-[50%]" />
//                     </div>
//                     <p className="box-item-title">Đang vận chuyển</p>
//                     <h1 className="box-item-number">{totalInTransit}</h1>
//                 </div>

//                 <div className="orders-box-item">
//                     <div className="item-icon bg-pink-200">
//                         <FaMoneyCheck className="text-pink-600 size-[50%]" />
//                     </div>
//                     <p className="box-item-title">Chờ thanh toán</p>
//                     <h1 className="box-item-number">{totalPaying}</h1>
//                 </div>

//                 <div className="orders-box-item">
//                     <div className="item-icon bg-red-200">
//                         <BsFillCartXFill className="text-red-600 size-[50%]" />
//                     </div>
//                     <p className="box-item-title">Đơn hàng đã huỷ</p>
//                     <h1 className="box-item-number">{totalCancelled}</h1>
//                 </div>
//             </div>

//             <div className="mt-8 flex justify-end">
//                 <DateRangePicker
//                     placement="bottomEnd"
//                     value={dateValue}
//                     onChange={(value) => handleSelectedDate(value)}
//                 />
//             </div>

//             <div className="flex items-end">
//                 {options.map((option) => (
//                     <div
//                         key={option.value}
//                         onClick={() => setCartSelected(option.value)}
//                         className={`cart-option ${
//                             option.value === cartSelected
//                                 ? "border-persianGreen font-bold text-lg"
//                                 : "border-persianGreen/10 text-black/60 text-base"
//                         }`}>
//                         {option.label}
//                     </div>
//                 ))}
//             </div>

//             <TableContainer className="bg-white no-padding-shadow-box-hover mt-1.5">
//                 {selectedRows.length > 0 ? (
//                     <div className="table-header h-20 bg-persianGreen/20">
//                         <p>Đã chọn: {selectedRows.length} đơn hàng</p>
//                         <Tooltip title="Delete">
//                             <IconButton>
//                                 <DeleteIcon />
//                             </IconButton>
//                         </Tooltip>
//                     </div>
//                 ) : (
//                     <div className="table-header h-16 mt-4">
//                         <div className="custom-search">
//                             <input
//                                 placeholder="Search"
//                                 value={searchInput}
//                                 onChange={(event) => setSearchInput(event.target.value)}
//                             />
//                             <button
//                                 onClick={() => {
//                                     handleSearch()
//                                 }}
//                                 className="search-button">
//                                 <SearchIcon sx={{ color: "#ffffff" }} />
//                             </button>
//                         </div>
//                     </div>
//                 )}
//                 <Table aria-label="simple table" size="small">
//                     <TableHead>
//                         <TableRow style={{ height: 65 }}>
//                             <TableCell sx={{ width: "5%" }}>
//                                 <Checkbox
//                                     indeterminate={
//                                         selectedRows.length > 0 &&
//                                         selectedRows.length < fakeData.length
//                                     }
//                                     checked={selectedRows.length === fakeData.length}
//                                     onChange={(e) => {
//                                         if (e.target.checked) {
//                                             setSelectedRows(fakeData.map((_, index) => index))
//                                         } else {
//                                             setSelectedRows([])
//                                         }
//                                     }}
//                                 />
//                             </TableCell>
//                             <TableCell sx={{ width: "5%" }}>STT</TableCell>
//                             <TableCell sx={{ width: "20%" }}>Khách hàng</TableCell>
//                             <TableCell align="right" sx={{ width: "13%" }}>
//                                 Ngày đặt
//                             </TableCell>
//                             <TableCell align="right" sx={{ width: "13%" }}>
//                                 Phương thức thanh toán
//                             </TableCell>
//                             <TableCell align="right" sx={{ width: "13%" }}>
//                                 Tình trạng thanh toán
//                             </TableCell>
//                             <TableCell align="right" sx={{ width: "13%" }}>
//                                 Tình trạng đơn hàng
//                             </TableCell>
//                             <TableCell align="right" sx={{ width: "13%" }}>
//                                 Tổng tiền
//                             </TableCell>
//                             <TableCell align="right" sx={{ width: "5%" }}>
//                                 Action
//                             </TableCell>
//                         </TableRow>
//                     </TableHead>

//                     <TableBody>
//                         {fakeData.map((row, index) => (
//                             <TableRow
//                                 key={index}
//                                 style={{ height: 65 }}
//                                 className="table-row"
//                                 onClick={() => {}}>
//                                 <TableCell>
//                                     <Checkbox
//                                         checked={selectedRows.includes(index)}
//                                         onChange={() => handleCheckboxChange(index)}
//                                     />
//                                 </TableCell>
//                                 <TableCell align="center">{(index + 1) * page}</TableCell>
//                                 <TableCell component="th" scope="row">
//                                     {row.customer}
//                                 </TableCell>
//                                 <TableCell align="right">{row.orderDate}</TableCell>
//                                 <TableCell align="right">{row.paymentMethod}</TableCell>
//                                 <TableCell align="right">{row.paymentStatus}</TableCell>
//                                 <TableCell align="right">{row.orderStatus}</TableCell>
//                                 <TableCell align="right">{row.totalAmount}</TableCell>
//                                 <TableCell align="right">
//                                     <div className="open-expand">
//                                         <BsThreeDotsVertical />
//                                         <ul className="item-dropdown">
//                                             <li>
//                                                 <FaEdit size={15} className="mr-2" />
//                                                 Chỉnh sửa
//                                             </li>
//                                             <li>
//                                                 <TbListDetails size={15} className="mr-2" />
//                                                 Xem
//                                             </li>
//                                         </ul>
//                                     </div>
//                                 </TableCell>
//                             </TableRow>
//                         ))}
//                     </TableBody>
//                 </Table>

//                 <div className="flex justify-center my-5">
//                     <Pagination count={6} color="primary" page={page} onChange={handlePageChange} />
//                 </div>
//             </TableContainer>
//         </div>
//     )
// }

// export default ManagerOrders
