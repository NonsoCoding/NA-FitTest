import { useSignUp, useAuth, useUser } from '@clerk/clerk-expo'
import * as React from 'react'
import { Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Theme } from "../Branding/Theme";
import { useState } from "react";
import * as stream from "node:stream";
import * as yup from "yup";
import LottieView from 'lottie-react-native';
import { Formik } from 'formik';
import { AntDesign, Feather, FontAwesome6, Fontisto } from '@expo/vector-icons';

interface SignUpIprops {
    navigation?: any;
}


interface SignUpValues {
    email: string;
    password: string;
}


const SignUpScreen = ({
    navigation,
}: SignUpIprops) => {


    const signUpValidation = yup.object().shape({
        email: yup.string().email("Invalid email").required("Email is a required field"),
        password: yup.string().min(4, ("Too short!")).required("Password is required")
    })

    const { isLoaded, signUp, setActive } = useSignUp()

    const { signOut, sessionId, isSignedIn } = useAuth()

    const [isLoading, setIsLoading] = useState(false);
    const [pendingVerification, setPendingVerification] = useState(false)
    const [togglePasswordVisibility, setTogglePasswordVisibility] = useState(false);
    const [code, setCode] = useState('');

    // Inside your component
    const { user } = useUser();

    React.useEffect(() => {
        if (user) {
            console.log("User ID:", user.id);
        }
    }, [user]);

    const onSignUpPress = async (emailAddress: string, password: string) => {

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
            navigation.reset({
                index: 0,
                routes: [{ name: "OTPScreen" }]
            })
            setPendingVerification(true)
        } catch (err) {
            // See https://clerk.com/docs/custom-flows/error-handling
            // for more info on error handling
            console.error(JSON.stringify(err, null, 2));
            console.log(err);
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



    const signingOut = async (sessionId: string) => {
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
                onSubmit={(values, { setSubmitting }) => {
                    onSignUpPress(values.email, values.password);
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
                                gap: 10
                            }}>
                                <View>
                                    <Text style={{
                                        fontSize: 40,
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
                                        const errors = await validateForm();
                                        setTouched({ email: true, password: true });
                                        if (!errors.email && !errors.password) {
                                            handleSubmit();

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
                                        onPress={() => {
                                            signingOut("done")
                                        }}
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