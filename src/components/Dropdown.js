import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useCallback, useEffect, useState } from "react"
import { COLORS } from "../constants"
import Entypo from "@expo/vector-icons/Entypo"

const Dropdown = ({
    data,
    onChange,
    onFocus,
    placeholder,
    disabled,
    value,
    expanded, // Kiểm tra trạng thái mở
    setExpanded, // Thay đổi trạng thái mở
}) => {
    const [localExpanded, setLocalExpanded] = useState(expanded)

    useEffect(() => {
        setLocalExpanded(expanded)
    }, [expanded])

    const toggleExpanded = useCallback(() => {
        if (!disabled) {
            setLocalExpanded(!localExpanded)
            setExpanded(localExpanded ? null : placeholder) // Đóng dropdown nếu nó đang mở
        }
    }, [localExpanded, disabled, setExpanded])

    const onSelect = useCallback(
        (item) => {
            if (!disabled) {
                onChange(item)
                setLocalExpanded(false)
                setExpanded(null) // Đóng dropdown khi chọn item
            }
        },
        [onChange, disabled, setExpanded]
    )

    return (
        <View style={{ alignItems: "flex-end" }}>
            <TouchableOpacity
                style={[styles.button, disabled && styles.disabledButton]}
                activeOpacity={disabled ? 1 : 0.8}
                onPress={() => {
                    toggleExpanded()
                    if (onFocus) onFocus()
                }}>
                <Text
                    style={[{ flex: 1, paddingHorizontal: 0 }, disabled && { color: COLORS.gray }]}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {value ? value.name : placeholder} {/* Hiển thị giá trị hiện tại */}
                </Text>
                <Entypo
                    name={localExpanded && data.length > 0 ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={COLORS.gray}
                />
            </TouchableOpacity>

            {localExpanded && !disabled && data ? (
                <View style={styles.options}>
                    <ScrollView
                        style={{ maxHeight: 150 }}
                        nestedScrollEnabled={true}
                        showsVerticalScrollIndicator={false}>
                        <Text
                            style={[
                                styles.text,
                                {
                                    paddingHorizontal: 8,
                                    color: COLORS.PersianGreen,
                                },
                            ]}>
                            {placeholder}
                        </Text>

                        {data.map((item, index) => (
                            <TouchableOpacity
                                onPress={() => onSelect(item)}
                                key={item._id}
                                activeOpacity={0.8}
                                style={[
                                    styles.optionItem,
                                    index === data.length - 1 && { borderBottomWidth: 0 },
                                ]}>
                                <View
                                    style={
                                        value && value._id === item._id ? styles.selectedOption : {}
                                    }>
                                    <Text
                                        style={
                                            value && value._id === item._id
                                                ? styles.selectedText
                                                : styles.text
                                        }>
                                        {item.name}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            ) : null}
        </View>
    )
}

export default Dropdown

const styles = StyleSheet.create({
    button: {
        height: 40,
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: COLORS.white,
        flexDirection: "row",
        width: "100%",
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 15,
        borderColor: COLORS.silver,
    },
    options: {
        position: "absolute",
        top: 43,
        paddingVertical: 5,
        paddingHorizontal: 2,
        width: "85%",
        backgroundColor: COLORS.Light20PersianGreen,
        borderRadius: 10,
        zIndex: 1,
    },
    optionItem: {
        justifyContent: "center",
        marginHorizontal: 8,
        borderBottomWidth: 1,
        borderColor: COLORS.PersianGreen,
        paddingVertical: 2,
    },
    selectedOption: {
        backgroundColor: COLORS.PersianGreen, // Màu nền cho item được chọn
        borderRadius: 4,
        marginVertical: 2,
    },
    selectedText: {
        color: COLORS.white, // Màu chữ cho item được chọn
        marginHorizontal: 5,
        marginVertical: 4,
        paddingVertical: 2,
    },
    text: {
        marginVertical: 2,
        paddingVertical: 2,
        fontSize: 14,
    },
    textPlaceholder: {
        marginVertical: 2,
        paddingVertical: 2,
        fontSize: 14,
    },
})
