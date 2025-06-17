import { StyleSheet, TextInput, View } from "react-native"
import { COLORS } from "../constants"
import Ionicons from "@expo/vector-icons/Ionicons"
import { useCallback, useState } from "react"

const InputPassword = ({ value, onChangeText, onFocus }) => {
    const [isShow, setShow] = useState(false)

    const toggleShowed = useCallback(() => {
        setShow(!isShow)
    }, [isShow])

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                secureTextEntry={!isShow}
                value={value}
                onChangeText={onChangeText}
                onFocus={onFocus}
            />
            <Ionicons
                onPress={toggleShowed}
                name={isShow ? "eye" : "eye-off"}
                size={20}
                color={COLORS.silver}
                style={{ marginEnd: 10 }}
            />
        </View>
    )
}

export default InputPassword

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.silver,
        borderRadius: 999,
    },
    textInput: {
        paddingVertical: 10,
        paddingStart: 14,
        flex: 1,
    },
})
