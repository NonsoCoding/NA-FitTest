import { useSignUp, useAuth, useUser } from '@clerk/clerk-expo'
import * as React from 'react'
import { Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Theme } from "../Branding/Theme";
import { useState } from "react";
import * as stream from "node:stream";
import * as yup from "yup";
import LottieView from 'lottie-react-native';
import { Formik } from 'formik';
import { AntDesign, FontAwesome6, Fontisto } from '@expo/vector-icons';

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



    // const signingOut = async (sessionId: string) => {
    //     await signOut({
    //         sessionId,
    //     })
    //         .then(() => {
    //             console.log("done");
    //         })
    //         .catch((e: Error) => {
    //             console.log(e);
    //         });
    // };


    return (
        // <View style={{
        //     justifyContent: "flex-end",
        //     flex: 1,
        // }}>
        //     <View style={{
        //         gap: 20,
        //         backgroundColor: Theme.colos.primaryColor,
        //         height: "55%",
        //         paddingBottom: 50,
        //         padding: 30,
        //         justifyContent: 'center',
        //         borderTopRightRadius: 25,
        //         borderTopLeftRadius: 25,
        //         shadowColor: '#000',
        //         shadowOffset: {
        //             width: 0,
        //             height: -80,
        //         },
        //         shadowOpacity: 0.6,
        //         shadowRadius: 25,
        //         elevation: 10,
        //     }}>
        //         <ScrollView
        //             showsVerticalScrollIndicator={true}
        //             contentContainerStyle={{
        //                 justifyContent: "space-between",
        //                 flex: 1,
        //             }}
        //         >
        //             <View style={{
        //                 gap: 20
        //             }}>
        //                 <View style={styles.textinput_container}>
        //                     <Image
        //                         style={styles.button_icon}
        //                         source={require("../../assets/Icons/Email_Login_Icon.png")}
        //                     />
        //                     <TextInput
        //                         placeholder="your email"
        //                         placeholderTextColor={"#8c8c8e"}
        //                         style={styles.textinput}
        //                         value={emailAddress}
        //                         onChangeText={setEmailAddress}
        //                     />
        //                 </View>
        //                 <View style={styles.textinput_container}>
        //                     <Image
        //                         style={styles.button_icon}
        //                         source={require("../../assets/Icons/Password_Icon.png")}
        //                     />
        //                     <TextInput
        //                         placeholder="your password"
        //                         placeholderTextColor={"#8c8c8e"}
        //                         style={styles.textinput}
        //                         value={password}
        //                         onChangeText={setPassword}
        //                     />
        //                 </View>
        //                 <View style={{
        //                     flexDirection: "row",
        //                     gap: 10
        //                 }}>
        //                     <View style={{
        //                         flex: 2
        //                     }}>
        //                         <TextInput
        //                             placeholder="OTP..."
        //                             placeholderTextColor={"#8c8c8e"}
        //                             style={styles.otp_textinput}
        //                             value={code}
        //                             onChangeText={(code: string) => setCode(code)}
        //                             editable={pendingVerification && true}
        //                         />
        //                     </View>
        //                     <TouchableOpacity
        //                         onPress={onSignUpPress}
        //                         style={styles.get_code_button}>
        //                         <Text style={{ color: "white", fontSize: 12, fontFamily: Theme.Montserrat_Font.Mont500 }}>Get Code</Text>
        //                     </TouchableOpacity>
        //                 </View>
        //             </View>
        //             <View style={{
        //                 gap: 20
        //             }}>
        //                 <TouchableOpacity
        //                     onPress={onVerifyPress}
        //                     style={[styles.continue_email_button, {
        //                         padding: 15
        //                     }]}>
        //                     <Image source={require("../../assets/Icons/fast-forward.png")}
        //                         style={[styles.button_icon, {
        //                             width: 30,
        //                             height: 30
        //                         }]}
        //                     />
        //                     <Text style={styles.email_button_text}>Sign Up</Text>
        //                 </TouchableOpacity>
        //                 <View style={{ flexDirection: 'row', gap: 6, alignSelf: "center" }}>
        //                     <Text style={{ color: 'white', fontSize: 16, fontFamily: Theme.Montserrat_Font.Mont600 }}>Already have an account?</Text>
        //                     <TouchableOpacity
        //                         onPress={() => {
        //                             navigation.navigate("LoginScreen")
        //                         }}
        //                     >
        //                         <Text style={{ color: "#ADCC05", fontSize: 16, fontFamily: Theme.Montserrat_Font.Mont600 }}>click here</Text>
        //                     </TouchableOpacity>
        //                 </View>
        //             </View>
        //         </ScrollView>
        //     </View>
        // </View>
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
                            height: "30%",
                            backgroundColor: Theme.colos.primaryColor,
                            padding: 20,
                            paddingBottom: 30,
                            justifyContent: "flex-end"
                        }}>
                            <View>
                                <View>
                                    <Text style={{
                                        fontSize: 30,
                                        fontWeight: 500,
                                        color: "white",
                                        lineHeight: 45,
                                    }}>Create an Account</Text>
                                </View>
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: 300,
                                    color: "white"
                                }}>Fill in the details to create an account</Text>
                            </View>
                        </View>
                        <View style={{
                            flex: 1,
                            padding: 20,
                            paddingTop: 20
                        }}>
                            <View style={{
                                gap: 10
                            }}>
                                <View style={{
                                    gap: 5
                                }}>
                                    <Text>
                                        Email
                                    </Text>
                                    <View style={[styles.textinput_container, {
                                        marginBottom: 5
                                    }]}>
                                        <Fontisto
                                            name="email"
                                            size={22}
                                            color={Theme.colos.primaryColor}
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
                                    <Text>
                                        Password
                                    </Text>
                                    <View style={styles.textinput_container}>
                                        <AntDesign
                                            name="lock"
                                            size={25}
                                            color={Theme.colos.primaryColor}
                                        />
                                        <TextInput
                                            placeholderTextColor={"#8c8c8e"}
                                            style={styles.textinput}
                                            value={values.password}
                                            placeholder='***********'
                                            onChangeText={handleChange("password")}
                                            onBlur={handleBlur("password")}
                                        />
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
                                        padding: 15
                                    }]}>
                                    <Image source={require("../../assets/Icons/fast-forward.png")}
                                        style={[styles.button_icon, {
                                            height: 30,
                                            width: 30
                                        }]}
                                    />
                                    <Text style={styles.email_button_text}>Continue</Text>
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
                                        padding: 2,
                                        flex: 1,
                                        borderRadius: 7,
                                        borderColor: Theme.colos.borderColor,
                                        flexDirection: "row",
                                        justifyContent: "center"
                                    }}
                                        onPress={() => {
                                            navigation.reset({
                                                index: 0,
                                                routes: [{ name: "OTPScreen" }]
                                            })
                                        }}
                                    >
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
                                        <Text style={{
                                            color: "#333"
                                        }}>Google</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{
                                        borderWidth: 1,
                                        padding: 2,
                                        justifyContent: "center",
                                        borderRadius: 7,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        borderColor: Theme.colos.borderColor,
                                        flex: 1
                                    }}>
                                        <LottieView
                                            source={require("../../assets/downloadedIcons/Animation - 1745355829190.json")}
                                            style={{
                                                height: 40,
                                                width: 40
                                            }}
                                            resizeMode="contain"
                                            autoPlay={true}
                                            loop={true}
                                        />
                                        <Text style={{
                                            color: "#333"
                                        }}>Facebook</Text>
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
        justifyContent: "center",
        alignItems: "center",
        padding: 15,
        borderRadius: 10,
        gap: 15
    },
    google_button_text: {
        fontSize: 18,
        fontWeight: "300"
    },
    email_button_text: {
        fontSize: 18,
        fontFamily: Theme.Montserrat_Font.Mont500,
        color: "white"
    },
    button_icon: {
        height: 40,
        width: 40,
        resizeMode: "contain"
    },
    textinput_container: {
        backgroundColor: "white",
        flexDirection: "row",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
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
        backgroundColor: '#E0E0E0',
    },
    dividerText: {
        paddingHorizontal: 10,
        color: '#7A7A7A',
        fontSize: 14,
    },
})