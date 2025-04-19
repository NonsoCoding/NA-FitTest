import { Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Theme } from "../Branding/Theme";

interface IntroModalIprops {
    navigation?: any;
    isVisible: boolean;
    onClose: () => void;
    onSwitchToLogin: () => void;
    onSwicthToSignUp: () => void;
}

const IntroModal: React.FC<IntroModalIprops> = ({
    isVisible,
    navigation,
    onClose,
    onSwitchToLogin,
    onSwicthToSignUp
}) => {
    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={{
                justifyContent: "flex-end",
                flex: 1
            }}>
                <View style={{
                    gap: 20,
                    backgroundColor: "black",
                    height: "35%",
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
                    <TouchableOpacity style={styles.continue_google_button}
                    >
                        <Image source={require("../../assets/Icons/Google_Icon.png")}
                            style={styles.button_icon}
                        />
                        <Text style={styles.google_button_text}>Continue with Google</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.continue_email_button}
                        onPress={onSwitchToLogin}
                    >
                        <Image source={require("../../assets/Icons/Email_Icon.png")}
                            style={styles.button_icon}
                        />
                        <Text style={styles.email_button_text}>Continue with Email</Text>
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', gap: 6, alignSelf: "center" }}>
                        <Text style={{ color: 'white', fontSize: 16, fontFamily: Theme.Montserrat_Font.Mont600 }}>Don't have an account?</Text>
                        <TouchableOpacity
                            onPress={onSwicthToSignUp}
                        >
                            <Text style={{ color: "#ADCC05", fontSize: 16, fontFamily: Theme.Montserrat_Font.Mont600 }}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

export default IntroModal;

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
    google_button_text: {
        fontSize: 16,
        fontFamily: Theme.Montserrat_Font.Mont500
    },
    email_button_text: {
        fontSize: 16,
        fontFamily: Theme.Montserrat_Font.Mont500,
        color: "white"
    },
    button_icon: {
        height: 30,
        width: 30,
        resizeMode: "contain"
    },
    textinput_container: {
        backgroundColor: "white",
        flexDirection: "row",
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20
    },
    textinput: {
        flex: 1,
        paddingVertical: 20,
        paddingHorizontal: 10
    },
    otp_textinput: {
        backgroundColor: "white",
        borderRadius: 40,
        padding: 20,
    },
    get_code_button: {
        padding: 20,
        backgroundColor: "#4D4D4D",
        borderRadius: 40
    }
})