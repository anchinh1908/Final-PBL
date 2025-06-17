import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { MaterialIcons } from "@expo/vector-icons" // dùng ✔ icon
import { COLORS } from "../constants"

const Section = ({ title, items }) => {
    return (
        <View style={styles.sectionContainer}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.list}>
                {items.map((item, index) => (
                    <View key={index} style={styles.listItem}>
                        <MaterialIcons name="check" size={16} color={COLORS.oceanSlate} style={styles.icon} />
                        <Text style={styles.itemText}>{item}</Text>
                    </View>
                ))}
            </View>

            <View style={{ borderBottomWidth: 1, marginTop: 12, borderColor: COLORS.silver }} />
        </View>
    )
}

const styles = StyleSheet.create({
    sectionContainer: {
        marginBottom: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        color: COLORS.slateGray,
    },
    list: {
        marginTop: 8,
    },
    listItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 4,
    },
    icon: {
        marginRight: 8,
    },
    itemText: {
        color: COLORS.slateGray,
        fontSize: 14,
    },
})

export default Section
