import { Alert, Dimensions, Image, ImageBackground, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
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


const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Define your view dimensions (manually or based on your design)
const VIEW_WIDTH = 300;
const VIEW_HEIGHT = 150;

// Calculate offset
const offsetX = (screenWidth - VIEW_WIDTH) / 4;
const offsetY = (screenHeight - VIEW_HEIGHT) / 3.8;


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
        <ImageBackground style={{
            flex: 1,
            padding: 20,
            marginTop: Platform.OS === "android" ? StatusBar.currentHeight : null
        }}
            source={require("../../assets/BackgroundImages/Background.png")}
            resizeMode="cover"
        >
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
                            flex: 1,
                            justifyContent: "flex-end",
                        }}>
                            <View style={{
                                position: "absolute",
                                width: VIEW_WIDTH,
                                height: VIEW_HEIGHT,
                                top: offsetY,
                                left: offsetX,
                                alignItems: "center",
                                gap: 10,
                                justifyContent: "center",
                            }}>
                                <Text style={{
                                    fontSize: 28,
                                    fontWeight: "500"
                                }}>RESET PASSWORD</Text>
                                <View style={{
                                    maxWidth: 400,
                                }}>
                                    <Text style={{
                                        fontWeight: "300"
                                    }}>A 4 DIGIT CODE HAS BEEN SENT TO THE EMAIL CONNECTED TO YOUR ACCOUNT</Text>
                                </View>
                            </View>
                            <View style={{
                                bottom: 40
                            }}>
                                <View style={{
                                    backgroundColor: "white",
                                    overflow: "hidden",
                                    borderRadius: 10,
                                    bottom: 80,
                                }}>
                                    <View style={{
                                        backgroundColor: "rgba(0, 0, 0, 0.1)",
                                        gap: 10,
                                        padding: 20
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
                                </View>
                                <View style={{
                                    gap: 15,
                                }}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            handleSubmit();
                                        }}
                                        disabled={isSubmitting}
                                        style={[styles.continue_email_button, {
                                            padding: 25
                                        }]}>
                                        <Text style={styles.email_button_text}>continue</Text>
                                        <Image source={require("../../assets/BackgroundImages/VectorRight.png")}
                                            style={[styles.button_icon, {
                                                height: 20,
                                                width: 20
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
                                            <Text style={{ color: "#FFD125", fontSize: 16 }}>Login</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )
                }}
            </Formik>
        </ImageBackground>
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
        backgroundColor: "white",
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
        color: "black"
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
        borderBottomWidth: 1,
        borderColor: "#FA8128",
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