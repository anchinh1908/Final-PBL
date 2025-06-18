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
import { useEffect, useState } from "react"
import { BiBookAdd } from "react-icons/bi"
import DeleteIcon from "@mui/icons-material/Delete"
import SearchIcon from "@mui/icons-material/Search"
import FilterListIcon from "@mui/icons-material/FilterList"
import { useNavigate, useSearchParams } from "react-router-dom"
// import { getAdminPlaceParams } from "~/utils/queryParamsHelper"
// import { BsThreeDotsVertical } from "react-icons/bs"
import { FaEdit } from "react-icons/fa"
import { delete_Places, get_All_Places, search_Places } from "~/services/PlaceService"
// import { TbListDetails } from "react-icons/tb"
import exampleplace from "~/assets/loopy.png"
import { ADMIN_ADD_PLACE, ADMIN_UPDATE_PLACE } from "~/constants/routes"
import { getAdminPlaceParams } from "~/utils/queryParamsHelper"
import Notification from "~/components/common/Notification"
import { RotatingLines } from "react-loader-spinner"
import "~/styles/ManagerOrders.css"
// import { TbListDetails } from "react-icons/tb"

const ManagerPlaces = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const [totalPlace, setTotalPlace] = useState(0)
    const [selectedRows, setSelectedRows] = useState([])

    const [searchInput, setSearchInput] = useState(searchParams.get("key") || "")
    const [page, setPage] = useState(parseInt(searchParams.get("page") || 1, 10))

    const [placeList, setPlaceList] = useState([])
    const [totalPages, setTotalPages] = useState(0)

    const [loading, setLoading] = useState(false)
    const [notification, setNotification] = useState(null)

    const getAllPlaces = async (page, key) => {
        try {
            if (key) {
                const token = localStorage.getItem("token")
                if (token) {
                    const products = await search_Places(token, page, 20, key)
                    setPlaceList(products.place)
                    setTotalPages(products.totalPages)
                }
            } else {
                const { data, totalPages, totalItems } = await get_All_Places(page, 20)
                setPlaceList(data)
                setTotalPages(totalPages)
                setTotalPlace(totalItems)
            }
        } catch (error) {
            console.log("Lỗi khi lấy danh sách địa điểm:", error)
        }
    }

    useEffect(() => {
        getAllPlaces(page, searchInput)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page])

    const handleSearch = async () => {
        setPage(1)
        const newLocation = getAdminPlaceParams(1, searchInput)
        navigate(newLocation)
        await getAllPlaces(1, searchInput)
    }

    const handlePageChange = (event, value) => {
        const newLocation = getAdminPlaceParams(value, searchInput)
        setPage(value)
        navigate(newLocation)
    }

    const handleCheckboxChange = (rowIndex) => {
        setSelectedRows((prev) =>
            prev.includes(rowIndex)
                ? prev.filter((index) => index !== rowIndex)
                : [...prev, rowIndex]
        )
    }

    const handleUpdate = (placeSlug) => {
        navigate(ADMIN_UPDATE_PLACE, { state: { placeSlug } })
    }

    const handleDeleteHotels = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem("token")

            const result = await delete_Places(token, selectedRows)
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
            <div className="flex items-center justify-between mt-4">
                <h1 className="title-form">Địa điểm du lịch Đà Nẵng ({totalPlace})</h1>
                <div
                    className="add-product-button rounded-md"
                    onClick={() => navigate(ADMIN_ADD_PLACE)}>
                    <BiBookAdd className="mr-2 size-5" />
                    Thêm sản phẩm mới
                </div>
            </div>

            <TableContainer className="bg-white no-padding-shadow-box-hover mt-6">
                {selectedRows.length > 0 ? (
                    <div className="table-header h-20 bg-persianGreen/20">
                        <p>Đã chọn: {selectedRows.length} địa điểm</p>
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
                                    indeterminate={
                                        selectedRows.length > 0 &&
                                        selectedRows.length < placeList.length
                                    }
                                    checked={selectedRows.length === placeList.length}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedRows(placeList.map((place) => place.id))
                                        } else {
                                            setSelectedRows([])
                                        }
                                    }}
                                />
                            </TableCell>
                            <TableCell sx={{ width: "22%" }}>Địa điểm</TableCell>
                            <TableCell sx={{ width: "14%" }} align="center">
                                Đánh giá
                            </TableCell>
                            <TableCell sx={{ width: "18%" }}>Địa chỉ</TableCell>
                            <TableCell sx={{ width: "18%" }}>Mô tả</TableCell>
                            <TableCell sx={{ width: "18%" }}>Dịch vụ</TableCell>
                            <TableCell sx={{ width: "5%" }}>Action</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {placeList.map((row) => (
                            <TableRow
                                key={row.id}
                                style={{ height: 65 }}
                                className={`table-row ${
                                    selectedRows.includes(row.id) && "selected-table-row"
                                }`}>
                                <TableCell>
                                    <Checkbox
                                        checked={selectedRows.includes(row.id)}
                                        onChange={() => handleCheckboxChange(row.id)}
                                    />
                                </TableCell>
                                <TableCell component="th" scope="row">
                                    <p className="flex items-center w-full">
                                        <img
                                            src={row?.imageUrl || exampleplace}
                                            alt=""
                                            className="product-img-admin"
                                        />
                                        <span className="line-clamp-2">{row.title}</span>
                                    </p>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col items-center">
                                        <p>{row.rating ? row.rating + " ⭐" : ""}</p>
                                        <span className="text-xs text-slateGray">
                                            {row.review
                                                ? "(" + row.review.toLocaleString() + " đánh giá)"
                                                : ""}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <p className="line-clamp-2">{row.address}</p>
                                </TableCell>
                                <TableCell>
                                    <p className="line-clamp-2">{row.description}</p>
                                </TableCell>
                                <TableCell>
                                    <div className="line-clamp-3">
                                        {Array.isArray(row.services) &&
                                            row.services.length > 0 &&
                                            row.services
                                                .map((item) => {
                                                    const key = Object.keys(item)[0]
                                                    const values = item[key]
                                                    return `${key}: ${values.join(", ")}`
                                                })
                                                .join(". ")}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Tooltip title="Update">
                                        <IconButton onClick={() => handleUpdate(row.slug)}>
                                            <FaEdit size={15} />
                                        </IconButton>
                                    </Tooltip>
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
        </div>
    )
}

export default ManagerPlaces
