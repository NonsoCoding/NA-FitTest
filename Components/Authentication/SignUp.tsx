import { Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Theme } from "../Branding/Theme";

interface SignUpModalIprops {
    navigation?: any;
    isVisible: boolean;
    onClose: () => void;
    onSwitchToLogin: () => void;
}

const SignUpModal: React.FC<SignUpModalIprops> = ({
    isVisible,
    navigation,
    onClose,
    onSwitchToLogin
}) => {
    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={{
                justifyContent: "flex-end",
                flex: 1,
            }}>
                <View style={{
                    gap: 20,
                    backgroundColor: "black",
                    height: "49%",
                    padding: 30,
                    justifyContent: 'center',
                    borderTopRightRadius: 25,
                    borderTopLeftRadius: 25,
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: -80,
                    },
                    shadowOpacity: 0.6,
                    shadowRadius: 25,
                    elevation: 10,
                }}>
                    <View style={styles.textinput_container}>
                        <Image
                            style={styles.button_icon}
                            source={require("../../assets/Icons/Email_Login_Icon.png")}
                        />
                        <TextInput
                            placeholder="your email"
                            placeholderTextColor={"#8c8c8e"}
                            style={styles.textinput}
                        />
                    </View>
                    <View style={styles.textinput_container}>
                        <Image
                            style={styles.button_icon}
                            source={require("../../assets/Icons/Password_Icon.png")}
                        />
                        <TextInput
                            placeholder="your password"
                            placeholderTextColor={"#8c8c8e"}
                            style={styles.textinput}
                        />
                    </View>
                    <View style={{
                        flexDirection: "row",
                        gap: 10
                    }}>
                        <View style={{
                            flex: 2
                        }}>
                            <TextInput
                                placeholder="OTP..."
                                placeholderTextColor={"#8c8c8e"}
                                style={styles.otp_textinput}
                            />
                        </View>
                        <TouchableOpacity style={styles.get_code_button}>
                            <Text style={{ color: "white", fontSize: 12, fontFamily: Theme.Montserrat_Font.Mont500 }}>Get Code</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={[styles.continue_email_button, {
                        padding: 15
                    }]}>
                        <Image source={require("../../assets/Icons/fast-forward.png")}
                            style={[styles.button_icon, {
                                width: 30,
                                height: 30
                            }]}
                        />
                        <Text style={styles.email_button_text}>Sign Up</Text>
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', gap: 6, alignSelf: "center" }}>
                        <Text style={{ color: 'white', fontSize: 16, fontFamily: Theme.Montserrat_Font.Mont600 }}>Already have an account?</Text>
                        <TouchableOpacity
                            onPress={onSwitchToLogin}
                        >
                            <Text style={{ color: "#ADCC05", fontSize: 16, fontFamily: Theme.Montserrat_Font.Mont600 }}>click here</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

export default SignUpModal;

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
    continue_email_button: {
        backgroundColor: "#ADCC05",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        padding: 15,
        borderRadius: 40,
        gap: 15
    },
    email_button_text: {
        fontSize: 18,
        fontFamily: Theme.Montserrat_Font.Mont500,
        color: "white"
    },
    button_icon: {
        height: 40,
        width: 40,
        resizeMode: "contain"
    },
    textinput_container: {
        backgroundColor: "white",
        flexDirection: "row",
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 10
    },
    textinput: {
        flex: 1,
        paddingVertical: 20,
        paddingHorizontal: 10,
        fontSize: 14,
        fontFamily: Theme.Montserrat_Font.Mont500
    },
    otp_textinput: {
        backgroundColor: "white",
        borderRadius: 40,
        padding: 20,
        fontSize: 14,
        fontFamily: Theme.Montserrat_Font.Mont500
    },
    get_code_button: {
        padding: 20,
        backgroundColor: "#4D4D4D",
        borderRadius: 40
    }
})