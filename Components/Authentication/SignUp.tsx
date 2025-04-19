    import { useSignUp, useAuth } from '@clerk/clerk-expo'
    import * as React from 'react'
import { Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Theme } from "../Branding/Theme";
import {useState} from "react";
    import * as stream from "node:stream";

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

    const { isLoaded, signUp, setActive } = useSignUp()

    const {signOut, sessionId, isSignedIn} = useAuth()

    const [emailAddress, setEmailAddress] = useState('')
    const [password, setPassword] = useState('')
    const [pendingVerification, setPendingVerification] = useState(false)
    const [code, setCode] = useState('')

    const onSignUpPress = async () => {
        // console.log("yes")
        if (!isLoaded) return


        try {
            await signUp.create({
                emailAddress: emailAddress,
                password: password,
            })

            // Send user an email with verification code
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

            // Set 'pendingVerification' to true to display second form
            // and capture OTP code
            setPendingVerification(true)
        } catch (err) {
            // See https://clerk.com/docs/custom-flows/error-handling
            // for more info on error handling
            console.error(JSON.stringify(err, null, 2))
        }
    }
    const onVerifyPress = async () => {
        if (!isLoaded) return

        try {
            // Use the code the user provided to attempt verification
            const signUpAttempt = await signUp.attemptEmailAddressVerification({
                code,
            })

            // If verification was completed, set the session to active
            // and redirect the user
            if (signUpAttempt.status === 'complete') {
                await setActive({ session: signUpAttempt.createdSessionId })
                // router.replace('/')
                console.log("You are successfully signed in, move to homescreen");
                setEmailAddress("");
                setPassword("");
            } else {
                // If the status is not complete, check why. User may need to
                // complete further steps.
                console.error(JSON.stringify(signUpAttempt, null, 2))
            }
        } catch (err) {
            // See https://clerk.com/docs/custom-flows/error-handling
            // for more info on error handling
            console.error(JSON.stringify(err, null, 2))
        }
    }



    const signingOut = async (sessionId:string) => {
       await signOut({
            sessionId,
        })
            .then(() => {
                console.log("done");
            })
            .catch((e: Error) => {
                console.log(e);
            });
    };


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
                            placeholderTextColor={"#8c8c8e"}
                            style={styles.textinput}
                            value={emailAddress}
                            onChangeText={setEmailAddress}
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
                            onChangeText={setPassword}
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
                                value={code}
                                onChangeText={(code: string) => setCode(code)}
                                editable={pendingVerification && true}
                            />
                        </View>
                        <TouchableOpacity
                            onPress={onSignUpPress}
                            style={styles.get_code_button}>
                            <Text style={{ color: "white", fontSize: 12, fontFamily: Theme.Montserrat_Font.Mont500 }}>Get Code</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        onPress={onVerifyPress}
                        style={[styles.continue_email_button, {
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