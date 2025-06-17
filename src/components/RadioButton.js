import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { COLORS } from "../constants"

const RadioButton = ({ options, selectedOption, onSelect, onFocus }) => {
    return (
        <View style={styles.radioContainer}>
            {options.map((option) => (
                <TouchableOpacity
                    key={option.value}
                    style={styles.radioButton}
                    onPress={() => {
                        onSelect(option.value), onFocus()
                    }}>
                    <View style={styles.outerCircle}>
                        {selectedOption === option.value && <View style={styles.innerCircle} />}
                    </View>
                    <Text style={styles.optionText}>{option.label}</Text>
                </TouchableOpacity>
            ))}
        </View>
    )
}

export default RadioButton

const styles = StyleSheet.create({
    radioButton: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 10,
    },
    outerCircle: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: COLORS.slateGray,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
    },
    innerCircle: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: COLORS.coralBlaze,
    },
    radioContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
})
