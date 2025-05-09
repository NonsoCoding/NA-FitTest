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
            backgroundColor: Theme.colos.primaryColor
        }}>
            <View style={{
                flex: 3,
                justifyContent: "center",
                alignItems: "center",
                gap: 20,
                padding: 20
            }}>
                <Text style={{
                    fontWeight: 600,
                    fontSize: 45,
                    color: "white"
                }}>TacticalPT</Text>
                <Text style={{
                    fontWeight: 300,
                    color: "white",
                    fontSize: 18,
                    textAlign: "center"
                }}>This is the official fitness app for the army of national defense</Text>
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

                >
                    <Text style={styles.btn_text}>Get started</Text>
                    <Image source={require("../../assets/downloadedIcons/fast.png")}
                        style={{
                            width: 20,
                            height: 20,
                            resizeMode: "contain"
                        }}
                    />
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default IntroScreen;

const styles = StyleSheet.create({
    btn: {
        backgroundColor: Theme.colos.primaryColor,
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