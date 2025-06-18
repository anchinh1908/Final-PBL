import React, { useEffect, useRef } from "react"
import { View, Animated, StyleSheet } from "react-native"
import { COLORS } from "../constants"

const Waveform = () => {
    const bars = Array.from({ length: 26 }).map(
        () => useRef(new Animated.Value(5)).current
    )

    const animate = () => {
        bars.forEach((bar, i) => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(bar, {
                        toValue: Math.random() * 30 + 10,
                        duration: 300,
                        useNativeDriver: false,
                    }),
                    Animated.timing(bar, {
                        toValue: 5,
                        duration: 300,
                        useNativeDriver: false,
                    }),
                ])
            ).start()
        })
    }

    useEffect(() => {
        animate()
    }, [])

    return (
        <View style={styles.container}>
            {bars.map((bar, index) => (
                <Animated.View
                    key={index}
                    style={[styles.bar, { height: bar }]}
                />
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        height: 38,
        alignItems: "center",
        marginHorizontal: 16,
    },
    bar: {
        width: 4,
        backgroundColor: COLORS.sunsetOrange,
        marginHorizontal: 2,
        borderRadius: 2,
    },
})

export default Waveform
