import { Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Theme } from "../Branding/Theme";

interface IntroIprops {
    navigation?: any;
}

const IntroScreen = ({
    navigation
}: IntroIprops) => {

    return (
        <View style={{
            flex: 1,
            backgroundColor: Theme.colors.primaryColor
        }}>
            <View style={{
                flex: 3,
                justifyContent: "center",
                alignItems: "center",
                gap: 20,
                padding: 20
            }}>

                <Text style={{
                    fontWeight: "600",
                    fontSize: 45,
                    color: "white"
                }}>NA FitTest</Text>

                <Text style={{
                    fontWeight: "300",
                    color: "white",
                    fontSize: 18,
                    textAlign: "center"
                }}>Official Personal Traning App of the Army for National Defense</Text>
            </View>
            <View style={{
                height: "20%",
                backgroundColor: "white",
                padding: 30,
                justifyContent: "center",
            }}>
                <TouchableOpacity style={
                    styles.btn
                }
                    onPress={() => {
                        navigation.navigate("LandingScreen");
                    }}
                >
                    <Text style={styles.btn_text}>Get started</Text>
                    <Image source={require("../../assets/downloadedIcons/fast.png")}
                        style={{
                            width: 20,
                            height: 20,
                            resizeMode: "contain",
                        }}
                    />
                </TouchableOpacity>
                <Text style={{
                    alignSelf: "center"
                }}>© 2025 404services. All rights reserved.</Text>
            </View>
        </View>
    )
}

export default IntroScreen;

const styles = StyleSheet.create({
    btn: {
        backgroundColor: Theme.colors.primaryColor,
        padding: 20,
        borderRadius: 5,
        flexDirection: "row",
        justifyContent: "space-between"
    },
    btn_text: {
        color: "white",
        fontSize: 16
    }
})