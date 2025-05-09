import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Theme } from "../Branding/Theme";
import { useEffect, useRef, useState } from "react";
import OTPTextInput from 'react-native-otp-textinput';
import SuccessModal from "../Modals/SuccessModal";
import ResultModal from "../Modals/FailedModal";
import LottieView from "lottie-react-native";


interface IOtpProps {
    navigation: any;
    route: any;
}

const OTPScreen = ({
    navigation,
    route
}: IOtpProps) => {

    const [modalMessage, setModalMessage] = useState("");
    const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
    const [isFailedModalVisible, setFailedModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { isLoginCompleteModalVisible } = route.params || {};
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (isLoginCompleteModalVisible) {
            setShowModal(true);
        }
    }, [isLoginCompleteModalVisible]);


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
                backgroundColor: Theme.colors.primaryColor,
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
                        containerStyle={styles.otpContainer}
                        textInputStyle={styles.underlineStyleBase}
                        tintColor={Theme.colors.primaryColor}
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

                        >
                            <Text style={{
                                color: Theme.colors.primaryColor
                            }}>resend OTP</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View>
                    <TouchableOpacity style={styles.btn}
                        onPress={() => {

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
        borderColor: Theme.colors.primaryColor,
    },
    btn: {
        backgroundColor: Theme.colors.primaryColor,
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