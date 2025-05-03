// import { useSignUp, useAuth, useUser } from '@clerk/clerk-expo'
import * as React from 'react'
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
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
// import Toast from "react-native-toast-message";

const endPoint = process.env.EXPO_PUBLIC_API_URL;

interface SignUpIprops {
    navigation?: any;
}

// Enhanced password rules regex
const passwordRules = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

// Email domain whitelist (add more as needed)
const allowedDomains = ['com', 'net', 'org', 'io', 'co', 'edu', 'gov'];

// Validation schema
const signUpValidation = yup.object().shape({
    email: yup
        .string()
        .trim()
        .email("Invalid email format")
        .test(
            'valid-domain',
            'We only accept .com, .net, .org, .io, .co, .edu, or .gov emails',
            (value) => {
                if (!value) return false;
                const domain = value.split('.').pop()?.toLowerCase();
                return domain ? allowedDomains.includes(domain) : false;
            }
        )
        .required("Email is required"),
    password: yup
        .string()
        .matches(
            passwordRules,
            "Must contain: 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special character"
        )
        .required("Password is required"),
});

// console.log("new")
interface SignUpValues {
    email: string;
    password: string;
}


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



    const onSignUpPress = async (emailAddress: string, password: string) => {
        setIsLoading(true)
        const emailId = await AsyncStorage.getItem("email");
        const passwordId = await AsyncStorage.getItem("password");

        if (emailId?.toLowerCase() !== emailAddress.toLowerCase()) {
            setIsLoading(true)
            try {
                console.log(`Attempting to connect to: ${endPoint}/signup`);
                const mainData = await fetch(`${endPoint}/signup`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({
                        email: emailAddress.toLowerCase(),
                        password: password,
                    }),
                });
                console.log("Response status:", mainData.status);
                const res = await mainData.json();
                console.log(res.otp);
                if (res.success) {

                    await AsyncStorage.setItem("otp", res.otp).then(() => {
                        setIsLoading(false)
                        Alert.alert("Sucess", `Your OTP code is ${res.otp}`, [{ text: "Ok" }])
                    }).then(async () => {
                        await AsyncStorage.setItem("email", emailAddress);
                        await AsyncStorage.setItem("password", password);
                        navigation.navigate("OTPScreen", { isLoginCompleteModalVisible: true });
                        Toast.show({
                            type: 'success',
                            text1: `Your otp code is ${res.otp}`,
                            swipeable: true,
                            visibilityTime: 1000
                        });
                    });
                    console.log(res);
                    console.log(password);

                } else {
                    Alert.alert("Unsuccessful", "You have already been registered, please proceed to login.", [{ text: "Ok" }]);
                }
            } catch (err: any) {
                setIsLoading(false)
                console.log("Network error details:", err);
                console.log("Error message:", err.message);
                console.log("Error name:", err.name);
                Alert.alert("Connection Error", `Failed to connect: ${err.message}`);
            }

        } else {
            Alert.alert("Error", "You are already signed in, please proceed to login", [{ text: "Ok" }]);
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
                    <Text style={{ color: "#fff", marginTop: 10, fontFamily: Theme.Montserrat_Font.Mont400 }}>Signing you in...</Text>
                </View>
            )}
            <Formik<SignUpValues>
                initialValues={{ email: "", password: "" }}
                validationSchema={signUpValidation}
                onSubmit={async (values) => {
                    await onSignUpPress(values.email, values.password);
                    // // setSubmitting(false);

                }}
            >
                {({ handleChange, handleBlur, handleSubmit, validateForm, values, errors, touched, setTouched }) => (
                    <View style={{
                        flex: 1
                    }}>
                        <View style={{
                            flex: 1,
                            backgroundColor: Theme.colos.primaryColor,
                            padding: 20,
                            paddingBottom: 30,
                            justifyContent: "flex-end"
                        }}>
                            <View style={{
                                gap: 5
                            }}>
                                <View>
                                    <Text style={{
                                        fontSize: 30,
                                        fontWeight: 700,
                                        color: "white",
                                        lineHeight: 45,
                                    }}>Sign up to create your account</Text>
                                </View>
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: 200,
                                    color: "white"
                                }}>Let us create an account for you</Text>
                            </View>
                        </View>
                        <View style={{
                            flex: 3,
                            padding: 20,
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
                                            placeholder="tacticalpt@gmail.com"
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
                                        <Image source={require("../../assets/downloadedIcons/lock-2-fill.png")}
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
                                            <Feather name={togglePasswordVisibility ? 'eye' : 'eye-off'} size={20} color={Theme.colos.primaryColor} />
                                        </TouchableOpacity>
                                    </View>
                                    {touched.password && errors.password && (
                                        <Text style={{ color: "red" }}>{errors.password}</Text>
                                    )}
                                </View>
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
                                        padding: 20
                                    }]}>
                                    <Text style={styles.email_button_text}>Sign Up</Text>
                                    <Image source={require("../../assets/Icons/fast-forward.png")}
                                        style={[styles.button_icon, {
                                            height: 20,
                                            width: 20
                                        }]}
                                    />
                                </TouchableOpacity>
                                <View style={styles.dividerContainer}>
                                    <View style={styles.line} />
                                    <Text style={styles.dividerText}>Or create an account with</Text>
                                    <View style={styles.line} />
                                </View>
                                <View style={{
                                    flexDirection: "row",
                                    gap: 20
                                }}>
                                    <TouchableOpacity style={{
                                        borderWidth: 1,
                                        alignItems: "center",
                                        padding: 5,
                                        flex: 1,
                                        borderRadius: 5,
                                        borderColor: Theme.colos.lightPrimary,
                                        flexDirection: "row",
                                        justifyContent: "center"
                                    }}
                                    // onPress={() => {
                                    //     navigation.navigate("MainDrawer");
                                    // }}
                                    >
                                        <Text style={{
                                            color: Theme.colos.primaryColor,
                                            fontSize: 18
                                        }}>GOOGLE</Text>
                                        <LottieView
                                            source={require("../../assets/downloadedIcons/google3.json")}
                                            style={{
                                                height: 40,
                                                width: 40
                                            }}
                                            resizeMode="contain"
                                            autoPlay={true}
                                            loop={true}
                                        />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flexDirection: 'row', gap: 6, alignSelf: "center" }}>
                                    <Text style={{ color: '#333', fontSize: 16, fontFamily: Theme.Montserrat_Font.Mont600 }}>Already have an account?</Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            navigation.reset({
                                                index: 0,
                                                routes: [{ name: "LoginScreen" }]
                                            })
                                        }}
                                    >
                                        <Text style={{ color: Theme.colos.primaryColor, fontSize: 16, fontFamily: Theme.Montserrat_Font.Mont600 }}>Log in</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                )}
            </Formik>
        </View>
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
        backgroundColor: Theme.colos.primaryColor,
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
        fontFamily: Theme.Montserrat_Font.Mont500,
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
        borderColor: Theme.colos.lightPrimary,
        position: 'relative',
    },
    textinput: {
        flex: 1,
        paddingVertical: 20,
        paddingHorizontal: 10,
        fontFamily: Theme.Montserrat_Font.Mont500,
        fontSize: 14,
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
        backgroundColor: Theme.colos.lightPrimary,
    },
    dividerText: {
        paddingHorizontal: 10,
        color: '#7A7A7A',
        fontSize: 14,
    },
})