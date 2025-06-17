import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { COLORS } from "../constants"

const RadioView = ({ options, selectedOption, onSelect, textColor, setMessage }) => {
    return (
        <View style={styles.radioContainer}>
            {options.map((option, index) => (
                <TouchableOpacity
                    disabled={option.status === "unavailable"}
                    key={option.value}
                    style={[
                        styles.radioButton,
                        selectedOption &&
                            selectedOption.value === option.value &&
                            styles.selectedButton,
                        index !== options.length - 1 && { marginBottom: 8 },
                        option?.status === "unavailable" && {
                            backgroundColor: COLORS.gray,
                        },
                    ]}
                    onPress={() => {
                        if (option.status === "available") {
                            onSelect(option)
                            if (setMessage) setMessage(null)
                        }
                    }}>
                    <Text
                        style={[
                            styles.text,
                            { color: textColor },
                            selectedOption &&
                                selectedOption.value === option.value &&
                                styles.selectedText,
                            option?.status === "unavailable" && { color: COLORS.black },
                        ]}>
                        {option.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    )
}

export default RadioView

const styles = StyleSheet.create({
    radioButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: COLORS.silver,
        height: 35,
        borderRadius: 999,
    },
    radioContainer: {
        // flexDirection: "row",
        // justifyContent: "space-between",
    },
    selectedButton: {
        backgroundColor: COLORS.PersianGreen,
        borderColor: COLORS.silver,
    },
    text: {
        flex: 1,
        padding: 3,
        textAlign: "center",
    },
    selectedText: {
        flex: 1,
        color: COLORS.white,
        fontWeight: "bold",
        textAlign: "center",
    },
})
