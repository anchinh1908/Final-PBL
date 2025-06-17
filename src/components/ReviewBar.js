import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { COLORS } from "../constants"

const ReviewBar = ({ label, score }) => {
    const maxScore = 10
    const percentage = (score / maxScore) * 100

    const getReviewColor = (score) => {
        if (score < 6) return COLORS.coralBlaze
        if (score === 10) return COLORS.oceanSlate
        return COLORS.aquaMist
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.score}>{score.toFixed(1).replace(".", ",")}</Text>
            </View>

            <View style={styles.barBackground}>
                <View
                    style={[
                        styles.barFill,
                        {
                            width: `${percentage}%`,
                            backgroundColor: getReviewColor(score),
                        },
                    ]}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
    },
    score: {
        fontSize: 14,
        fontWeight: "500",
    },
    barBackground: {
        width: "100%",
        height: 8,
        backgroundColor: COLORS.silverMist,
        borderRadius: 999,
        overflow: "hidden",
    },
    barFill: {
        height: 10,
        borderRadius: 999,
    },
})

export default ReviewBar
