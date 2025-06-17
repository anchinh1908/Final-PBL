// import React, { useState, useEffect } from "react"
// import {
//     View,
//     Text,
//     TextInput,
//     StyleSheet,
//     TouchableOpacity,
//     Image,
//     Alert,
//     ScrollView,
//     ActivityIndicator,
//     Linking,
// } from "react-native"
// import { SafeAreaView } from "react-native-safe-area-context"
// import { COLORS, images } from "../constants"
// import { useAuth } from "../AuthProvider"
// import { HeaderBack } from "../components"
// import { UploadImage, UploadPDF } from "../utils/Upload"
// import DateTimePicker from "@react-native-community/datetimepicker"
// import Account_API from "../API/Account_API"
// import Speciality_API from "../API/Speciality_API"
// import Region_API from "../API/Region_API"
// import Dropdown from "../components/Dropdown"
// import Feather from "@expo/vector-icons/Feather"
// import { Entypo, Ionicons, MaterialIcons } from "@expo/vector-icons"
// import { splitText } from "../utils/splitText"

// let MAX_UPLOAD_SIZE = 10 * 1024 * 1024

// const UpdateDoctor = ({ navigation, route }) => {
//     const { storedToken, account, setAccount } = useAuth()
//     const [isSaving, setIsSaving] = useState(false)
//     const [username, setUserName] = useState(account?.username || "")
//     const [phone, setPhoneNumber] = useState(account?.phone || "")
//     const [date_of_birth, setDateOfBirth] = useState(account?.date_of_birth || "")
//     const [address, setAddress] = useState(account?.address || "")
//     const [speciality, setSpeciality] = useState(account?.speciality || "")
//     const [region, setRegion] = useState(account?.region || "")

//     const [bio, setBio] = useState(account?.bio || "")
//     const [bioDoctor, setBioDoctor] = useState(
//         splitText(account?.bio) || {
//             introduction: "",
//             workExperience: "",
//             education: "",
//         }
//     )

//     const [uriAvatar, setUriAvatar] = useState(account?.profile_image)
//     const [showDatePicker, setShowDatePicker] = useState(false)
//     const [specialities, setSpecialities] = useState([])
//     const [regions, setRegions] = useState([])
//     const [openedDropdown, setOpenedDropdown] = useState(null)

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const specialityList = await Speciality_API.get_Speciality_List()
//                 const regionList = await Region_API.get_Region_List()
//                 setSpecialities(specialityList)
//                 setRegions(regionList)

//                 if (account?.speciality_id?._id && account?.region_id?._id) {
//                     const currentSpeciality = specialityList.find(
//                         (item) => item._id.toString() === account.speciality_id._id.toString()
//                     )
//                     const currentRegion = regionList.find(
//                         (item) => item._id.toString() === account.region_id._id.toString()
//                     )
//                     if (currentSpeciality) setSpeciality(currentSpeciality.name)
//                     if (currentRegion) setRegion(currentRegion.name)
//                 } else {
//                     Alert.alert("Vui lòng cập nhật thông tin chuyên khoa và khu vực.")
//                 }
//             } catch (error) {
//                 console.log("Lỗi khi tải dữ liệu:", error)
//             }
//         }
//         fetchData()
//         // console.log(bioDoctor);
//     }, [])

//     const handleUploadImage = async () => {
//         const image = await UploadImage()
//         if (image) {
//             setUriAvatar(image)
//         }
//     }

//     const handleSave = async () => {
//         setIsSaving(true)
//         try {
//             const selectedSpeciality = specialities.find((item) => item.name === speciality)
//             const selectedRegion = regions.find((item) => item.name === region)

//             // Kiểm tra nếu không tìm thấy
//             if (!selectedSpeciality && !selectedRegion) {
//                 Alert.alert("Thông báo", "Vui lòng cập nhật chuyên khoa và khu vực.")
//                 return
//             }
//             if (!selectedSpeciality) {
//                 Alert.alert("Thông báo", "Vui lòng cập nhật lĩnh vực chuyên môn.")
//                 return
//             }
//             if (!selectedRegion) {
//                 Alert.alert("Thông báo", "Vui lòng cập nhật khu vực.")
//                 return
//             }

//             const formData = new FormData()
//             formData.append("username", username)
//             formData.append("phone", phone)
//             formData.append("date_of_birth", date_of_birth)
//             formData.append("address", address)
//             if (uriAvatar) {
//                 formData.append("profile_image", {
//                     uri: uriAvatar,
//                     type: "image/jpeg",
//                     name: "avatar.jpg",
//                 })
//             }
//             const accountId = account._id

