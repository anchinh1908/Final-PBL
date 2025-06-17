import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { HeaderBack } from "../components"
import HotelItem from "../components/HotelItem"
import { COLORS } from "../constants"
import { useNavigation } from "@react-navigation/native"
import { useState } from "react"
import FontAwesome6 from "@expo/vector-icons/FontAwesome6"
import useMyWishlistContext from "../hooks/useMyWishlistContext"
import { delete_My_Wishlist } from "../API/Wishlist_API"
import AsyncStorage from "@react-native-async-storage/async-storage"

const MyWishlist = () => {
    const navigation = useNavigation()
    const { myWishlists, dispatch } = useMyWishlistContext()
    const [myWishlist, setMyWishlist] = useState(
        myWishlists?.map((item) => ({
            ...item,
            checked: false,
        }))
    )
    const [selecting, setSelecting] = useState(false)

    const toggleCheckbox = (id) => {
        console.log("id: ", id)
        setMyWishlist((prevItems) =>
            prevItems.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
        )
    }

    const deleteMyWishlist = async (token, hotel) => {
        try {
            const result = await delete_My_Wishlist(token, hotel.id)
            if (result) {
                dispatch({
                    type: "DELETE_MYWISHLIST",
                    payload: hotel,
                })

                setMyWishlist((prev) => prev.filter((item) => item.id !== hotel.id))
            }
        } catch (error) {
            Alert.alert("Lỗi", error.message || "Không thể xóa khách sạn khỏi danh sách yêu thích.")
        }
    }

    const handleWishlist = async () => {
        try {
            const selectedItems = myWishlist.filter((item) => item.checked)
            if (selectedItems.length === 0) {
                Alert.alert("Thông báo", "Vui lòng chọn khách sạn để xóa.")
                return
            }

            const token = await AsyncStorage.getItem("token")
            if (!token) {
                Alert.alert("Lỗi", "Không tìm thấy token. Vui lòng đăng nhập lại.")
                return
            }
            const allPromises = selectedItems.map((item) => deleteMyWishlist(token, item))

            await Promise.all(allPromises)
            Alert.alert("Thành công", "Đã xóa các khách sạn được chọn khỏi danh sách yêu thích.")

            if (selectedItems.length === myWishlist.length) {
                setSelecting(false)
            }
        } catch (error) {
            Alert.alert("Lỗi", error.message || "Có lỗi xảy ra khi xóa danh sách yêu thích.")
        }
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <HeaderBack navigation={navigation} />

            <View style={styles.headerContainer}>
                <Text style={styles.sectionTitle}>Khách sạn đã lưu</Text>
                {myWishlist.length > 0 && (
                    <View style={styles.headerActions}>
                        {selecting && (
                            <TouchableOpacity
                                onPress={() =>
                                    Alert.alert(
                                        "Xác nhận",
                                        "Bạn có chắc chắn muốn xóa các khách sạn đã chọn?",
                                        [
                                            { text: "Hủy", style: "cancel" },
                                            {
                                                text: "Xóa",
                                                onPress: async () => {
                                                    await handleWishlist()
                                                },
                                            },
                                        ]
                                    )
                                }
                                style={styles.removeButton}>
                                <Text style={styles.removeButtonText}>Bỏ lưu</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            onPress={() => {
                                if (selecting) {
                                    setMyWishlist((prev) =>
                                        prev.map((item) => ({ ...item, checked: false }))
                                    )
                                }
                                setSelecting(!selecting)
                            }}>
                            <Text style={styles.seeAll}>{selecting ? "Huỷ" : "Chọn"}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
            {myWishlist.map((item) => (
                <View style={styles.itemRow} key={item?.id}>
                    {selecting && (
                        <TouchableOpacity
                            onPress={() => toggleCheckbox(item?.id)}
                            style={styles.checkbox}>
                            {item?.checked ? (
                                <FontAwesome6 name="check" size={15} color={COLORS.oceanSlate} />
                            ) : null}
                        </TouchableOpacity>
                    )}

                    <View style={{ flex: 1 }}>
                        <HotelItem item={{ hotel: item }} />
                    </View>
                </View>
            ))}

            {myWishlist.length === 0 && <Text>Chưa lưu khách sạn nào</Text>}

            <View style={{ marginBottom: 32 }} />
        </ScrollView>
    )
}

export default MyWishlist

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: COLORS.pureWhite,
    },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.clear,
        marginBottom: 12,
    },
    seeAll: {
        fontSize: 14,
        color: COLORS.oceanSlate,
        fontWeight: "600",
    },
    sectionTitle: {
        fontWeight: "bold",
        fontSize: 18,
    },
    headerActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 12,
        alignItems: "center",
    },
    removeButton: {
        backgroundColor: COLORS.coralBlaze,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
    },
    removeButtonText: {
        color: COLORS.pureWhite,
        fontWeight: "bold",
    },
    itemRow: {
        flexDirection: "row",
        gap: 8,
    },
    checkbox: {
        height: 20,
        width: 20,
        borderWidth: 1,
        marginTop: 20,
        borderRadius: 3,
        borderColor: COLORS.oceanSlate,
        alignItems: "center",
        justifyContent: "center",
    },
})
