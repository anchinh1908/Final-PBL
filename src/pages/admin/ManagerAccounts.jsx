import {
    Pagination,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material"
import { useEffect, useState } from "react"
// import DeleteIcon from "@mui/icons-material/Delete"
import SearchIcon from "@mui/icons-material/Search"
import { useNavigate, useSearchParams } from "react-router-dom"
import { getAdminPlaceParams } from "~/utils/queryParamsHelper"
import { BsThreeDotsVertical } from "react-icons/bs"
import { FaEdit } from "react-icons/fa"
import { TbListDetails } from "react-icons/tb"
// import { BiBookAdd } from "react-icons/bi"
import {
    block_User,
    delete_User,
    getAllUser,
    restore_User,
    search_Users,
} from "~/services/UserService"
import exampleplace from "~/assets/loopy.png"
import "~/styles/ManagerOrders.css"
import Notification from "~/components/common/Notification"
import { RotatingLines } from "react-loader-spinner"

const ManagerAccounts = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const [searchInput, setSearchInput] = useState(searchParams.get("key") || "")
    const [page, setPage] = useState(parseInt(searchParams.get("page") || 1, 10))

    const [totalUser, setTotalUser] = useState(0)
    const [users, setUsers] = useState([])
    const [totalPages, setTotalPages] = useState(0)

    const [loading, setLoading] = useState(false)
    const [notification, setNotification] = useState(null)

    const handleSearch = async () => {
        setPage(1)
        const newLocation = getAdminPlaceParams(1, searchInput)
        navigate(newLocation)
        await get_All_Users(1, searchInput)
    }

    const handlePageChange = (event, value) => {
        const newLocation = getAdminPlaceParams(value, searchInput)
        setPage(value)
        navigate(newLocation)
    }

    const get_All_Users = async (page, key) => {
        try {
            const token = localStorage.getItem("token")
            if (key) {
                if (token) {
                    const products = await search_Users(token, key, page, 20)
                    console.log(products);
                    
                    setUsers([products])
                    setTotalPages(1)
                }
            } else {
                if (token) {
                    const { data, totalPages, totalItems } = await getAllUser(token, page, 20)

                    setUsers(data)
                    setTotalPages(totalPages)
                    setTotalUser(totalItems)
                }
            }
        } catch (error) {
            console.log("Lỗi khi lấy danh sách người dùng:", error)
        }
    }

    const blockUser = async (user) => {
        try {
            setLoading(true)
            const token = localStorage.getItem("token")

            const result = await block_User(token, user.id)
            if (result) {
                setNotification({
                    type: "success",
                    message: `Đã vô hiệu hoá tài khoản của ${user.fullName} thành công.`,
                })
                setUsers((prev) =>
                    prev.map((item) => (item.id === user.id ? { ...item, deleted: true } : item))
                )
            }
        } catch (error) {
            setNotification({
                type: "error",
                message: error.message || `Không thể vô hiệu hoá tài khoản của ${user.fullName}.`,
            })
        } finally {
            setLoading(false)
        }
    }

    const restoreUser = async (user) => {
        try {
            setLoading(true)
            const token = localStorage.getItem("token")

            const result = await restore_User(token, user.id)
            if (result) {
                setNotification({
                    type: "success",
                    message: `Đã khôi phục tài khoản của ${user.fullName} thành công.`,
                })
                setUsers((prev) =>
                    prev.map((item) => (item.id === user.id ? { ...item, deleted: false } : item))
                )
            }
        } catch (error) {
            setNotification({
                type: "error",
                message: error.message || `Không thể khôi phục tài khoản của ${user.fullName}.`,
            })
        } finally {
            setLoading(false)
        }
    }

    const perDeleteUser = async (user) => {
        try {
            setLoading(true)
            const token = localStorage.getItem("token")

            const result = await delete_User(token, user.id)
            if (result) {
                setNotification({
                    type: "success",
                    message: `Đã xoá tài khoản của ${user.fullName} thành công.`,
                })
                await get_All_Users(page, searchInput)
            }
        } catch (error) {
            setNotification({
                type: "error",
                message: error.message || `Không thể xoá tài khoản của ${user.fullName}.`,
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        get_All_Users(page, searchInput)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page])

    return (
        <div className="mx-[5%]">
            <div className="flex items-center justify-between mt-4">
                <h1 className="title-form">Tài khoản người dùng ({totalUser})</h1>
                {/* <div className="add-product-button rounded-md" onClick={() => {}}>
                    <BiBookAdd className="mr-2 size-5" />
                    Thêm sản phẩm mới
                </div> */}
            </div>

            <TableContainer className="bg-white no-padding-shadow-box-hover mt-6">
                <div className="table-header h-16 mt-4">
                    <div className="custom-search">
                        <input
                            placeholder="Email"
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
                </div>

                <Table aria-label="simple table" size="small">
                    <TableHead>
                        <TableRow style={{ height: 65 }}>
                            <TableCell sx={{ width: "5%" }}>STT</TableCell>
                            <TableCell sx={{ width: "18%" }}>Tên khách hàng</TableCell>
                            <TableCell sx={{ width: "18%" }}>Email</TableCell>
                            <TableCell sx={{ width: "15%" }}>Số điện thoại</TableCell>
                            <TableCell sx={{ width: "15%" }}>Ngày sinh</TableCell>
                            <TableCell sx={{ width: "18%" }}>Địa chỉ</TableCell>
                            <TableCell sx={{ width: "6%" }}>Trạng thái</TableCell>
                            <TableCell align="right" sx={{ width: "5%" }}>
                                Action
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {users &&
                            users?.map((user, index) => (
                                <TableRow
                                    key={user.id}
                                    style={{ height: 65 }}
                                    className="table-row"
                                    onClick={() => {}}>
                                    <TableCell align="center">
                                        {20 * (page - 1) + index + 1}
                                    </TableCell>
                                    <TableCell component="th" scope="row">
                                        <p className="flex items-center w-full gap-x-2">
                                            <img
                                                src={user?.avatarUrl || exampleplace}
                                                alt=""
                                                className="w-11 h-11 rounded-full object-cover"
                                            />
                                            <span className="line-clamp-2">{user.fullName}</span>
                                        </p>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.phoneNumber}</TableCell>
                                    <TableCell>{user.dateOfBirth}</TableCell>
                                    <TableCell>{user.address}</TableCell>
                                    <TableCell>
                                        <p
                                            className={`px-2 py-1 font-bold rounded-lg flex justify-center ${
                                                user?.deleted
                                                    ? "bg-gray-300"
                                                    : "bg-green-500 text-white"
                                            }`}>
                                            {user?.deleted ? "Blocked" : "Active"}
                                        </p>
                                    </TableCell>
                                    <TableCell align="right">
                                        <div className="open-expand">
                                            <BsThreeDotsVertical />
                                            <ul className="item-dropdown">
                                                {user?.deleted ? (
                                                    <li onClick={() => restoreUser(user)}>
                                                        <FaEdit size={15} className="mr-2" />
                                                        Khôi phục
                                                    </li>
                                                ) : (
                                                    <li onClick={() => blockUser(user)}>
                                                        <FaEdit size={15} className="mr-2" />
                                                        Vô hiệu hoá
                                                    </li>
                                                )}
                                                <li onClick={() => perDeleteUser(user)}>
                                                    <TbListDetails size={15} className="mr-2" />
                                                    Xoá tài khoản
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

export default ManagerAccounts
