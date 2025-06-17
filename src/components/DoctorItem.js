import { Alert, Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { COLORS, images } from "../constants"
import AntDesign from "@expo/vector-icons/AntDesign"
import { useEffect } from "react"
import { useAuth } from "../AuthProvider"
import { splitText } from "../utils/splitText"

const DoctorItem = ({ item, navigation }) => {
    // useEffect(() => console.log(item));
    const { isLoggedIn, account } = useAuth()
    return (
        <View style={styles.doctorContainer} key={item._id}>
            <Pressable
                style={styles.imageContainer}
                onPress={() => {
                    navigation.navigate("DoctorInfo", { doctorSelected: item })
                }}>
                <Image
                    source={
                        item.profile_image ? { uri: item.profile_image } : images.doctor_default
                    }
                    style={styles.image}
                />
            </Pressable>
            <View style={styles.infoContainer}>
                <Pressable
                    onPress={() => {
                        navigation.navigate("DoctorInfo", { doctorSelected: item })
                    }}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.email}>{item.email}</Text>
                    <Text style={styles.position} numberOfLines={2} ellipsizeMode="tail">
                        {splitText(item.bio).introduction}
                    </Text>
                </Pressable>

                {account?.__t !== "Doctor" && (
                    <TouchableOpacity
                        onPress={() => {
                            if (isLoggedIn && account?.email)
                                navigation.navigate("Booking", { doctorSelected: item })
                            else {
                                Alert.alert(
                                    "Thông báo",
                                    "Bạn cần đăng nhập để tiếp tục thao tác!",
                                    [
                                        {
                                            text: "Để sau",
                                            style: "cancel",
                                        },
                                        {
                                            text: "OK",
                                            onPress: () => navigation.navigate("Login"),
                                        },
                                    ]
                                )
                            }
                        }}
                        style={styles.makeAppointment}>
                        <AntDesign name="calendar" size={24} color={COLORS.PersianGreen} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    )
}

export default DoctorItem

const styles = StyleSheet.create({
    doctorContainer: {
        flex: 1,
        flexDirection: "row",
        padding: 15,
        backgroundColor: COLORS.white,
        borderRadius: 10,
        elevation: 2,
    },
    imageContainer: {
        width: 80,
        height: 80,
        marginEnd: 10,
    },
    image: {
        width: 80,
        height: 80,
        resizeMode: "cover",
        borderRadius: 15,
        marginEnd: 10,
        borderWidth: 1,
        borderColor: COLORS.PersianGreen,
        borderRadius: 999,
    },
    name: {
        fontSize: 16,
        fontWeight: "bold",
    },
    position: {
        height: 40,
        fontSize: 13,
        textAlign: "justify",
        color: COLORS.PersianGreen,
    },
    infoContainer: {
        flex: 1,
    },
    makeAppointment: {
        alignItems: "flex-end",
        alignSelf: "flex-end",
        // marginEnd: 5,
    },
    email: {
        color: COLORS.gray,
        marginVertical: 5,
    },
})
