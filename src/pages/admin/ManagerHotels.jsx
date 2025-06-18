import { useEffect, useState } from "react"
import { BiBookAdd, BiExport } from "react-icons/bi"
import "~/styles/ManagerProducts.css"
import {
    Checkbox,
    IconButton,
    Pagination,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
} from "@mui/material"
import { BsThreeDotsVertical } from "react-icons/bs"
import { FaEdit } from "react-icons/fa"
import { TbListDetails } from "react-icons/tb"
import exampleproduct from "~/assets/loopy.png"
import FilterListIcon from "@mui/icons-material/FilterList"
import DeleteIcon from "@mui/icons-material/Delete"
import SearchIcon from "@mui/icons-material/Search"
import { useNavigate, useSearchParams } from "react-router-dom"
import { getAdminProductParams } from "~/utils/queryParamsHelper"
import { ADMIN_ADD_HOTEL, ADMIN_UPDATE_HOTEL } from "~/constants/routes"
import ViewProduct from "~/pages/admin/ViewProduct"
import { delete_Hotels, get_All_Hotels, search_Hotels } from "~/services/HotelService"
import { calculateAverageReviewScore } from "~/utils/uiHelper"
import Notification from "~/components/common/Notification"
import { RotatingLines } from "react-loader-spinner"

