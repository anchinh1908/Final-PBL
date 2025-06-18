import { useEffect, useState } from "react"
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
import { useNavigate, useSearchParams } from "react-router-dom"
import { getAdminProductParams } from "~/utils/queryParamsHelper"
import { get_All_Soft_Deleted_Product } from "~/services/ProductService"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash"

const ProductRecycleBin = () => {
    // const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const token = localStorage.getItem("token")

    const [page, setPage] = useState(parseInt(searchParams.get("page") || 1, 10))

    const [productList, setProductList] = useState([])
    const [totalPages, setTotalPages] = useState(0)

    const getProducts = async (token, page) => {
        try {
            const products = await get_All_Soft_Deleted_Product(token, page)
            setProductList(products.data)
            setTotalPages(products.pagination.totalPages)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        getProducts(token, page)
    }, [token, page])

    const handlePageChange = (event, value) => {
        const newLocation = getAdminProductParams(value, 10, "")
        setPage(value)
        navigate(newLocation)
    }

    const [selectedRows, setSelectedRows] = useState([])

    const handleCheckboxChange = (rowIndex) => {
        setSelectedRows((prev) =>
            prev.includes(rowIndex)
                ? prev.filter((index) => index !== rowIndex)
                : [...prev, rowIndex]
        )
    }

    return (
        <div className="mx-[5%]">
            <TableContainer className="bg-white no-padding-shadow-box-hover mt-10">
                {selectedRows.length > 0 ? (
                    <div className="table-header h-20 bg-persianGreen/20">
                        <p>Đã chọn: {selectedRows.length} sản phẩm</p>
                        <div>
                            <Tooltip title="Khôi phục">
                                <IconButton>
                                    <RestoreFromTrashIcon sx={{ fontSize: 30, color: "#00a6a9" }} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Xoá vĩnh viễn">
                                <IconButton>
                                    <DeleteForeverIcon sx={{ fontSize: 30 }} />
                                </IconButton>
                            </Tooltip>
                        </div>
                    </div>
                ) : (
                    <div className="table-header h-16 mt-4">
                        <h1 className="text-2xl font-bold text-persianGreen">
                            Danh sách sản phẩm đã xoá
                        </h1>
                    </div>
                )}
                <Table aria-label="simple table" size="small">
                    <TableHead>
                        <TableRow style={{ height: 65 }}>
                            <TableCell sx={{ width: "5%" }}>
                                <Checkbox
                                    indeterminate={
                                        selectedRows.length > 0 &&
                                        selectedRows.length < productList.length
                                    }
                                    checked={selectedRows.length === productList.length}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedRows(productList.map((_, index) => index))
                                        } else {
                                            setSelectedRows([])
                                        }
                                    }}
                                />
                            </TableCell>
                            <TableCell sx={{ width: "25%" }}>Sản phẩm</TableCell>
                            <TableCell align="right" sx={{ width: "10%" }}>
                                RAM
                            </TableCell>
                            <TableCell align="right" sx={{ width: "15%" }}>
                                Màn hình
                            </TableCell>
                            <TableCell align="right" sx={{ width: "20%" }}>
                                Hệ điều hành
                            </TableCell>
                            <TableCell align="right" sx={{ width: "10%" }}>
                                Bảo hành
                            </TableCell>
                            <TableCell align="center" sx={{ width: "10%" }}>
                                Đơn hàng
                            </TableCell>
                            <TableCell align="right" sx={{ width: "5%" }}>
                                Action
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {productList.map((row) => (
                            <TableRow
                                key={row._id}
                                style={{ height: 65 }}
                                className="table-row"
                                onClick={() => {}}>
                                <TableCell>
                                    <Checkbox
                                        checked={selectedRows.includes(row._id)}
                                        onChange={() => handleCheckboxChange(row._id)}
                                    />
                                </TableCell>
                                <TableCell component="th" scope="row">
                                    {/* {row.product} */}
                                    <p className="flex items-center w-full">
                                        <img
                                            src={exampleproduct}
                                            alt=""
                                            className="product-img-admin"
                                        />
                                        <span className="line-clamp-2">{row.name}</span>
                                    </p>
                                </TableCell>
                                <TableCell align="right">{row.ram.size}</TableCell>
                                <TableCell align="right">{row.screen.size} inch</TableCell>
                                <TableCell align="right">{row.operating_system}</TableCell>
                                <TableCell align="right">{row.warranty}</TableCell>
                                <TableCell align="center">{row.totalSold}</TableCell>
                                <TableCell align="right">
                                    <div className="open-expand">
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
        </div>
    )
}

export default ProductRecycleBin
