
import * as React from 'react'
import { Alert, Dimensions, Image, ImageBackground, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Theme } from "../Branding/Theme";
import { useState } from "react";
import * as stream from "node:stream";
import * as yup from "yup";
import LottieView from 'lottie-react-native';
import { Formik } from 'formik';
import { AntDesign, Feather, FontAwesome6, Fontisto } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from 'react-native-toast-message';
import Constants from 'expo-constants';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../../Firebase/Settings';

interface SignUpIprops {
    navigation?: any;
}

// Validation schema
const signUpValidation = yup.object().shape({
    email: yup
        .string()
        .trim()
        .email("Invalid email format")
        .required("Email is required"),
    password: yup
        .string()
        .min(5, "must be at least 5 characters")
        .required("Password is required"),
});

// console.log("new")
interface SignUpValues {
    email: string;
    password: string;
    auth?: any;
}


const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Define your view dimensions (manually or based on your design)
const VIEW_WIDTH = 300;
const VIEW_HEIGHT = 150;

// Calculate offset
const offsetX = (screenWidth - VIEW_WIDTH) / 2;
const offsetY = (screenHeight - VIEW_HEIGHT) / 3.8;


const SignUpScreen = ({
    navigation,
}: SignUpIprops) => {



    // const { isLoaded, signUp, setActive } = useSignUp()

    // const { signOut, sessionId, isSignedIn } = useAuth()

    const [isLoading, setIsLoading] = useState(false);
    const [pendingVerification, setPendingVerification] = useState(false)
    const [togglePasswordVisibility, setTogglePasswordVisibility] = useState(false);
    const [isLoginCompleteModalVisible, setIsLoginCompleteModalVisible] = useState(false)
    const [code, setCode] = useState('');

    const saveUserToStorage = async (uid: any) => {
        try {
            await AsyncStorage.setItem('userUid', uid);
            console.log("User saved successfully");
        } catch (e) {
            console.log("Saving user failed: ", e);
        }
    }

    const SignUp = async (values: SignUpValues) => {
        setIsLoading(true);
        try {
            const userCredentials = await createUserWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredentials.user;
            const uid = userCredentials.user.uid;
            console.log('User created: ', user);
            await sendEmailVerification(user);
            saveUserToStorage(uid)
            Alert.alert('Success', 'A verification link has been sent to your email.');
            navigation.navigate('VerificationScreen');
        } catch (error: any) {
            setIsLoading(false);
            let errorMessage = 'Login failed';
            console.log('Error saving user data: ', error);
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = "This user does not exist";
                    break;
                case 'auth/invalid-credential':
                    errorMessage = "Invalid email or password";
                    console.log("Caught invalid-credentials error");
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Invalid email or password';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed login attempts. Try again later.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Please enter a valid email address';
                    break;
                default:
                    errorMessage = `Error: ${error.code} - ${error.message}`;
                    console.log("Default error case hit with:", error.code);
            }
            console.log("Error message se to: ", errorMessage);
            Alert.alert(
                "Login Error",
                errorMessage,
                [
                    { text: "OK", onPress: () => console.log("OK Pressed") }
                ]
            );
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <ImageBackground
            source={require("../../assets/BackgroundImages/Background.png")}
            style={{
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
            <Formik<SignUpValues>
                initialValues={{ email: "", password: "" }}
                validationSchema={signUpValidation}
                onSubmit={SignUp}
            >
                {({ handleChange, handleBlur, handleSubmit, validateForm, values, errors, touched, setTouched }) => (
                    <View style={{
                        flex: 1,
                        justifyContent: "flex-end"
                    }}>
                        <View style={{
                            position: "absolute",
                            width: VIEW_WIDTH,
                            height: VIEW_HEIGHT,
                            top: offsetY,
                            left: offsetX,
                            alignItems: "center",
                            justifyContent: "center",
                        }}>
                            <Text style={{
                                fontWeight: "700",
                                fontSize: 40
                            }}>SIGN UP</Text>
                            <Text style={{
                                fontWeight: "300"
                            }}>LET US CREATE AN ACCOUNT FOR YOU</Text>
                        </View>
                        <View style={{
                            padding: 20,
                            bottom: 40,
                            gap: 20
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
                                    paddingHorizontal: 20,
                                    paddingTop: 20,
                                    paddingBottom: 30
                                }}>
                                    <View style={{
                                        gap: 5
                                    }}>
                                        <View style={[styles.textinput_container, {
                                            marginBottom: 5
                                        }]}>
                                            <Image source={require("../../assets/BackgroundImages/email-icon.png")}
                                                style={{
                                                    height: 20,
                                                    width: 20
                                                }}
                                                resizeMode='contain'
                                            />
                                            <TextInput
                                                style={styles.textinput}
                                                placeholderTextColor={"#8c8c8e"}
                                                placeholder="Dapt@gmail.com"
                                                value={values.email}
                                                onChangeText={handleChange("email")}
                                                onBlur={handleBlur("email")}
                                            />
                                        </View>
                                        {touched.email && errors.email && (
                                            <Text style={{ color: "red" }}>{errors.email}</Text>
                                        )}
                                    </View>
                                    <View style={{
                                        gap: 5
                                    }}>
                                        <View style={styles.textinput_container}>
                                            <Image source={require("../../assets/BackgroundImages/Password-icon.png")}
                                                style={{
                                                    height: 20,
                                                    width: 20
                                                }}
                                                resizeMode='contain'
                                            />
                                            <TextInput
                                                placeholderTextColor={"#8c8c8e"}
                                                style={styles.textinput}
                                                value={values.password}
                                                secureTextEntry={!togglePasswordVisibility}
                                                placeholder='***********'
                                                onChangeText={handleChange("password")}
                                                onBlur={handleBlur("password")}
                                            />
                                            <TouchableOpacity style={{
                                            }}
                                                onPress={() => {
                                                    setTogglePasswordVisibility(!togglePasswordVisibility)
                                                }}
                                            >
                                                <Feather name={togglePasswordVisibility ? 'eye' : 'eye-off'} size={20} color={"#FA8128"} />
                                            </TouchableOpacity>
                                        </View>
                                        {touched.password && errors.password && (
                                            <Text style={{ color: "red" }}>{errors.password}</Text>
                                        )}

                                    </View>

                                </View>
                            </View>
                            <View style={{
                                gap: 10
                            }}>
                                <TouchableOpacity
                                    onPress={async () => {
                                        console.log("Submit button pressed"); // Add this
                                        const errors = await validateForm();
                                        setTouched({ email: true, password: true });
                                        if (!errors.email && !errors.password) {
                                            console.log("Form is valid, submitting..."); // Add this
                                            handleSubmit();
                                            // onSignUpPress(values.email, values.password);
                                        } else {
                                            console.log("Form errors:", errors); // Add this
                                        }
                                    }}
                                    style={[styles.continue_email_button, {
                                        padding: 25
                                    }]}>
                                    <Text style={styles.email_button_text}>Sign Up</Text>
                                    <Image source={require("../../assets/BackgroundImages/VectorRight.png")}
                                        style={[styles.button_icon, {
                                            height: 20,
                                            width: 20
                                        }]}
                                    />
                                </TouchableOpacity>
                                <View style={{ flexDirection: 'row', gap: 6, alignSelf: "center" }}>
                                    <Text style={{ color: '#333', fontSize: 16 }}>Already have an account?</Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            navigation.reset({
                                                index: 0,
                                                routes: [{ name: "LoginScreen" }]
                                            })
                                        }}
                                    >
                                        <Text style={{ color: "#FFD125", fontSize: 16 }}>Log in</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                )}
            </Formik>
        </ImageBackground>
    )
}

export default SignUpScreen;

const styles = StyleSheet.create({
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
        fontSize: 18,
        fontWeight: "500"
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
        backgroundColor: Theme.colors.lightPrimary,
    },
    dividerText: {
        paddingHorizontal: 10,
        color: '#7A7A7A',
        fontSize: 14,
    },
})