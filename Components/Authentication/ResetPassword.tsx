import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Theme } from "../Branding/Theme";
import { Formik } from "formik";
import { FontAwesome6, Fontisto } from "@expo/vector-icons";
import LottieView from "lottie-react-native";

interface IResetPasswordProps {
    navigation: any;
}


const ResetPassword = ({
    navigation
}: IResetPasswordProps) => {

    return (
        <View style={{
            flex: 1
        }}>
            <View style={{
                flex: 1,
                backgroundColor: Theme.colos.primaryColor,
                padding: 20,
                paddingBottom: 30,
                justifyContent: "flex-end"
            }}>
                <View>
                    <View>
                        <Text style={{
                            fontSize: 40,
                            fontWeight: 700,
                            color: "white",
                            lineHeight: 45,
                        }}>Reset password</Text>
                    </View>
                    <Text style={{
                        fontSize: 16,
                        fontWeight: 300,
                        color: "white"
                    }}>Type your new password to recover your account</Text>
                </View>
            </View>
            <View style={{
                flex: 3,
                padding: 20,
                paddingTop: 20
            }}>
                <View style={{
                    gap: 10
                }}>
                    <View style={{
                        gap: 5
                    }}>
                        <View style={[styles.textinput_container, {
                            marginBottom: 5
                        }]}>
                            <Image source={require("../../assets/downloadedIcons/lock-2-fill.png")}
                                style={{
                                    height: 20,
                                    width: 20
                                }}
                                resizeMode='contain'
                            />
                            <TextInput
                                style={styles.textinput}
                                placeholderTextColor={"#8c8c8e"}
                                placeholder="password"
                            />
                        </View>
                        <View style={[styles.textinput_container, {
                            marginBottom: 5
                        }]}>
                            <Image source={require("../../assets/downloadedIcons/lock-2-fill.png")}
                                style={{
                                    height: 20,
                                    width: 20
                                }}
                                resizeMode='contain'
                            />
                            <TextInput
                                style={styles.textinput}
                                placeholderTextColor={"#8c8c8e"}
                                placeholder="confirm password"
                            />
                        </View>
                    </View>
                    <View style={{
                        alignItems: "flex-end"
                    }}>
                    </View>
                    <TouchableOpacity
                        onPress={() => {
                            navigation.navigate("PasswordOTPScreen")
                        }}
                        style={[styles.continue_email_button, {
                            padding: 20
                        }]}>
                        <Text style={styles.email_button_text}>continue</Text>
                        <Image source={require("../../assets/Icons/fast-forward.png")}
                            style={[styles.button_icon, {
                                height: 15,
                                width: 15
                            }]}
                        />
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', gap: 6, alignSelf: "center" }}>
                        <Text style={{ color: '#333', fontSize: 16, fontFamily: Theme.Montserrat_Font.Mont600 }}>Remebered password?</Text>
                        <TouchableOpacity
                            onPress={() => {
                                navigation.reset({
                                    index: 0,
                                    routes: [{ name: "LoginScreen" }]
                                })
                            }}
                        >
                            <Text style={{ color: Theme.colos.primaryColor, fontSize: 16, fontFamily: Theme.Montserrat_Font.Mont600 }}>Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    )
}

export default ResetPassword;

const styles = StyleSheet.create({
    continue_google_button: {
        backgroundColor: "white",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        padding: 15,
        borderRadius: 40,
        gap: 15
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    continue_email_button: {
        backgroundColor: Theme.colos.primaryColor,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 15,
        borderRadius: 5,
        gap: 15
    },
    google_button_text: {
        fontSize: 18,
        fontWeight: "300"
    },
    email_button_text: {
        fontSize: 15,
        fontFamily: Theme.Montserrat_Font.Mont500,
        color: "white"
    },
    button_icon: {
        height: 40,
        width: 40,
        resizeMode: "contain"
    },
    textinput_container: {
        flexDirection: "row",
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: Theme.colos.lightPrimary,
        position: 'relative',
    },
    textinput: {
        flex: 1,
        paddingVertical: 20,
        paddingHorizontal: 10,
        fontFamily: Theme.Montserrat_Font.Mont500,
        fontSize: 14,
    },
    otp_textinput: {
        backgroundColor: "white",
        borderRadius: 40,
        padding: 20,
        fontFamily: Theme.Montserrat_Font.Mont500,
        fontSize: 14
    },
    get_code_button: {
        padding: 20,
        backgroundColor: "#4D4D4D",
        borderRadius: 40
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    dividerText: {
        paddingHorizontal: 10,
        color: '#7A7A7A',
        fontSize: 14,
    },
})