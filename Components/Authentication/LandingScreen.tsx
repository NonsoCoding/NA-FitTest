import { Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Theme } from "../Branding/Theme";
import LottieView from "lottie-react-native";

interface LandingScreenIprops {
    navigation?: any;
}

const LandingScreen = ({
    navigation
}: LandingScreenIprops) => {

    return (
        <View style={{
            flex: 1,
            backgroundColor: Theme.colors.primaryColor
        }}>
            <View style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                gap: 20,
                padding: 20,
            }}>
                <Text style={{
                    fontWeight: "600",
                    fontSize: 45,
                    color: "white"
                }}>TacticalPT</Text>
                <Text style={{
                    fontWeight: "300",
                    color: "white",
                    fontSize: 18,
                    textAlign: "center"
                }}>Proceed to your account or create a new one by signing up if you do not have an account.</Text>
            </View>
            <View style={{
                backgroundColor: "white",
                height: "35%",
                gap: 15,
                padding: 30,
                justifyContent: "center",
            }}>
                <TouchableOpacity style={
                    styles.btn
                }
                    onPress={() => {
                        navigation.navigate("LoginScreen")
                    }}
                >
                    <Text style={styles.btn_text}>Continue with email</Text>
                    <Image source={require("../../assets/downloadedIcons/mail-fill.png")}
                        style={{
                            width: 20,
                            height: 20,
                            resizeMode: "contain"
                        }}
                    />
                </TouchableOpacity>
                <View style={styles.dividerContainer}>
                    <View style={styles.line} />
                    <Text style={styles.dividerText}>Or login with</Text>
                    <View style={styles.line} />
                </View>
                <TouchableOpacity style={{
                    borderWidth: 1,
                    alignItems: "center",
                    padding: 5,
                    borderRadius: 7,
                    borderColor: Theme.colors.borderColor,
                    flexDirection: "row",
                    gap: 20,
                    justifyContent: "center"
                }}
                // onPress={() => {
                //     navigation.navigate("MainDrawer")
                // }}
                >
                    <Text style={{
                        color: Theme.colors.primaryColor,
                        fontSize: 18,
                    }}>GOOGLE</Text>
                    <LottieView
                        source={require("../../assets/downloadedIcons/google3.json")}
                        style={{
                            height: 40,
                            width: 40
                        }}
                        resizeMode="contain"
                        autoPlay={true}
                        loop={true}
                    />
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', gap: 6, alignSelf: "center", alignItems: "center" }}>
                    <Text style={{ color: '#333', fontSize: 16, fontFamily: Theme.Montserrat_Font.Mont600 }}>Don't have an account?</Text>
                    <TouchableOpacity
                        onPress={() => {
                            navigation.navigate("SignUpScreen");
                        }}
                    >
                        <Text style={{ color: Theme.colors.primaryColor, fontSize: 16, fontFamily: Theme.Montserrat_Font.Mont600 }}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default LandingScreen;

const styles = StyleSheet.create({
    btn: {
        backgroundColor: Theme.colors.second_primary,
        padding: 20,
        borderRadius: 5,
        flexDirection: "row",
        justifyContent: "space-between"
    },
    btn_text: {
        color: "white",
        fontSize: 16
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    line: {
        flex: 1,
        height: 2,
        backgroundColor: Theme.colors.primaryColor,
    },
    dividerText: {
        paddingHorizontal: 10,
        color: '#7A7A7A',
        fontSize: 14,
    },
})