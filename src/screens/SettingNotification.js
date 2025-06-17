import { Pressable, StyleSheet, Text, TouchableOpacity, View, Switch } from "react-native"
import React, { useState } from "react"
import { useAuth } from "../AuthProvider"
import { SafeAreaView } from "react-native-safe-area-context"
import { HeaderBack } from "../components"
import { COLORS } from "../constants"

const SettingNotification = ({ navigation }) => {
    const [generalNoti, setGeneralNoti] = useState(true)
    const [sound, setSound] = useState(true)
    const [callSound, setCallSound] = useState(true)
    const [vibration, setVibration] = useState(false)

    return (
        <SafeAreaView style={styles.container}>
            <HeaderBack navigation={navigation} title="Cài Đặt Thông Báo" />
            <View style={styles.mainContainer}>
                <View style={styles.item}>
                    <Text style={styles.textItem}>Thông Báo Chung</Text>
                    <Switch
                        trackColor={{ false: COLORS.gray, true: COLORS.PersianGreen }}
                        thumbColor={generalNoti ? COLORS.white : COLORS.Lightgrayishmagenta}
                        onValueChange={() => setGeneralNoti((previousState) => !previousState)}
                        value={generalNoti}
                    />
                </View>

                <View style={styles.item}>
                    <Text style={styles.textItem}>Âm Thanh</Text>
                    <Switch
                        trackColor={{ false: COLORS.gray, true: COLORS.PersianGreen }}
                        thumbColor={sound ? COLORS.white : COLORS.Lightgrayishmagenta}
                        onValueChange={() => setSound((previousState) => !previousState)}
                        value={sound}
                    />
                </View>

                <View style={styles.item}>
                    <Text style={styles.textItem}>Rung</Text>
                    <Switch
                        trackColor={{ false: COLORS.gray, true: COLORS.PersianGreen }}
                        thumbColor={sound ? COLORS.white : COLORS.Lightgrayishmagenta}
                        onValueChange={() => setSound((previousState) => !previousState)}
                        value={sound}
                    />
                </View>
            </View>
        </SafeAreaView>
    )
}

export default SettingNotification

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    contentTitle: {
        backgroundColor: COLORS.PersianGreen,
        flexDirection: "row",
        paddingVertical: 20,
        paddingStart: 25,
    },
    mainContainer: {
        flex: 1,
        margin: 20,
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    textItem: {
        fontSize: 20,
        flex: 1,
        marginHorizontal: 10,
        paddingStart: 5,
    },
})
