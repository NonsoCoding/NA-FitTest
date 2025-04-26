import {
    ActivityIndicator,
    Alert,
    Animated,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TextStyle,
    TouchableOpacity,
    View
} from "react-native";
import { Theme } from "../Branding/Theme";
import { useAuth, useSignIn } from '@clerk/clerk-expo'
import { useState } from "react";
import LottieView from "lottie-react-native";
import { AntDesign, Feather, FontAwesome6, Fontisto } from "@expo/vector-icons";
import * as yup from "yup"
import { Formik } from "formik";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

interface LoginIprops {
    navigation?: any;
}
const endPoint = process.env.EXPO_PUBLIC_API_URL;

interface LoginValues {
    email: string;
    password: string;
}

const LoginScreen = ({
    navigation,
}: LoginIprops) => {

    const [isLoginCompleteModalVisible, setIsLoginCompleteModalVisible] = useState(false);
    // Enhanced password rules regex
    const passwordRules = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

    // Email domain whitelist (add more as needed)
    const allowedDomains = ['com', 'net', 'org', 'io', 'co', 'edu', 'gov'];

    // Validation schema
    const loginValidation = yup.object().shape({
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
    // const { signIn, setActive, isLoaded } = useSignIn()
    // const router = useRouter()
    const [isLoading, setIsLoading] = useState(false);
    const [togglePasswordVisibility, setTogglePasswordVisibility] = useState(false);

    const onSignInPress = async (emailAddress: string, password: string) => {
        try {
            setIsLoading(true)
            const mainData = await fetch(`${endPoint}/login`, {
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

            const res = await mainData.json();

            if (res.accessToken && res.accessToken.length > 10) {
                await AsyncStorage.setItem("token", res.accessToken);
                setIsLoginCompleteModalVisible(true);
                navigation.navigate("MainDrawer");
                setIsLoading(false)
                console.log("Logged In");
            } else if (res.statusCode === 403 && res.success === false) {
                setIsLoading(false)
                Alert.alert("Unsuccessful login attempt", "You have been blocked, please contact tacticalpt@gmail.com", [{ text: "Ok" }]);
            }
            else {
                Alert.alert("Unsuccessful", "Incorrect email or password!", [{ text: "Ok" }]);
            }
            // console.log(res);

        } catch (err) {
            setIsLoading(false);
            console.log(err);
            Alert.alert("Error", "Login failed. Please try again.", [{ text: "Ok" }]);
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
            <Formik<LoginValues>
                initialValues={{ email: "", password: "" }}
                validationSchema={loginValidation}
                onSubmit={(values, { setSubmitting }) => {
                    onSignInPress(values.email, values.password);
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
                            <View>
                                <View>
                                    <Text style={{
                                        fontSize: 40,
                                        fontWeight: 700,
                                        color: "white",
                                        lineHeight: 45,
                                    }}>Sign into your account</Text>
                                </View>
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: 200,
                                    color: "white"
                                }}>Get started by providing your credentials</Text>
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
                                    <Text>
                                        Email
                                    </Text>
                                    <View style={[styles.textinput_container, {
                                        marginBottom: 5,
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
                                    <Text>
                                        Password
                                    </Text>
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
                                            placeholder="**********"
                                            onChangeText={handleChange("password")}
                                            onBlur={handleBlur("password")}
                                        />
                                        <TouchableOpacity
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
                                <View style={{
                                    alignItems: "flex-end"
                                }}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            navigation.reset({
                                                index: 0,
                                                routes: [{ name: "ForgottenPassword" }]
                                            })
                                        }}
                                    >
                                        <Text style={{
                                            color: Theme.colos.primaryColor,
                                            fontWeight: 200
                                        }}>Forgot Password?</Text>
                                    </TouchableOpacity>
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
                                    <Text style={styles.email_button_text}>Sign In</Text>
                                    <Image source={require("../../assets/Icons/fast-forward.png")}
                                        style={[styles.button_icon, {
                                            height: 20,
                                            width: 20
                                        }]}
                                    />
                                </TouchableOpacity>
                                <View style={styles.dividerContainer}>
                                    <View style={styles.line} />
                                    <Text style={styles.dividerText}>Or login with</Text>
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
                                        gap: 15,
                                        borderRadius: 5,
                                        borderColor: Theme.colos.lightPrimary,
                                        flexDirection: "row",
                                        justifyContent: "center"
                                    }}
                                        onPress={() => {
                                            setIsLoginCompleteModalVisible(true)
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
                                    <Text style={{ color: '#333', fontSize: 16, fontFamily: Theme.Montserrat_Font.Mont600 }}>Don't have an account?</Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            navigation.reset({
                                                index: 0,
                                                routes: [{ name: "SignUpScreen" }]
                                            })
                                        }}
                                    >
                                        <Text style={{ color: Theme.colos.primaryColor, fontSize: 16, fontFamily: Theme.Montserrat_Font.Mont600 }}>Sign Up</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                )}
            </Formik>
            <Modal
                visible={isLoginCompleteModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => {
                    setIsLoginCompleteModalVisible(false)
                }}
            >
                <View style={{
                    justifyContent: "flex-end",
                    flex: 1,
                    padding: 20,
                    paddingBottom: 30
                }}>
                    <View style={{
                        height: "8%",
                        borderRadius: 5,
                        paddingHorizontal: 20,
                        alignItems: "center",
                        gap: 15,
                        flexDirection: "row",
                        backgroundColor: "#006F46"
                    }}>
                        <TouchableOpacity style={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            paddingTop: 10,
                            paddingRight: 15
                        }}
                            onPress={() => {
                                setIsLoginCompleteModalVisible(false);
                            }}
                        >
                            <Text style={{
                                color: 'white'
                            }}>X</Text>
                        </TouchableOpacity>
                        <Image source={require("../../assets/downloadedIcons/info-fill.png")}
                            style={{
                                height: 24,
                                width: 24
                            }}
                        />
                        <Text style={{
                            color: "white"
                        }}>Successful!</Text>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default LoginScreen;

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
        backgroundColor: Theme.colos.primaryColor,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
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