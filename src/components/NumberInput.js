import React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { MaterialIcons } from "@expo/vector-icons" // hoặc dùng @react-native-vector-icons nếu không dùng Expo
import { COLORS } from "../constants"

const NumberInput = ({ count, setCount, min = 0 }) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.button, count <= min && styles.disabledButton]}
                onPress={() => {
                    if (count > min) setCount((c) => Math.max(min, c - 1))
                }}
                disabled={count <= min}>
                <MaterialIcons name="remove" size={20} color={count <= min ? COLORS.silver : COLORS.deepBlack} />
            </TouchableOpacity>
            <Text style={styles.count}>{count}</Text>
            <TouchableOpacity style={styles.button} onPress={() => setCount((c) => c + 1)}>
                <MaterialIcons name="add" size={20} color={COLORS.deepBlack} />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        borderWidth: 1,
        borderColor: COLORS.silver,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    button: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: COLORS.creamyIvory,
    },
    disabledButton: {
        backgroundColor: COLORS.silverMist,
    },
    count: {
        fontSize: 16,
        marginHorizontal: 8,
    },
})

export default NumberInput
