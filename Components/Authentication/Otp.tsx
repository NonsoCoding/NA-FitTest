import {Alert, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import { Theme } from "../Branding/Theme";
import { useRef, useState } from "react";
import OTPTextInput from 'react-native-otp-textinput';
import { useSignUp } from "@clerk/clerk-react";
import AsyncStorage from "@react-native-async-storage/async-storage";


interface IOtpProps {
    navigation: any;
}

const endPoint = process.env.EXPO_PUBLIC_API_URL;


const OTPScreen = ({
    navigation
}: IOtpProps) => {

    const { setActive, isLoaded, signUp } = useSignUp();
    const [code, setCode] = useState('');
    const otpInput = useRef<any>();

    const handleCodeFilled = (code: string) => {
        console.log('OTP ENTERED: ', code);
    }

    const onVerifyPress = async (codeFromInput?: string) => {
        const finalCode = codeFromInput ?? code;
        const email =  await AsyncStorage.getItem("email");

        try {
            const mainData = await fetch(`${endPoint}/verify-email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    email: email?.toLowerCase(),
                    otp: finalCode,
                }),
            });


            const res = await mainData.json();

            if (res.success) {

                Alert.alert("Welcome", "Welcome to tacticalPT, what are we doing today?", [{text:"Ok"}]);

                navigation.navigate("HomePage");
                console.log(res);
            } else {
                Alert.alert("Unsuccessul", "Please input the correct OTP code sent to you!", [{text:"Ok"}]);
            }

        } catch (error) {
            console.error("Signup error:", error);
        }

    }

    const [isResendDisabled, setIsResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const resendOtp = async () => {
        if (isResendDisabled) {
            Alert.alert("Please wait", `Try again in ${countdown} seconds`);
            return;
        }

        const email = await AsyncStorage.getItem("email");
        try {
            setIsResendDisabled(true);
            setCountdown(30); // Start 30-second countdown

            // Start countdown timer
            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setIsResendDisabled(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            const mainData = await fetch(`${endPoint}/resend-otp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    email,
                }),
            });

            const res = await mainData.json();

            await AsyncStorage.setItem("otp", res.otp);
            Alert.alert("Success", `Your OTP code is ${res.otp}`);
            // console.log(res)

        } catch (error) {
            console.error("Resend OTP error:", error);
            Alert.alert("Error", "Failed to resend OTP. Please try again later.");
            setIsResendDisabled(false); // Re-enable if error occurs
            setCountdown(0);
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
                    <OTPTextInput
                        // ref={otpInput}
                        inputCount={4}
                        handleTextChange={(text: string) => setCode(text)}
                        containerStyle={styles.otpContainer}
                        textInputStyle={styles.underlineStyleBase}
                        tintColor={Theme.colos.primaryColor}
                        offTintColor="#ccc"
                        autoFocus
                    />
                    <View style={{
                        flexDirection: "row",
                        gap: 5,
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <Text style={{}}>Didn't get a code?</Text>
                        <TouchableOpacity style={{

                        }}
                            onPress={resendOtp}
                        >
                            <Text style={{
                                color: Theme.colos.primaryColor
                            }}>resend OTP</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View>
                    <TouchableOpacity style={styles.btn}
                        onPress={() => {
                            onVerifyPress();
                        }}
                    >
                        <Text style={{
                            color: 'white',
                        }}>Verify</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default OTPScreen;

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
        width: 45,
        height: 45,
        borderWidth: 1,
        borderColor: '#ccc',
        color: '#000',
        fontSize: 18,
        borderRadius: 5,
    },
    underlineStyleHighLighted: {
        borderColor: Theme.colos.primaryColor,
    },
    btn: {
        backgroundColor: Theme.colos.primaryColor,
        padding: 15,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 5
    }
})