//             // Cập nhật thông tin tài khoản
//             const accountResponse = await Account_API.update_Account(accountId, formData)
//             if (!accountResponse) throw new Error("Cập nhật thông tin thất bại")

//             const doctor_bio = `GIỚI THIỆU\n${bioDoctor.introduction}\nQUÁ TRÌNH CÔNG TÁC\n${bioDoctor.workExperience}\nQUÁ TRÌNH HỌC TẬP\n${bioDoctor.education}`
//             // console.log(doctor_bio);

//             // Cập nhật thông tin bác sĩ
//             const doctorResponse = await Account_API.update_Doctor_Info(accountId, {
//                 speciality: selectedSpeciality.name,
//                 region: selectedRegion.name,
//                 bio: doctor_bio,
//             })

//             if (!doctorResponse) throw new Error("Cập nhật thông tin bác sĩ thất bại")
//             // Cập nhật thông tin account (không xử lý trường proof ở đây)
//             setAccount((prev) => ({
//                 ...prev,
//                 ...accountResponse,
//                 bio: doctor_bio,
//                 speciality_id: selectedSpeciality,
//                 region_id: selectedRegion,
//             }))

//             // Tải lên minh chứng (nếu có) nhưng không bắt buộc
//             if (proofDoctor?.uri) {
//                 const upload = await Account_API.upload_Doctor_Proof(accountId, proofDoctor)
//                     .then((response) => {
//                         if (!response?._id) throw new Error("Upload minh chứng thất bại")
//                         setAccount((prev) => ({
//                             ...prev,
//                             proof: response.proof,
//                         }))
//                     })
//                     .catch((error) => {
//                         console.warn("Lỗi tải minh chứng:", error.message)
//                         Alert.alert(
//                             "Cảnh báo",
//                             "Không thể tải lên minh chứng. Thông tin khác đã được cập nhật."
//                         )
//                     })
//             }

//             Alert.alert("Thành công", "Thông tin bác sĩ đã được cập nhật.")
//             navigation.goBack()
//         } catch (error) {
//             console.log("Lỗi trong handleSave:", error.message)
//             Alert.alert("Lỗi", error.message || "Không thể cập nhật thông tin.")
//         } finally {
//             setIsSaving(false)
//         }
//     }

//     const onDateChange = (event, selectedDate) => {
//         const currentDate = selectedDate || date_of_birth
//         setShowDatePicker(false)

//         if (currentDate) {
//             setDateOfBirth(currentDate.toISOString())
//         }
//     }
//     // upload PDF
//     const [proofDoctor, setProofDoctor] = useState(
//         account?.proof ? { name: "proof", uri: account?.proof } : null
//     )
//     const [isLoading, setLoading] = useState(false)

//     const handleUploadFile = async () => {
//         try {
//             setLoading(true)
//             const pdf = await UploadPDF()
//             if (pdf && pdf !== "isLoading") {
//                 if (pdf.size > MAX_UPLOAD_SIZE) {
//                     Alert.alert("Lỗi", "Kích thước file vượt quá giới hạn cho phép.")
//                 } else {
//                     setProofDoctor(pdf)
//                 }
//             }
//         } catch (error) {
//             Alert.alert("Lỗi", "Không thể tải file. Vui lòng thử lại.")
//         } finally {
//             setLoading(false)
//         }
//     }

//     const handleRemoveFile = () => {
//         setProofDoctor(null)
//     }

//     return (
//         <SafeAreaView style={styles.container}>
//             <HeaderBack navigation={navigation} title="Chỉnh Sửa Thông Tin Bác Sĩ" />
//             <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
//                 <View style={styles.myAvatar}>
//                     <View>
//                         <Image
//                             source={
//                                 uriAvatar
//                                     ? { uri: uriAvatar }
//                                     : account?.profile_image
//                                     ? { uri: account.profile_image }
//                                     : images.user_default
//                             }
//                             style={styles.image}
//                         />
//                     </View>
//                     <TouchableOpacity
//                         activeOpacity={0.7}
//                         onPress={handleUploadImage}
//                         style={styles.uploadAvatar}>
//                         <MaterialIcons name="photo-camera" size={22} color={COLORS.gray} />
//                     </TouchableOpacity>
//                     <TouchableOpacity
//                         activeOpacity={0.7}
//                         onPress={() => navigation.navigate("UpdateOther")}
//                         style={styles.leftButton}>
//                         <Feather name="edit-2" size={18} color={COLORS.gray} />
//                     </TouchableOpacity>
//                 </View>

