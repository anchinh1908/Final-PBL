import * as ImagePicker from "expo-image-picker"
import * as DocumentPicker from "expo-document-picker"
import { Alert } from "react-native"

export const UploadImage = async () => {
    try {
        // Xin quyền truy cập thư viện ảnh
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (permissionResult.granted === false) {
            Alert.alert("Thông báo", "Quyền truy cập thư viện ảnh bị từ chối.")
            return null
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        })

        if (!result.canceled) {
            // console.log(result.assets[0].uri);
            return result.assets[0].uri // Trả về hình ảnh đã chọn
        } else {
            console.log("User cancelled image picker.")
            return null
        }
    } catch (error) {
        console.log("Error while picking the image:", error)
        return null
    }
}

export const UploadImageArticle = async () => {
    try {
        // Xin quyền truy cập thư viện ảnh
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (permissionResult.granted === false) {
            Alert.alert("Thông báo", "Quyền truy cập thư viện ảnh bị từ chối.")
            return null
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 1,
        })

        if (!result.canceled) {
            // console.log(result.assets[0]);
            return result.assets[0] // Trả về hình ảnh đã chọn
        } else {
            console.log("User cancelled image picker.")
            return null
        }
    } catch (error) {
        console.log("Error while picking the image:", error)
        return null
    }
}

let pickingDocument = false

export const UploadPDF = async () => {
    if (pickingDocument) {
        Alert.alert("Thông báo", "Đang có một hoạt động chọn tệp khác. Vui lòng đợi.")
        return "isLoading"
    }

    try {
        pickingDocument = true
        const result = await DocumentPicker.getDocumentAsync({
            type: "application/pdf",
            copyToCacheDirectory: true,
        })

        if (!result.canceled && result.assets) {
            console.log(result.assets[0])
            return result.assets[0]
        } else if (result.canceled) {
            Alert.alert("Thông báo", "Người dùng đã hủy chọn tệp PDF.")
            return null
        }
    } catch (error) {
        console.log("Error while picking the PDF file:", error)
        Alert.alert("Thông báo", "Đã xảy ra lỗi khi chọn tệp PDF.")
        return null
    } finally {
        pickingDocument = false
    }
}
