import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native"
import RBSheet from "react-native-raw-bottom-sheet"
import { COLORS } from "../constants"
import { Checkbox } from "react-native-paper"
import Slider from "@react-native-community/slider"
import NumberInput from "./NumberInput"
import { windowHeight } from "../utils/Dimentions"
import { facilities } from "../utils/facilities"

const minSlider = 100000
const midSlider = 2000000
const maxSlider = 4000000

const HotelBottomSheet = ({
    bottomSheetRef,
    amenities,
    setAmenities,
    budget,
    setBudget,
    bedroom,
    setBedroom,
    quality,
    setQuality,
    onClose,
}) => {
    const handleAmenitiesChange = (item) => {
        setAmenities((prev) =>
            prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
        )
    }

    const handleQualitiesChange = (item) => {
        setQuality((prev) => item !== prev ? item : 0)
    }

    return (
        <RBSheet
            ref={bottomSheetRef}
            openDuration={200}
            closeOnPressBack={true}
            closeOnPressMask={true}
            dragOnContent={false}
            draggable={true}
            onClose={onClose}
            customStyles={{
                wrapper: {
                    backgroundColor: COLORS.shadowBlack,
                },
                draggableIcon: {
                    backgroundColor: COLORS.silver,
                    width: 50,
                },
                container: {
                    borderTopLeftRadius: 30,
                    borderTopRightRadius: 30,
                    height: windowHeight * 0.8,
                },
            }}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Tiện nghi</Text>
                {facilities.map((item, idx) => (
                    <View key={idx} style={styles.checkboxRow}>
                        <Checkbox
                            status={amenities.includes(item) ? "checked" : "unchecked"}
                            onPress={() => handleAmenitiesChange(item)}
                            color={COLORS.oceanSlate}
                            uncheckedColor={COLORS.slateGray}
                        />
                        <Text>{item}</Text>
                    </View>
                ))}

                <Text style={styles.sectionTitle}>Ngân sách mỗi đêm</Text>
                <Text>
                    VND {budget[0].toLocaleString()} - VND {budget[1].toLocaleString()}
                </Text>
                <Slider
                    style={{ marginBottom: 8, marginHorizontal: -10 }}
                    minimumValue={minSlider}
                    maximumValue={midSlider}
                    step={minSlider}
                    value={budget[0]}
                    thumbTintColor={COLORS.oceanSlate}
                    maximumTrackTintColor={COLORS.oceanSlate}
                    minimumTrackTintColor={COLORS.oceanSlate}
                    onValueChange={(value) => setBudget([value, budget[1]])}
                />
                <Slider
                    style={{ marginHorizontal: -10 }}
                    minimumValue={midSlider}
                    maximumValue={maxSlider}
                    step={minSlider}
                    value={budget[1]}
                    thumbTintColor={COLORS.oceanSlate}
                    maximumTrackTintColor={COLORS.oceanSlate}
                    minimumTrackTintColor={COLORS.oceanSlate}
                    onValueChange={(value) => setBudget([budget[0], value])}
                />

                <Text style={styles.sectionTitle}>Số lượng khách/phòng</Text>
                <View style={styles.rowBetween}>
                    <Text>Số khách</Text>
                    <NumberInput count={bedroom} setCount={setBedroom} />
                </View>
                {/* <View style={styles.rowBetween}>
                    <Text>Phòng tắm</Text>
                    <NumberInput count={bathroom} setCount={setBathroom} />
                </View> */}

                <Text style={styles.sectionTitle}>Xếp hạng chỗ ngủ</Text>
                {[3, 4, 5].map((item) => (
                    <View key={item} style={styles.checkboxRow}>
                        <Checkbox
                            status={quality === item ? "checked" : "unchecked"}
                            onPress={() => handleQualitiesChange(item)}
                            color={COLORS.oceanSlate}
                            uncheckedColor={COLORS.slateGray}
                        />
                        <Text>{item} sao</Text>
                    </View>
                ))}
            </ScrollView>
        </RBSheet>
    )
}

export default HotelBottomSheet

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: COLORS.pureWhite,
    },
    sectionTitle: {
        fontWeight: "bold",
        fontSize: 18,
        marginVertical: 12,
    },
    checkboxRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
        paddingRight: 1,
    },
})
