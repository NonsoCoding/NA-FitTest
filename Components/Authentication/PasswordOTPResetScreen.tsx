import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Theme } from "../Branding/Theme";
import { useRef, useState } from "react";

interface IPasswordOtpProps {
    navigation: any;
}

const PasswordOTPScreen = ({
    navigation
}: IPasswordOtpProps) => {
    const [code, setCode] = useState('');
    const otpInput = useRef<any>();

    const handleCodeFilled = (code: string) => {
        console.log('OTP ENTERED: ', code);
    }

    return (
        <View style={styles.container}>
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
                        fontWeight: "500"
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
                            color: Theme.colors.primaryColor
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
        backgroundColor: Theme.colors.primaryColor,
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 5
    }
})