const ManagerHotels = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const [searchInput, setSearchInput] = useState(searchParams.get("key") || "")

    const [rowsPerPage, setRowsPerPage] = useState(
        parseInt(searchParams.get("rowsPerPage") || 15, 10)
    )
    const [page, setPage] = useState(parseInt(searchParams.get("page") || 1, 10))

    const [productList, setProductList] = useState([])
    const [totalPages, setTotalPages] = useState(0)

    const [openModal, setOpenModal] = useState(false)
    const [productId, setProductId] = useState("")

    const [loading, setLoading] = useState(false)
    const [notification, setNotification] = useState(null)

    const getProducts = async (page, limit, key) => {
        try {
            if (key) {
                const token = localStorage.getItem("token")
                if (token) {
                    const products = await search_Hotels(token, page, limit, key)
                    const hotels = products.hotels.map((h) => ({ hotel: h }))

                    setProductList(hotels)
                    setTotalPages(products.totalPages)
                }
            } else {
                const products = await get_All_Hotels(page, limit, key)
                setProductList(products.data)
                setTotalPages(products.totalPages)
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        getProducts(page, rowsPerPage, searchInput)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, rowsPerPage])

    const handleRowsPerPage = (event) => {
        const newLocation = getAdminProductParams(1, event.target.value, searchInput)
        setPage(1)
        setRowsPerPage(event.target.value)
        navigate(newLocation)
    }

    const handlePageChange = (event, value) => {
        event.preventDefault()

        const newLocation = getAdminProductParams(value, rowsPerPage, searchInput)
        setPage(value)
        navigate(newLocation)
    }

    const handleSearch = async () => {
        const newLocation = getAdminProductParams(page, rowsPerPage, searchInput)
        navigate(newLocation)
        await getProducts(page, rowsPerPage, searchInput)
    }

    const [selectedRows, setSelectedRows] = useState([])

    const handleCheckboxChange = (rowIndex) => {
        setSelectedRows((prev) =>
            prev.includes(rowIndex)
                ? prev.filter((index) => index !== rowIndex)
                : [...prev, rowIndex]
        )
    }

    const handleUpdate = (productId) => {
        navigate(ADMIN_UPDATE_HOTEL, { state: { productId } })
    }

    const handleDeleteHotels = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem("token")

            const result = await delete_Hotels(token, selectedRows)
            if (result) {
                setNotification({
                    type: "success",
                    message: "Đã xoá các khách sạn được chọn thành công.",
                })
                setPage(1)
                setSelectedRows([])
            }
        } catch (error) {
            setNotification({
                type: "error",
                message: error.message || "Không thể xoá các khách sạn đã chọn.",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mx-[5%]">
            <div className="flex items-center justify-end my-3">
                <p className="mr-3">Showing</p>
                <div className="mr-3">
                    <select
                        className="select-showing shadow-md"
                        id="numberDropdown"
                        value={rowsPerPage}
                        onChange={handleRowsPerPage}>
                        {[15, 20, 25, 30].map((number) => (
                            <option key={number} value={number} className="option-showing">
                                {number}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-button shadow-md">
                    <BiExport className="mr-1" />
                    Export
                </div>

                <div
                    className="add-product-button rounded-md"
                    onClick={() => navigate(ADMIN_ADD_HOTEL)}>
                    <BiBookAdd className="mr-2 size-5" />
                    Thêm khách sạn mới
                </div>
            </div>

            <TableContainer className="bg-white no-padding-shadow-box-hover mt-6">
                {selectedRows.length > 0 ? (
                    <div className="table-header h-20 bg-persianGreen/20">
                        <p>Đã chọn: {selectedRows.length} khách sạn</p>
                        <Tooltip title="Delete">
                            <IconButton onClick={() => handleDeleteHotels()}>
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </div>
                ) : (
                    <div className="table-header h-16 mt-4">
                        <div className="custom-search">
                            <input
                                placeholder="Search"
                                value={searchInput}
                                onChange={(event) => setSearchInput(event.target.value)}
                            />
                            <button
                                onClick={() => {
                                    handleSearch()
                                }}
                                className="search-button">
                                <SearchIcon sx={{ color: "#ffffff" }} />
                            </button>
                        </div>
                        <Tooltip title="Filter">
                            <IconButton>
                                <FilterListIcon />
                            </IconButton>
                        </Tooltip>
                    </div>
                )}
                <Table aria-label="simple table" size="small">
                    <TableHead>
                        <TableRow style={{ height: 65 }}>
                            <TableCell sx={{ width: "5%" }}>
                                <Checkbox
                                    size="small"
                                    indeterminate={
                                        selectedRows.length > 0 &&
                                        selectedRows.length < productList.length
                                    }
                                    checked={selectedRows.length === productList.length}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedRows(
                                                productList.map((product) => product.hotel.id)
                                            )
                                        } else {
                                            setSelectedRows([])
                                        }
                                    }}
                                />
                            </TableCell>
                            <TableCell sx={{ width: "25%" }}>Khách sạn</TableCell>
                            <TableCell align="right" sx={{ width: "20%" }}>
                                Địa chỉ
                            </TableCell>
                            <TableCell align="right" sx={{ width: "10%" }}>
                                Chất lượng
                            </TableCell>
                            <TableCell align="right" sx={{ width: "25%" }}>
                                Tiện nghi
                            </TableCell>
                            <TableCell align="right" sx={{ width: "10%" }}>
                                Đánh giá
                            </TableCell>
                            <TableCell align="right" sx={{ width: "5%" }}>
                                Action
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {productList.map((row) => (
                            <TableRow
                                key={row.hotel.id}
                                style={{ height: 65 }}
                                className={`table-row ${
                                    selectedRows.includes(row.hotel.id) && "selected-table-row"
                                }`}>
                                <TableCell>
                                    <Checkbox
                                        size="small"
                                        checked={selectedRows.includes(row.hotel.id)}
                                        onChange={() => handleCheckboxChange(row.hotel.id)}
                                    />
                                </TableCell>
                                <TableCell component="th" scope="row">
                                    <p className="flex items-center w-full">
                                        <img
                                            src={row?.hotel?.imageUrls?.[0] || exampleproduct}
                                            alt=""
                                            className="product-img-admin"
                                        />
                                        <span className="line-clamp-2">{row.hotel.name}</span>
                                    </p>
                                </TableCell>
                                <TableCell align="right">{row.hotel.address}</TableCell>
                                <TableCell align="right">
                                    {row.hotel.ratingStars ? row.hotel.ratingStars + " ⭐" : ""}
                                </TableCell>
                                <TableCell align="right">
                                    <p className="line-clamp-2">
                                        {row?.hotel?.facilities?.join(", ")}
                                    </p>
                                </TableCell>
                                <TableCell align="right">
                                    {calculateAverageReviewScore(row?.hotel?.reviews || {}) > 0 ? (
                                        <span className="bg-oceanSlate text-pureWhite p-2 rounded-md">
                                            {calculateAverageReviewScore(row.hotel.reviews || {})}
                                        </span>
                                    ) : (
                                        "Chưa có đánh giá"
                                    )}
                                </TableCell>
                                <TableCell align="right">
                                    <div className="open-expand">
                                        <BsThreeDotsVertical />
                                        <ul className="item-dropdown">
                                            <li onClick={() => handleUpdate(row.hotel.id)}>
                                                <FaEdit size={15} className="mr-2" />
                                                Chỉnh sửa
                                            </li>
                                            <li
                                                onClick={() => {
                                                    setProductId(row.hotel.id)
                                                    setOpenModal(true)
                                                }}>
                                                <TbListDetails size={15} className="mr-2" />
                                                Xem
                                            </li>
                                        </ul>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <div className="flex justify-center my-5">
                    <Pagination
                        count={totalPages}
                        color="primary"
                        page={page}
                        onChange={handlePageChange}
                    />
                </div>
            </TableContainer>

            {loading && (
                <div className="fixed inset-0 z-50 bg-black/30 flex justify-center items-center">
                    <RotatingLines
                        visible={true}
                        height="40"
                        width="40"
                        strokeColor="#a8dadc"
                        strokeWidth="5"
                        animationDuration="0.5"
                        ariaLabel="rotating-lines-loading"
                    />
                </div>
            )}

            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                    duration={3000}
                />
            )}

            {openModal && <ViewProduct closeModal={setOpenModal} productId={productId} />}
        </div>
    )
}

export default ManagerHotels
