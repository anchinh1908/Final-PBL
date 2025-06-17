import { useNavigation } from "@react-navigation/native"
import { ScrollView, StyleSheet, Text, View } from "react-native"
import { HeaderBack } from "../components"
import PlaceItem from "../components/PlaceItem"
import { COLORS } from "../constants"

const places = [
    {
        id: 1,
        title: "Ngũ Hành Sơn",
        rating: 4.3,
        img: "https://lh3.googleusercontent.com/p/AF1QipPnm-xetnxBKa3Yg9K0TSB2Zy_igKzSatAeFYvC=w408-h306-k-no",
        slug: "ngu-hanh-son",
    },
    {
        id: 2,
        title: "Bảo tàng Điêu khắc Chăm Đà Nẵng",
        rating: 4.2,
        img: "https://lh3.googleusercontent.com/gps-cs-s/AB5caB-o7OdXQucqWOyax_rHCoYj3mNICGxTWHvSfVlBNVcqmBlE0cO7F_3u3u3keQadSAmlgtc8Q0J9QrRY9WlJ8Vxvw56rW1AjVC5YFjVKBZ3QmsqUyYHQBDyHmFBG-n-I6XhjlSAZmA=w408-h272-k-no",
        slug: "bao-tang-ieu-khac-cham-a-nang",
    },
    {
        id: 3,
        title: "Ba Na Hills",
        rating: 4.4,
        img: "https://lh3.googleusercontent.com/gps-cs-s/AB5caB8F5f264OaPwbGmE--Mh_mAUe6wUk5AhmILN1Njkvag3CdKSDbP_3R4sktPacuyw9GgPwm9q1U6Fx2r5bsIwgnwDWv0ZyRbeu9amB6jWEVONKl6GWr6WTqMVWDfuA_XASuMmkKFeg=w426-h240-k-no",
        slug: "ba-na-hills",
    },
    {
        id: 4,
        title: "DA NANG DOWNTOWN",
        rating: 4.4,
        img: "https://lh3.googleusercontent.com/gps-cs-s/AB5caB8MFjovKRqnIbYur3H6tgSdA8fVYdWTz67dOwjA3iUdZJMkkAu_ff8-updgVR9VLeVOjJrY9qdQ85YpDVz0U5jA8SwInwQFvdZAB4d3mD2Ba9zvJpyH2AMBZ-Jk6vG5ZRXM_D_v=w426-h240-k-no",
        slug: "da-nang-downtown",
    },
    {
        id: 5,
        title: "Cầu Rồng",
        rating: 4.5,
        img: "https://lh3.googleusercontent.com/gps-cs-s/AB5caB-ufqveOL-MDYDFin4InYK-OF0u-2nCfVzga4pyPQ9rtgINu_p4PYGlS79Hxce5hpaHhTkCnxdnAaVh-GcW7nx10bU-xchzPsjJnP0cDylcwMtDRL88XurhRiTx29lohHdd1ahbBjkRJFs=w408-h272-k-no",
        slug: "cau-rong",
    },
    {
        id: 6,
        title: "Cầu Vàng",
        rating: 4.6,
        img: "https://lh3.googleusercontent.com/gps-cs-s/AB5caB95ZkgqS8XxSf6JSva2y9xc9b-TDdUT-abJ8O6h0PpWljcDehf0fQLD0PXf4Il3SaLNgj8E0dHnt03brp4FSpCVShSgoLUOLMxJeL2cvNMi1Tq1Vg0V4_zigpPJ7oWIgU-cK6Af=w426-h240-k-no",
        slug: "cau-vang",
    },
    {
        id: 7,
        title: "Du lịch Đà nẵng Hội an",
        rating: 4.5,
        img: "https://lh3.googleusercontent.com/gps-cs-s/AB5caB_7BizyXgyho2x5rvkm25QnJDutdZn3Fm9SKLZM8TrgmX27xVVVkCGCu4cBe4vzRglFkt1hMPE_y_xbttovvUsP-rf1r99kEcES9v3KyhN_Qjqa_gwnoZXMDMykRESl2ZQCZiMz3g=w408-h544-k-no",
        slug: "du-lich-a-nang-hoi-an",
    },
    {
        id: 8,
        title: "Tượng Cá Chép Hóa Rồng",
        rating: 4.5,
        img: "https://lh3.googleusercontent.com/gps-cs-s/AB5caB_ZHM2G3WNZB_-xF4JC9XBXxyTwKOXKS2RLXztqXN1cKWjLmSGbmX8DAOaxRIofqMzdYNnMCC2dUoh3OXDdQVwRkG1MuNrMcPN10ZitbEJSqdEjYxmEc157KZ2thUaYWHi73MF8=w408-h544-k-no",
        slug: "tuong-ca-chep-hoa-rong",
    },
    {
        id: 9,
        title: "Bảo tàng 3D Art In Paradise",
        rating: 4.3,
        img: "https://lh3.googleusercontent.com/p/AF1QipOYrxPILxrQwRB1wVfFFoRPxf1TopAUjI6BVs1H=w408-h272-k-no",
        slug: "bao-tang-3d-art-in-paradise",
    },
    {
        id: 10,
        title: "Làng Bích họa Đà Nẵng",
        rating: 4.0,
        img: "https://lh3.googleusercontent.com/gps-cs-s/AB5caB-47HlgNrl2rOrPeuu6ZvBO6xv2co-e-VjgmC89sFiiG1F4I0K2hV7i4uull86n0XM2t2srrB1ApCrHbP-HubbwatLneCx2iLrr80YSLjAwR0UPwEXRUbmHAyufSC2xE0X2A3aM=w408-h271-k-no",
        slug: "lang-bich-hoa-a-nang",
    },
    {
        id: 11,
        title: "Bảo tàng Đà Nẵng",
        rating: 4.0,
        img: "https://lh3.googleusercontent.com/gps-cs-s/AB5caB_QAP5LoXiWGzKZqPNlRFldN9akYOet6rExEgqJmf3NOvzQsc8GagPztUghfpx1XfTyY7-uDjkbt4ZPL7C9_E5XjW7DMiFSAX88dlg9at30w7cRrL1GGo5spml6CuOMYZvhI35V=w408-h272-k-no",
        slug: "bao-tang-a-nang",
    },
]

const PlaceHistory = () => {
    const navigation = useNavigation()
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* <HeaderBack navigation={navigation} title="Địa điểm đã xem" /> */}
            <Text style={styles.sectionTitle}>Địa điểm đã xem</Text>
            <View style={styles.grid}>
                {places.map((item) => (
                    <PlaceItem
                        key={item.id}
                        item={item}
                        onPress={() => navigation.navigate("PlaceDetail", { slug: item.slug })}
                    />
                ))}
            </View>

            <View style={{ marginBottom: 32 }} />
        </ScrollView>
    )
}

export default PlaceHistory

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: COLORS.pureWhite,
    },
    grid: {
        flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 12,
    },
    sectionTitle: {
        fontWeight: "bold",
        textAlign: "center",
        fontSize: 20,
        marginTop: 28,
        marginBottom: 12,
        color: COLORS.oceanSlate,
    },
})
