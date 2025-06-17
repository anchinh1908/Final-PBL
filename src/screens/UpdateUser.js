import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    ScrollView,
} from "react-native"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { COLORS, images } from "../constants"
import { UploadImage } from "../utils/Upload"
import { HeaderBack } from "../components"
import DateTimePicker from "@react-native-community/datetimepicker"
import Account_API, { updateProfile } from "../API/Account_API"
import Loading from "../components/Loading"
import { useAuthContext } from "../hooks/useAuthContext"
import { format, parse } from "date-fns"
import AsyncStorage from "@react-native-async-storage/async-storage"

const UpdateUser = ({ navigation }) => {
    const { user, dispatch } = useAuthContext()

    const [loadingStatus, setLoadingStatus] = useState(false)

    const [fullName, setFullName] = useState(user?.fullName || "")
    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "")
    const [dateOfBirth, setDateOfBirth] = useState(
        user?.dateOfBirth ? parse(user?.dateOfBirth, "dd-MM-yyyy", new Date()) : null
    )
    const [address, setAddress] = useState(user?.address || "")
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "")

    const [showDatePicker, setShowDatePicker] = useState(false)

    const handleUploadImage = async () => {
        const image = await UploadImage()
        if (image) setAvatarUrl(image)
    }

    const update_Profile = async (token, newuser) => {
        try {
            setLoadingStatus(true)

            const result = await updateProfile(token, newuser)
            if (result) {
                if (newuser.dateOfBirth)
                    newuser.dateOfBirth = format(newuser.dateOfBirth, "dd-MM-yyyy")
                if (newuser.avatar) newuser.avatarUrl = result.avatarUrl

                dispatch({ type: "UPDATE_USER", payload: newuser })

                Alert.alert("Thành công", "Cập nhật hồ sơ thành công!")
            }
        } catch (error) {
            Alert.alert("Lỗi", error.message || "Cập nhật hồ sơ thất bại!")
            if (newuser.fullName) setFullName(user.fullName || "")
            if (newuser.phoneNumber) setPhone(user.phoneNumber || "")
            if (newuser.dateOfBirth) {
                if (user.dateOfBirth)
                    setDateOfBirth(parse(user.dateOfBirth, "dd-MM-yyyy", new Date()))
                else setDateOfBirth(null)
            }
            if (newuser.address) setAddress(user.address || "")
            if (newuser.avatar) setAvatarUrl(user.avatarUrl || "")
        } finally {
            setLoadingStatus(false)
        }
    }

    const handleSave = async () => {
        const newuser = {}
        if (fullName != user.fullName) newuser.fullName = fullName
        if (phoneNumber != user.phoneNumber) newuser.phoneNumber = phoneNumber
        if (dateOfBirth && dateOfBirth !== user.dateOfBirth) newuser.dateOfBirth = dateOfBirth
        if (address && address !== user.address) newuser.address = address
        if (avatarUrl && avatarUrl !== user.avatarUrl) newuser.avatar = avatarUrl

        const token = await AsyncStorage.getItem("token")
        await update_Profile(token, newuser)
    }

    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate
        console.log(currentDate, typeof currentDate)

        setShowDatePicker(false)

        if (currentDate) {
            setDateOfBirth(new Date(currentDate))
        }
    }

    return (
        <View style={styles.container}>
            {loadingStatus && <Loading />}
            <View
                style={{
                    paddingHorizontal: 16,
                    paddingTop: 16,
                }}>
                <HeaderBack navigation={navigation} title="Chỉnh Sửa Hồ Sơ" />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.myAvatar}>
                    <TouchableOpacity activeOpacity={0.85}>
                        <Image
                            source={
                                avatarUrl
                                    ? { uri: avatarUrl }
                                    : user?.avatarUrl
                                    ? { uri: user.avatarUrl }
                                    : images.user_default
                            }
                            style={styles.image}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={handleUploadImage}
                        style={styles.uploadAvatar}>
                        <MaterialIcons name="photo-camera" size={22} color={COLORS.slateGray} />
                    </TouchableOpacity>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>Họ và tên</Text>
                    <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />

                    <Text style={styles.label}>Số Điện Thoại</Text>
                    <TextInput
                        style={styles.input}
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="phone-pad"
                    />

                    <Text style={styles.label}>Ngày sinh</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                        <TextInput
                            style={styles.input}
                            value={dateOfBirth ? format(dateOfBirth, "dd-MM-yyyy") : ""}
                            editable={false}
                        />
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            value={dateOfBirth ? dateOfBirth : new Date()}
                            mode="date"
                            display="default"
                            onChange={onDateChange}
                        />
                    )}

                    <Text style={styles.label}>Địa chỉ</Text>
                    <TextInput
                        style={styles.input}
                        value={address}
                        onChangeText={setAddress}
                    />
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={() => handleSave()}>
                    <Text style={styles.saveButtonText}>Lưu</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    )
}

export default UpdateUser

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.baseBackground,
    },
    content: {
        padding: 20,
    },
    myAvatar: {
        width: 120,
        aspectRatio: 1,
        resizeMode: "cover",
        borderRadius: 40,
        marginRight: 5,
        backgroundColor: COLORS.silver,
        alignSelf: "center",
        marginBottom: 10,
    },
    image: {
        width: "100%",
        height: "100%",
        borderRadius: 40,
    },
    uploadAvatar: {
        position: "absolute",
        top: 91,
        start: 91,
        backgroundColor: COLORS.pureWhite,
        padding: 2,
        borderRadius: 999,
    },
    form: {
        marginBottom: 20,
    },
    label: {
        fontSize: 15,
        color: COLORS.oceanSlate,
        marginBottom: 10,
        fontWeight: "bold",
    },
    input: {
        backgroundColor: COLORS.silverMist,
        padding: 10,
        borderRadius: 20,
        marginBottom: 15,
        // borderColor: COLORS.silverMist,
        // borderWidth: 1,
    },
    saveButton: {
        backgroundColor: COLORS.coralBlaze,
        paddingVertical: 10,
        borderRadius: 999,
        alignItems: "center",
        marginBottom: 40,
    },
    saveButtonText: {
        color: COLORS.pureWhite,
        fontSize: 16,
        fontWeight: "bold",
    },
})