//                 <View style={styles.form}>
//                     <Text style={styles.label}>Username</Text>
//                     <TextInput style={styles.input} value={username} onChangeText={setUserName} />

//                     <Text style={styles.label}>Số Điện Thoại</Text>
//                     <TextInput
//                         style={styles.input}
//                         value={phone}
//                         onChangeText={setPhoneNumber}
//                         keyboardType="phone-pad"
//                     />

//                     <Text style={styles.label}>Ngày sinh</Text>
//                     <TouchableOpacity onPress={() => setShowDatePicker(true)}>
//                         <TextInput
//                             style={styles.input}
//                             value={
//                                 date_of_birth ? new Date(date_of_birth).toLocaleDateString() : ""
//                             }
//                             editable={false}
//                         />
//                     </TouchableOpacity>
//                     {showDatePicker && (
//                         <DateTimePicker
//                             value={date_of_birth ? new Date(date_of_birth) : new Date()}
//                             mode="date"
//                             display="default"
//                             onChange={onDateChange}
//                         />
//                     )}

//                     <Text style={styles.label}>Địa chỉ</Text>
//                     <TextInput style={styles.input} value={address} onChangeText={setAddress} />

//                     <Text style={styles.label}>Lĩnh vực chuyên môn</Text>
//                     <Dropdown
//                         data={specialities || []}
//                         placeholder="Chọn chuyên khoa"
//                         onChange={(item) => setSpeciality(item.name)}
//                         value={specialities.find((item) => item.name === speciality) || null}
//                         onFocus={() => setOpenedDropdown("speciality")}
//                         expanded={openedDropdown === "speciality"}
//                         setExpanded={setOpenedDropdown}
//                     />

//                     <Text style={styles.label}>Khu vực</Text>
//                     <Dropdown
//                         data={regions || []}
//                         placeholder="Chọn khu vực"
//                         onChange={(item) => setRegion(item.name)}
//                         value={regions.find((item) => item.name === region) || null}
//                         onFocus={() => setOpenedDropdown("region")}
//                         expanded={openedDropdown === "region"}
//                         setExpanded={setOpenedDropdown}
//                     />

//                     <View style={styles.section}>
//                         <Text style={styles.sectionTitle}>Giới thiệu</Text>
//                         <TextInput
//                             style={styles.textarea}
//                             value={bioDoctor.introduction}
//                             onChangeText={(text) =>
//                                 setBioDoctor({ ...bioDoctor, introduction: text })
//                             }
//                             multiline
//                             placeholder="Giới thiệu về bác sĩ"
//                             textAlignVertical="top"
//                         />
//                     </View>

//                     <View style={styles.section}>
//                         <Text style={styles.sectionTitle}>Quá trình công tác</Text>
//                         <TextInput
//                             style={styles.textarea}
//                             value={bioDoctor.workExperience}
//                             onChangeText={(text) =>
//                                 setBioDoctor({ ...bioDoctor, workExperience: text })
//                             }
//                             multiline
//                             placeholder="Quá trình công tác của bác sĩ"
//                             textAlignVertical="top"
//                         />
//                     </View>

//                     <View style={styles.section}>
//                         <Text style={styles.sectionTitle}>Quá trình học tập</Text>
//                         <TextInput
//                             style={styles.textarea}
//                             value={bioDoctor.education}
//                             onChangeText={(text) => setBioDoctor({ ...bioDoctor, education: text })}
//                             multiline
//                             placeholder="Quá trình học tập của bác sĩ"
//                             textAlignVertical="top"
//                         />
//                     </View>

//                     <View style={styles.import}>
//                         <Text style={styles.label}>Minh chứng (nếu có)</Text>
//                         <TouchableOpacity
//                             onPress={() => handleUploadFile()}
//                             style={styles.buttonImport}>
//                             <Entypo name="upload" size={18} color={COLORS.gray} />
//                         </TouchableOpacity>
//                         {isLoading ? <ActivityIndicator size="large" color="#0000ff" /> : null}
//                     </View>

