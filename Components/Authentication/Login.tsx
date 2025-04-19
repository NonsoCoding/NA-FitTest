import { Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Theme } from "../Branding/Theme";
import { useSignIn } from '@clerk/clerk-expo'
import {useState} from "react";

interface LoginModalIprops {
    navigation?: any;
    isVisible: boolean;
    onClose: () => void;
    onSwitchToSignUp: () => void;
}

const LoginModal: React.FC<LoginModalIprops> = ({
    isVisible,
    navigation,
    onClose,
    onSwitchToSignUp
}) => {

    const { signIn, setActive, isLoaded } = useSignIn()
    // const router = useRouter()

    const [emailAddress, setEmailAddress] = useState('')
    const [password, setPassword] = useState('')

    // Handle the submission of the sign-in form
    const onSignInPress = async () => {
        // console.log("yes")
        if (!isLoaded) return

        try {
            const signInAttempt = await signIn.create({
                identifier: emailAddress,
                password: password,
                strategy: "password",
            });

            if (signInAttempt.status === "complete") {
                // setPreloader(false);
                // retrieveData();
                console.log("done")
                setEmailAddress("");
                setPassword("");
            } else {
                // setPreloader(false);
                console.log("Login failed. Please try again.");
            }
        } catch (err) {
            // setPreloader(false);
            // console.error("Error during login:", err);
            // setError(err.message || "An error occurred during login");
            console.log(err)
        }
    }


    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={{
                justifyContent: "flex-end",
                flex: 1
            }}>
                <View style={{
                    gap: 20,
                    backgroundColor: "black",
                    height: "55%",
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
                            style={styles.textinput}
                            placeholderTextColor={"#8c8c8e"}
                            value={emailAddress}
                            onChangeText={(inp:string) => setEmailAddress(inp)}
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
                            value={password}
                            onChangeText={(code: string) => setPassword(code)}
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
                                style={styles.otp_textinput}
                                placeholderTextColor={"#8c8c8e"}
                            />
                        </View>
                        <TouchableOpacity style={styles.get_code_button}>
                            <Text style={{ color: "white", fontSize: 12, fontFamily: Theme.Montserrat_Font.Mont500 }}>Get Code</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        onPress={onSignInPress}
                        style={[styles.continue_email_button, {
                        padding: 15
                    }]}>
                        <Image source={require("../../assets/Icons/fast-forward.png")}
                            style={[styles.button_icon, {
                                height: 30,
                                width: 30
                            }]}
                        />
                        <Text style={styles.email_button_text}>Sign In</Text>
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', gap: 6, alignSelf: "center" }}>
                        <Text style={{ color: 'white', fontSize: 16, fontFamily: Theme.Montserrat_Font.Mont600 }}>Don't have an account?</Text>
                        <TouchableOpacity
                            onPress={onSwitchToSignUp}
                        >
                            <Text style={{ color: "#ADCC05", fontSize: 16, fontFamily: Theme.Montserrat_Font.Mont600 }}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

export default LoginModal;

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
        fontSize: 18,
        fontWeight: "300"
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
        fontFamily: Theme.Montserrat_Font.Mont500,
        fontSize: 14
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
    }
})