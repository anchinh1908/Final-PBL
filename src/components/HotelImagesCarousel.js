import { useRef, useState } from "react"
import { Image, StyleSheet, View } from "react-native"
import Carousel from "react-native-reanimated-carousel"
import { windowWidth } from "../utils/Dimentions"
import { COLORS } from "../constants"
import HeaderBack from "./HeaderBack"
import { useNavigation } from "@react-navigation/native"

const HotelImagesCarousel = ({ images }) => {
    const navigation = useNavigation()
    const carouselRef = useRef(null)
    const [currentIndex, setCurrentIndex] = useState(0)

    return (
        <View style={styles.container}>
            <View style={{ position: "absolute", top: 0, zIndex: 1000, marginHorizontal: 12 }}>
                <HeaderBack navigation={navigation} color={COLORS.creamyIvory} />
            </View>
            <Carousel
                ref={carouselRef}
                loop={false}
                width={windowWidth}
                height={windowWidth}
                autoPlay={false}
                data={images}
                onSnapToItem={setCurrentIndex}
                renderItem={({ item }) => (
                    <Image source={{ uri: item }} style={styles.carouselImage} />
                )}
            />

            <View style={styles.paginationContainer}>
                {images.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            index === currentIndex ? styles.activeDot : styles.inactiveDot,
                        ]}
                    />
                ))}
            </View>
        </View>
    )
}

export default HotelImagesCarousel

const styles = StyleSheet.create({
    container: {
        position: "relative",
    },
    carouselImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    paginationContainer: {
        position: "absolute",
        bottom: 10,
        width: "100%",
        flexDirection: "row",
        justifyContent: "center",
        zIndex: 10,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 5,
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: COLORS.sunsetOrange,
    },
    inactiveDot: {
        backgroundColor: COLORS.pureWhite,
        opacity: 0.4,
    },
})

{
    /* <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ marginVertical: 10, paddingHorizontal: 8, zIndex: 10 }}>
                {images.map((item, index) => (
                    <TouchableOpacity key={index} onPress={() => onPressThumbnail(index)}>
                        <Image
                            source={{ uri: item }}
                            style={{
                                width: 60,
                                height: 45,
                                borderRadius: 8,
                                marginRight: 8,
                                borderWidth: index === currentIndex ? 2 : 0,
                                borderColor: index === currentIndex ? "orange" : "transparent",
                            }}
                        />
                    </TouchableOpacity>
                ))}
            </ScrollView> */
}
