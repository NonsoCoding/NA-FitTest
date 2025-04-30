import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Theme } from "../Branding/Theme";
import { useEffect, useRef, useState } from "react";
import OTPTextInput from 'react-native-otp-textinput';
import { useSignUp } from "@clerk/clerk-react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from "@react-navigation/native";
import SuccessModal from "../Modals/SuccessModal";
import ResultModal from "../Modals/FailedModal";
import LottieView from "lottie-react-native";


interface IOtpProps {
    navigation: any;
    route: any;
}

const endPoint = process.env.EXPO_PUBLIC_API_URL;


const OTPScreen = ({
    navigation,
    route
}: IOtpProps) => {

    const [modalMessage, setModalMessage] = useState("");
    const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
    const [isFailedModalVisible, setFailedModalVisible] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const { setActive, isLoaded, signUp } = useSignUp();
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const otpInput = useRef<any>();
    const { isLoginCompleteModalVisible } = route.params || {};
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (isLoginCompleteModalVisible) {
            setShowModal(true);
        }
    }, [isLoginCompleteModalVisible]);

    const handleCodeFilled = (code: string) => {
        console.log('OTP ENTERED: ', code);
    }

    const onVerifyPress = async (codeFromInput?: string) => {
        const finalCode = codeFromInput ?? code;
        const email = await AsyncStorage.getItem("email");

        try {
            setIsLoading(true);
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
                setIsLoading(false);
                setModalMessage("Welcome to TacticalPT! what are we doing today?")
                setSuccessModalVisible(true);

                setTimeout(() => {
                    setSuccessModalVisible(false);
                    navigation.reset({
                        index: 0,
                        routes: [{ name: "MainDrawer" }]
                    })
                }, 500);
                console.log(res);
            } else {
                setIsLoading(false);
                setModalMessage("Unsuccessful. Invalid OTP!");
                setFailedModalVisible(true);
            }

        } catch (error) {
            setIsLoading(false);
            console.error("Signup error:", error);
            setModalMessage("An error occurred. Please try again later.");
            setFailedModalVisible(true);
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
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <LottieView
                        source={require("../../assets/ExerciseGifs/Animation - 1745262738989.json")}
                        style={{
                            height: 80,
                            width: 80
                        }}
                        resizeMode="contain"
                        loop={true}
                        autoPlay={true}
                    />
                    <Text style={{ color: "#fff", marginTop: 10, fontFamily: Theme.Montserrat_Font.Mont400 }}>Signing you in...</Text>
                </View>
            )}
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
                        color: "white",
                        fontWeight: 300
                    }}>
                        A 4 digit code has been sent to the email connected to your account
                    </Text>
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
                        }}>VERIFY</Text>
                        <Image source={require("../../assets/downloadedIcons/fast.png")}
                            style={{
                                height: 24,
                                width: 24
                            }}
                        />
                    </TouchableOpacity>
                </View>
            </View>
            <SuccessModal
                visible={showModal}
                onClose={() => setShowModal(false)}
            />
            <>
                {/* Success Modal */}
                <ResultModal
                    isVisible={isSuccessModalVisible}
                    onClose={() => setSuccessModalVisible(false)}
                    type="success"
                    message={modalMessage}
                />

                {/* Failed Modal */}
                <ResultModal
                    isVisible={isFailedModalVisible}
                    onClose={() => setFailedModalVisible(false)}
                    type="failure"
                    message={modalMessage}
                />
            </>
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
        flexDirection: "row",
        justifyContent: "space-between",
        borderRadius: 5
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
})