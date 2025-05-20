import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Theme } from "../Branding/Theme";
import { Formik } from "formik";
import { FontAwesome6, Fontisto } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import * as yup from "yup";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";

interface IForgottenPasswordProps {
    navigation: any;
}

const emailValidation = yup.object().shape({
    email: yup.string().required().email('email is a required field.')
})

const ForgottenPassword = ({
    navigation
}: IForgottenPasswordProps) => {
    const auth = getAuth();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const resetPassword = async (values: { email: string }) => {
        const email = values.email.trim();
        try {
            setIsLoading(true)
            await sendPasswordResetEmail(auth, email);
            Alert.alert("Password reset email sent!");
        } catch (error: any) {
            setIsLoading(false);
            console.log('error: ', error);
            alert(error.message)
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <View style={{
            flex: 1
        }}>
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
                    <Text style={{ color: "#fff", marginTop: 10 }}>Signing you in...</Text>
                </View>
            )}
            <Formik
                initialValues={{ email: "" }}
                validationSchema={emailValidation}
                onSubmit={resetPassword}
            >
                {({ handleChange, handleSubmit, touched, errors, isSubmitting, values, handleBlur, setTouched }) => {
                    return (
                        <View style={{
                            flex: 1
                        }}>
                            <View style={{
                                flex: 1,
                                backgroundColor: Theme.colors.primaryColor,
                                padding: 20,
                                paddingBottom: 30,
                                justifyContent: "flex-end"
                            }}>
                                <View>
                                    <View>
                                        <Text style={{
                                            fontSize: 30,
                                            fontWeight: "700",
                                            color: "white",
                                            lineHeight: 45,
                                        }}>Forgotten Password</Text>
                                    </View>
                                    <Text style={{
                                        fontSize: 16,
                                        fontWeight: "300",
                                        color: "white"
                                    }}>Fill in your email to get a new password reset link</Text>
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
                                            <Image source={require("../../assets/downloadedIcons/mail-fill-black.png")}
                                                style={{
                                                    height: 20,
                                                    width: 20
                                                }}
                                                resizeMode='contain'
                                            />
                                            <TextInput
                                                style={styles.textinput}
                                                placeholderTextColor={"#8c8c8e"}
                                                value={values.email}
                                                onChangeText={handleChange("email")}
                                                onBlur={handleBlur("email")}
                                                placeholder="dapt@gmail.com"
                                            />
                                        </View>
                                        {touched.email && errors.email && (
                                            <Text style={{
                                                color: "red"
                                            }}>{errors.email}</Text>
                                        )}
                                    </View>
                                    <View style={{
                                        alignItems: "flex-end"
                                    }}>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => {
                                            handleSubmit();
                                        }}
                                        disabled={isSubmitting}
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
                                        <Text style={{ color: '#333', fontSize: 16 }}>Remebered password?</Text>
                                        <TouchableOpacity
                                            onPress={() => {
                                                navigation.reset({
                                                    index: 0,
                                                    routes: [{ name: "LoginScreen" }]
                                                })
                                            }}
                                        >
                                            <Text style={{ color: Theme.colors.primaryColor, fontSize: 16 }}>Login</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )
                }}
            </Formik>
        </View>
    )
}

export default ForgottenPassword;

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
        backgroundColor: Theme.colors.primaryColor,
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
        borderColor: Theme.colors.lightPrimary,
        position: 'relative',
    },
    textinput: {
        flex: 1,
        paddingVertical: 20,
        paddingHorizontal: 10,
        fontSize: 14,
    },
    otp_textinput: {
        backgroundColor: "white",
        borderRadius: 40,
        padding: 20,
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