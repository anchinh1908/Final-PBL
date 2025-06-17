import { useFonts } from "expo-font"

const useCustomFonts = () => {
    const [fontsLoaded] = useFonts({
        Poppins_Bold: require("../../assets/fonts/Poppins-Bold.ttf"),
        Poppins_Italic: require("../../assets/fonts/Poppins-Italic.ttf"),
        Poppins_Medium: require("../../assets/fonts/Poppins-Medium.ttf"),
        Poppins_Regular: require("../../assets/fonts/Poppins-Regular.ttf"),
        Poppins_SemiBold: require("../../assets/fonts/Poppins-SemiBold.ttf"),
    })

    return fontsLoaded
}

export default useCustomFonts
