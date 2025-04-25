import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Theme } from "../Branding/Theme";
import { useRef, useState } from "react";
import OTPInputView from "@twotalltotems/react-native-otp-input";
import { useSignUp } from "@clerk/clerk-react";


interface IPasswordOtpProps {
    navigation: any;
}

const PasswordOTPScreen = ({
    navigation
}: IPasswordOtpProps) => {

    const { setActive, isLoaded, signUp } = useSignUp();
    const [code, setCode] = useState('');
    const otpInput = useRef<any>();

    const handleCodeFilled = (code: string) => {
        console.log('OTP ENTERED: ', code);
    }

    const onVerifyPress = async (codeFromInput?: string) => {
        if (!isLoaded) return

        try {

            const finalCode = codeFromInput ?? code;
            // Use the code the user provided to attempt verification
            const signUpAttempt = await signUp.attemptEmailAddressVerification({
                code: finalCode
            })

            // If verification was completed, set the session to active
            // and redirect the user
            if (signUpAttempt.status === 'complete') {
                await setActive({ session: signUpAttempt.createdSessionId })
                // router.replace('/')
                console.log("You are successfully signed in, move to homescreen");
                navigation.navigate("HomePage");
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


    return (
        <View style={styles.container}>
            <View style={{
                height: "30%",
                backgroundColor: Theme.colos.primaryColor,
                justifyContent: 'flex-end',
                padding: 20
            }}>
                <View style={{
                    gap: 10
                }}>
                    <Text style={{
                        fontSize: 30,
                        color: "white",
                        fontWeight: 500
                    }}>Verify OTP code</Text>
                    <Text style={{
                        color: "white"
                    }}>Please enter the verification code we sent to your email.</Text>
                </View>
            </View>
            <View style={{
                padding: 20,
                gap: 20
            }}>
                <View style={{
                    gap: 10
                }}>
                    <OTPInputView
                        ref={otpInput}
                        style={styles.otpContainer}
                        pinCount={4}
                        autoFocusOnLoad
                        codeInputFieldStyle={styles.underlineStyleBase}
                        codeInputHighlightStyle={styles.underlineStyleHighLighted}
                        onCodeFilled={(enteredCode: string) => {
                            setCode(enteredCode);
                            onVerifyPress(enteredCode);
                        }}
                        onCodeChanged={(code: string) => setCode(code)}

                    />
                </View>
                <View>
                    <TouchableOpacity style={styles.btn}
                        onPress={() => {
                            // onVerifyPress();
                            navigation.navigate("ResetPassword")
                        }}
                    >
                        <Text style={{
                            color: 'white',
                            fontSize: 15
                        }}>Continue</Text>
                        <Image source={require("../../assets/Icons/fast-forward.png")}
                            style={{
                                height: 15,
                                width: 15
                            }}
                        />
                    </TouchableOpacity>
                </View>
                <View style={{
                    flexDirection: "row",
                    gap: 5,
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    <Text style={{}}>Didn't get a code?</Text>
                    <TouchableOpacity style={{
                    }}
                        onPress={() => {
                            console.log("Code resent");

                        }}
                    >
                        <Text style={{
                            color: Theme.colos.primaryColor
                        }}>Resend OTP</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default PasswordOTPScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 20
    },
    otpContainer: {
        width: '100%',
        height: 60,
        alignSelf: "center"
    },
    underlineStyleBase: {
        width: 60,
        height: 60,
        borderWidth: 1,
        borderColor: '#1F1F1F80',
        color: '#000',
        fontSize: 18,
        borderRadius: 5,
    },
    underlineStyleHighLighted: {
        borderColor: "#1F1F1F80",
    },
    btn: {
        backgroundColor: Theme.colos.primaryColor,
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 5
    }
})