//                     {proofDoctor && (
//                         <View
//                             style={{
//                                 flexDirection: "row",
//                                 alignItems: "center",
//                                 width: "90%",
//                             }}>
//                             <Text style={{ fontSize: 20 }}>• </Text>
//                             <TouchableOpacity onPress={() => {}}>
//                                 <Text
//                                     numberOfLines={1}
//                                     style={{
//                                         textDecorationLine: "underline",
//                                         color: COLORS.blue,
//                                         marginEnd: 10,
//                                     }}>
//                                     {proofDoctor.name}
//                                 </Text>
//                             </TouchableOpacity>

//                             <TouchableOpacity onPress={() => handleRemoveFile()}>
//                                 <Ionicons name="close" size={24} color={COLORS.gray} />
//                             </TouchableOpacity>
//                         </View>
//                     )}
//                 </View>

//                 <TouchableOpacity
//                     style={styles.saveButton}
//                     onPress={() => handleSave()}
//                     disabled={isSaving}>
//                     <Text style={styles.saveButtonText}>
//                         {isSaving ? "Đang Lưu..." : "Lưu Thông Tin"}
//                     </Text>
//                 </TouchableOpacity>
//                 {isSaving && (
//                     <View style={styles.loadingContainer}>
//                         <ActivityIndicator size={48} color={COLORS.PersianGreen} />
//                     </View>
//                 )}
//             </ScrollView>
//         </SafeAreaView>
//     )
// }
// export default UpdateDoctor
// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: COLORS.white,
//     },
//     content: {
//         padding: 20,
//     },
//     myAvatar: {
//         width: 120,
//         aspectRatio: 1,
//         resizeMode: "cover",
//         borderRadius: 40,
//         marginRight: 5,
//         backgroundColor: COLORS.silver,
//         alignSelf: "center",
//         shadowColor: COLORS.black,
//         shadowOffset: { width: 0, height: 2 }, // Độ lệch bóng (x, y)
//         shadowOpacity: 0.3,
//         shadowRadius: 4,
//         elevation: 15,
//     },
//     image: {
//         width: "100%",
//         height: "100%",
//         borderRadius: 40,
//     },
//     textInput: {
//         height: 40,
//         borderColor: COLORS.gray,
//         borderWidth: 1,
//         marginBottom: 12,
//         paddingLeft: 8,
//     },
//     uploadAvatar: {
//         position: "absolute",
//         bottom: 1,
//         end: 1,
//         backgroundColor: COLORS.white,
//         padding: 2,
//         borderRadius: 999,
//     },
//     sectionTitle: {
//         color: COLORS.PersianGreen,
//         fontWeight: "bold",
//         marginTop: 5,
//         marginBottom: 1,
//     },
//     section: {
//         padding: 1,
//     },
//     leftButton: {
//         position: "absolute",
//         bottom: 1,
//         start: 1,
//         backgroundColor: COLORS.white,
//         padding: 4,
//         borderRadius: 999,
//         elevation: 0,
//     },
//     form: {
//         marginBottom: 20,
//         paddingBottom: 20,
//     },
//     label: {
//         marginBottom: 5,
//         color: COLORS.PersianGreen,
//         fontWeight: "bold",
//         fontSize: 15,
//     },
//     input: {
//         backgroundColor: COLORS.white,
//         padding: 10,
//         borderRadius: 20,
//         marginBottom: 10,
//         borderColor: COLORS.silver,
//         borderWidth: 1,
//     },
//     saveButton: {
//         backgroundColor: COLORS.PersianGreen,
//         paddingVertical: 15,
//         borderRadius: 8,
//         alignItems: "center",
//         marginTop: 20,
//     },
//     saveButtonText: {
//         color: COLORS.white,
//         fontSize: 16,
//         fontWeight: "bold",
//     },
//     textarea: {
//         backgroundColor: COLORS.white,
//         padding: 12,
//         borderRadius: 8,
//         marginBottom: 4,
//         borderColor: COLORS.silver,
//         borderWidth: 1,
//         height: 120,
//         marginTop: 5,
//     },
//     import: {
//         flexDirection: "row",
//         alignItems: "center",
//         marginTop: 10,
//     },
//     loadingContainer: {
//         marginTop: 20,
//         alignItems: "center",
//     },
//     buttonImport: {
//         width: 30,
//         height: 30,
//         backgroundColor: COLORS.silver,
//         alignItems: "center",
//         justifyContent: "center",
//         borderRadius: 10,
//         marginLeft: 15,
//     },
// })
