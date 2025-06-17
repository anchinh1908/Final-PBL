import { StyleSheet, Text, ScrollView } from "react-native"
import { HeaderBack } from "../components"
import { COLORS } from "../constants"
import { SafeAreaView } from "react-native-safe-area-context"

const Privacy = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <HeaderBack navigation={navigation} title="Chính sách riêng tư" />
            <ScrollView style={styles.content}>
                <Text style={styles.updateText}>Cập nhật lần cuối: 14/08/2024</Text>
                <Text style={styles.paragraph}>
                    Chúng tôi cam kết bảo vệ sự riêng tư của khách hàng. Chính sách này giải thích
                    cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn khi sử dụng
                    dịch vụ của chúng tôi.
                </Text>
                <Text style={styles.sectionTitle}>Điều Khoản & Điều Kiện</Text>
                <Text style={styles.paragraph}>
                    1. Thông tin cá nhân của bạn sẽ được thu thập chỉ khi cần thiết cho việc cung
                    cấp dịch vụ. Chúng tôi cam kết không chia sẻ thông tin này cho bên thứ ba mà
                    không có sự đồng ý của bạn.
                </Text>
                <Text style={styles.paragraph}>
                    2. Bạn có quyền truy cập và sửa đổi thông tin cá nhân bất kỳ lúc nào. Chúng tôi
                    sẽ hỗ trợ bạn trong việc cập nhật hoặc xóa thông tin nếu có yêu cầu.
                </Text>
                <Text style={styles.paragraph}>
                    3. Chúng tôi sử dụng các biện pháp bảo mật tiêu chuẩn để bảo vệ thông tin cá
                    nhân của bạn khỏi truy cập trái phép, sử dụng hoặc tiết lộ.
                </Text>
                <Text style={styles.paragraph}>
                    4. Chính sách này có thể được cập nhật để phản ánh sự thay đổi trong quy định
                    hoặc dịch vụ của chúng tôi. Bạn nên kiểm tra lại định kỳ để nắm rõ các thay đổi.
                </Text>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    mainContainer: {
        flex: 1,
        margin: 20,
    },
    content: {
        padding: 20,
    },
    updateText: {
        fontSize: 14,
        color: COLORS.gray,
        marginBottom: 10,
    },
    paragraph: {
        fontSize: 16,
        color: COLORS.black,
        lineHeight: 24,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: COLORS.PersianGreen,
        marginVertical: 10,
    },
})

export default Privacy
