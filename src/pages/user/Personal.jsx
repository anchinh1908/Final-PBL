import loopy from "~/assets/loopy.png"
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera"
import { useEffect, useRef, useState } from "react"
import { DatePicker } from "rsuite"
// import "rsuite/dist/rsuite.min.css"
import "~/styles/rsuite-datepicker.css"
import { format, parse } from "date-fns"
import { useAuthContext } from "~/hooks/useAuthContext"
import { splitName } from "~/utils/uiHelper"
import { updateProfile } from "~/services/UserService"
import Notification from "~/components/common/Notification"
import { RotatingLines } from "react-loader-spinner"

const Personal = () => {
    const { user, dispatch } = useAuthContext()

    const [isEditing, setIsEditing] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [birthday, setBirthday] = useState(null)
    const [address, setAddress] = useState("")

    const [loading, setLoading] = useState(false)
    const [notification, setNotification] = useState(null)

    const fileInputRef = useRef(null)

    const handleAvatarClick = () => {
        fileInputRef.current.click() // Kích hoạt input file khi click icon
    }

    const handleFileChange = async (e) => {
        const file = e.target.files[0]
        if (file) {
            await update_Profile(e, { avatar: file })
        }
    }

    useEffect(() => {
        if (user) {
            const [first, rest] = splitName(user.fullName || "")
            setFirstName(rest || "")
            setLastName(first || "")
            setEmail(user.email || "")
            setPhone(user.phoneNumber || "")
            setAddress(user.address || "")

            if (user.dateOfBirth) {
                setBirthday(parse(user.dateOfBirth, "dd-MM-yyyy", new Date()))
            }
        }
    }, [user])

    const editingClick = (field) => {
        if (!isEditing) setIsEditing(field)
    }

    const update_Profile = async (e, newuser) => {
        e.preventDefault()

        try {
            setLoading(true)

            const token = localStorage.getItem("token")
            const result = await updateProfile(token, newuser)
            if (result.status === 200) {
                if (newuser.dateOfBirth)
                    newuser.dateOfBirth = format(newuser.dateOfBirth, "dd-MM-yyyy")
                if (newuser.avatar) newuser.avatarUrl = result.avatarUrl

                dispatch({ type: "UPDATE_USER", payload: newuser })

                setNotification({
                    type: "success",
                    message: "Cập nhật hồ sơ thành công!",
                })
                setIsEditing("")
            }
        } catch (error) {
            setNotification({
                type: "error",
                message: error.message || "Cập nhật hồ sơ thất bại!",
            })
            if (newuser.fullName) {
                const [first, rest] = splitName(user.fullName || "")
                setFirstName(rest || "")
                setLastName(first || "")
            }
            if (newuser.phoneNumber) setPhone(user.phoneNumber || "")
            if (newuser.dateOfBirth) {
                if (user.dateOfBirth) setBirthday(parse(user.dateOfBirth, "dd-MM-yyyy", new Date()))
                else setBirthday(null)
            }
            if (newuser.address) setAddress(user.address || "")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <div className="flex justify-between pb-5 border-b">
                <div>
                    <h1>Thông tin cá nhân</h1>
                    <p className="mt-3">
                        Cập nhật thông tin của bạn và tìm hiểu các thông tin này được sử dụng ra sao
                    </p>
                </div>
                <div className="relative border-2 border-amber-400 rounded-full">
                    <img
                        src={user.avatarUrl || loopy}
                        alt="image"
                        className="rounded-full h-16 w-16 bg-pink-100 object-cover"
                    />
                    <div
                        onClick={handleAvatarClick}
                        className="w-full h-8 bg-black/35 absolute bottom-0 rounded-b-full flex items-center justify-center cursor-pointer">
                        <PhotoCameraIcon sx={{ fontSize: 20 }} className="text-white/75" />
                    </div>

                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>
            </div>

            <div className="border-b py-5 px-4">
                <div className={`flex ${isEditing == "name" ? "items-start" : "items-center"}`}>
                    <div className="lg:flex flex-1 items-start">
                        <div className=" w-36 font-medium text-gray-700">Tên</div>

                        {isEditing == "name" ? (
                            <div className="flex gap-4">
                                <div>
                                    <p className="mb-1 font-bold">Tên</p>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="Tên"
                                        className="outline-blue-500 border border-gray-300 rounded-md py-1.5 px-3"
                                    />
                                </div>
                                <div>
                                    <p className="mb-1 font-bold">Họ</p>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        placeholder="Họ"
                                        className="outline-blue-500 border border-gray-300 rounded-md py-1.5 px-3"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1">{lastName + " " + firstName}</div>
                        )}
                    </div>

                    {!isEditing ? (
                        <button
                            onClick={() => editingClick("name")}
                            className="text-blue-600 hover:underline ml-6">
                            Chỉnh sửa
                        </button>
                    ) : isEditing != "name" ? (
                        <button className="text-gray-400 font-medium ml-6" disabled>
                            Chỉnh sửa
                        </button>
                    ) : (
                        <div className="">
                            <button
                                onClick={() => {
                                    setIsEditing("")
                                    const [first, rest] = splitName(user.fullName || "")
                                    setFirstName(rest || "")
                                    setLastName(first || "")
                                }}
                                className="text-blue-600 hover:underline ml-6">
                                Huỷ
                            </button>
                        </div>
                    )}
                </div>

                {isEditing == "name" && (
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={(e) =>
                                update_Profile(e, { fullName: lastName + " " + firstName })
                            }
                            className="bg-blue-500 py-1 px-3 text-white rounded-md">
                            Lưu
                        </button>
                    </div>
                )}
            </div>
            <div className="border-b py-5 px-4">
                <div className={`flex ${isEditing == "email" ? "items-start" : "items-center"}`}>
                    <div className="lg:flex flex-1 items-start">
                        <div className=" w-36 font-medium text-gray-700">Địa chỉ email</div>
                        <div>
                            <div className="text-base text-black flex items-center gap-1">
                                {email}
                            </div>
                            <span className=" text-gray-500 mt-1 text-sm">
                                Đây là địa chỉ email bạn dùng để đăng nhập. Chúng tôi cũng sẽ gửi
                                các xác nhận tới địa chỉ này.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="border-b py-5 px-4">
                <div className={`flex ${isEditing == "phone" ? "items-start" : "items-center"}`}>
                    <div className="lg:flex flex-1 items-start">
                        <div className=" w-36 font-medium text-gray-700">Số điện thoại</div>
                        {isEditing == "phone" ? (
                            <div>
                                <p className="mb-1 font-bold">Số điện thoại</p>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder=""
                                    className="outline-blue-500 border w-72 border-gray-300 rounded-md py-1.5 px-3"
                                />
                            </div>
                        ) : (
                            <div>
                                {phone ? (
                                    <p>{phone}</p>
                                ) : (
                                    <span className="mt-1 text-base text-gray-500 flex items-center gap-1">
                                        Thêm số điện thoại của bạn
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {!isEditing ? (
                        <button
                            onClick={() => editingClick("phone")}
                            className="text-blue-600 hover:underline ml-6">
                            Chỉnh sửa
                        </button>
                    ) : isEditing != "phone" ? (
                        <button className="text-gray-400 ml-6 font-medium" disabled>
                            Chỉnh sửa
                        </button>
                    ) : (
                        <div>
                            <button
                                onClick={() => {
                                    setIsEditing("")
                                    setPhone(user.phoneNumber || "")
                                }}
                                className="text-blue-600 hover:underline ml-6">
                                Huỷ
                            </button>
                        </div>
                    )}
                </div>

                {isEditing == "phone" && (
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={(e) => update_Profile(e, { phoneNumber: phone })}
                            className="bg-blue-500 py-1 px-3 text-white rounded-md">
                            Lưu
                        </button>
                    </div>
                )}
            </div>
            <div className="border-b py-5 px-4">
                <div className={`flex ${isEditing == "birthday" ? "items-start" : "items-center"}`}>
                    <div className="lg:flex flex-1 items-start">
                        <div className=" w-36 font-medium text-gray-700">Ngày sinh</div>
                        {isEditing == "birthday" ? (
                            <DatePicker value={birthday} onChange={(value) => setBirthday(value)} />
                        ) : (
                            <div>
                                {birthday ? (
                                    <p>{format(birthday, "dd/MM/yyyy")}</p>
                                ) : (
                                    <span className="mt-1 text-base text-gray-500 flex items-center gap-1">
                                        Nhập ngày sinh của bạn
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {!isEditing ? (
                        <button
                            onClick={() => editingClick("birthday")}
                            className="text-blue-600 hover:underline ml-6">
                            Chỉnh sửa
                        </button>
                    ) : isEditing != "birthday" ? (
                        <button className="text-gray-400 ml-6 font-medium" disabled>
                            Chỉnh sửa
                        </button>
                    ) : (
                        <div>
                            <button
                                onClick={() => {
                                    setIsEditing("")
                                    if (user.dateOfBirth)
                                        setBirthday(
                                            parse(user.dateOfBirth, "dd-MM-yyyy", new Date())
                                        )
                                    else setBirthday(null)
                                }}
                                className="text-blue-600 hover:underline ml-6">
                                Huỷ
                            </button>
                        </div>
                    )}
                </div>

                {isEditing == "birthday" && (
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={(e) => update_Profile(e, { dateOfBirth: birthday })}
                            className="bg-blue-500 py-1 px-3 text-white rounded-md">
                            Lưu
                        </button>
                    </div>
                )}
            </div>
            {/* <div className="border-b py-5 px-4">
                <div
                    className={`flex ${
                        isEditing == "nationality" ? "items-start" : "items-center"
                    }`}>
                    <div className="lg:flex flex-1 items-start">
                        <div className=" w-36 font-medium text-gray-700">Quốc tịch</div>
                        {isEditing == "nationality" ? (
                            <div>
                                <p className="mb-1 font-bold">Quốc tịch</p>
                                <input
                                    type="text"
                                    value=""
                                    onChange={() => {}}
                                    placeholder="Quốc tịch"
                                    className="outline-blue-500 border w-72 border-gray-300 rounded-md py-1.5 px-3"
                                />
                            </div>
                        ) : (
                            <span className="mt-1 text-base text-gray-500 flex items-center gap-1">
                                Chọn vùng/quốc gia của bạn
                            </span>
                        )}
                    </div>

                    {!isEditing ? (
                        <button
                            onClick={() => editingClick("nationality")}
                            className="text-blue-600 hover:underline ml-6">
                            Chỉnh sửa
                        </button>
                    ) : isEditing != "nationality" ? (
                        <button className="text-gray-400 ml-6 font-medium" disabled>
                            Chỉnh sửa
                        </button>
                    ) : (
                        <div>
                            <button
                                onClick={() => setIsEditing("")}
                                className="text-blue-600 hover:underline ml-6">
                                Huỷ
                            </button>
                        </div>
                    )}
                </div>

                {isEditing == "nationality" && (
                    <div className="flex justify-end mt-4">
                        <button className="bg-blue-500 py-1 px-3 text-white rounded-md">Lưu</button>
                    </div>
                )}
            </div> */}
            {/* <div className="border-b py-5 px-4">
                <div className={`flex ${isEditing == "gender" ? "items-start" : "items-center"}`}>
                    <div className="lg:flex flex-1 items-start">
                        <div className=" w-36 font-medium text-gray-700">Giới tính</div>
                        {isEditing == "gender" ? (
                            <div>
                                <p className="mb-1 font-bold">Giới tính</p>
                                <Select
                                    displayEmpty
                                    renderValue={(selected) =>
                                        selected ? (
                                            selected === "male" ? (
                                                "Nam"
                                            ) : selected === "female" ? (
                                                "Nữ"
                                            ) : selected === "non-binary" ? (
                                                "Không xác định"
                                            ) : (
                                                "Không muốn nêu rõ"
                                            )
                                        ) : (
                                            <p className="text-gray-400">Chọn giới tính</p>
                                        )
                                    }
                                    sx={{ width: 300, height: 38, borderRadius: 1 }}>
                                    <MenuItem value="male">Nam</MenuItem>
                                    <MenuItem value="female">Nữ</MenuItem>
                                    <MenuItem value="non-binary">Không xác định</MenuItem>
                                    <MenuItem value="prefer-not">Không muốn nêu rõ</MenuItem>
                                </Select>
                            </div>
                        ) : (
                            <span className="mt-1 text-base text-gray-500 flex items-center gap-1">
                                Chọn giới tính
                            </span>
                        )}
                    </div>

                    {!isEditing ? (
                        <button
                            onClick={() => editingClick("gender")}
                            className="text-blue-600 hover:underline ml-6">
                            Chỉnh sửa
                        </button>
                    ) : isEditing != "gender" ? (
                        <button className="text-gray-400 ml-6 font-medium" disabled>
                            Chỉnh sửa
                        </button>
                    ) : (
                        <div>
                            <button
                                onClick={() => setIsEditing("")}
                                className="text-blue-600 hover:underline ml-6">
                                Huỷ
                            </button>
                        </div>
                    )}
                </div>

                {isEditing == "gender" && (
                    <div className="flex justify-end mt-4">
                        <button className="bg-blue-500 py-1 px-3 text-white rounded-md">Lưu</button>
                    </div>
                )}
            </div> */}
            <div className="py-5 px-4">
                <div className={`flex ${isEditing == "address" ? "items-start" : "items-center"}`}>
                    <div className="lg:flex flex-1 items-start">
                        <div className=" w-36 font-medium text-gray-700">Địa chỉ</div>
                        {isEditing == "address" ? (
                            <div>
                                <p className="mb-1 font-bold">Địa chỉ</p>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder=""
                                    className="outline-blue-500 border w-72 border-gray-300 rounded-md py-1.5 px-3"
                                />
                            </div>
                        ) : (
                            <div>
                                {address ? (
                                    <p>{address}</p>
                                ) : (
                                    <span className="mt-1 text-base text-gray-500 flex items-center gap-1">
                                        Nhập địa chỉ
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    {!isEditing ? (
                        <button
                            onClick={() => editingClick("address")}
                            className="text-blue-600 hover:underline ml-6">
                            Chỉnh sửa
                        </button>
                    ) : isEditing != "address" ? (
                        <button className="text-gray-400 ml-6 font-medium" disabled>
                            Chỉnh sửa
                        </button>
                    ) : (
                        <div>
                            <button
                                onClick={() => {
                                    setIsEditing("")
                                    setAddress(user.address || "")
                                }}
                                className="text-blue-600 hover:underline ml-6">
                                Huỷ
                            </button>
                        </div>
                    )}
                </div>

                {isEditing == "address" && (
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={(e) => update_Profile(e, { address: address })}
                            className="bg-blue-500 py-1 px-3 text-white rounded-md">
                            Lưu
                        </button>
                    </div>
                )}
            </div>

            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                    duration={3000}
                />
            )}

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
        </div>
    )
}

export default Personal
