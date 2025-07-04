import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Image,
    ImageBackground,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TextStyle,
    TouchableOpacity,
    View
} from "react-native";
import { Theme } from "../Branding/Theme";
import { useEffect, useState } from "react";
import LottieView from "lottie-react-native";
import { AntDesign, Feather, FontAwesome6, Fontisto } from "@expo/vector-icons";
import * as yup from "yup"
import { Formik } from "formik";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import ResultModal from "../Modals/FailedModal";
import { useNavigation } from "@react-navigation/native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../Firebase/Settings";

interface LoginIprops {

}

interface LoginValues {
    email: string;
    password: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Define your view dimensions (manually or based on your design)
const VIEW_WIDTH = 300;
const VIEW_HEIGHT = 150;

// Calculate offset
const offsetX = (screenWidth - VIEW_WIDTH) / 2;
const offsetY = (screenHeight - VIEW_HEIGHT) / 3.8;

const LoginScreen = ({

}: LoginIprops) => {

    const [isLoginCompleteModalVisible, setIsLoginCompleteModalVisible] = useState(false);

    // Email domain whitelist (add more as needed)
    const allowedDomains = ['com', 'net', 'org', 'io', 'co', 'edu', 'gov'];

    // Validation schema
    const loginValidation = yup.object().shape({
        email: yup
            .string()
            .trim()
            .email("Invalid email format")
            .required("Email is required"),
        password: yup
            .string()
            .required("Password is required"),
    });
    // const { signIn, setActive, isLoaded } = useSignIn();
    // const router = useRouter()
    const [isLoading, setIsLoading] = useState(false);
    const [togglePasswordVisibility, setTogglePasswordVisibility] = useState(false);
    const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
    const [isFailedModalVisible, setFailedModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    const navigation = useNavigation<any>();

    useEffect(() => {
        if (isLoginCompleteModalVisible) {
            setIsLoginCompleteModalVisible(true)
        }
    }, [isLoginCompleteModalVisible]);

    const saveUserToStorage = async (uid: any) => {
        try {
            await AsyncStorage.setItem('userUid', uid);
            console.log("User saved successfully");
        } catch (e) {
            console.log("Saving user failed: ", e);
        }
    }

    const loginWithEmail = async (values: { email: string, password: string }) => {
        setIsLoading(true);
        try {
            const userCredentials = await signInWithEmailAndPassword(
                auth,
                values.email,
                values.password
            );
            const user = userCredentials.user;
            const uid = userCredentials.user.uid;
            saveUserToStorage(uid)
            console.log('Stored user:', user);
            setIsLoading(false);
            console.log("User signed in:", user.email);
            console.log("Email verified: ", user.emailVerified);
            navigation.reset({
                index: 0,
                routes: [{ name: "MainDrawer" }]
            })
            return user;
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
            setIsLoading(false)
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
            <Formik<LoginValues>
                initialValues={{ email: "", password: "" }}
                validationSchema={loginValidation}
                onSubmit={(values) => loginWithEmail(values)}
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
                            }}>SIGN IN</Text>
                            <Text style={{
                                fontWeight: "300"
                            }}>GET STARTED BY PROVIDING YOUR</Text>
                            <Text style={{
                                fontWeight: "300"
                            }}>CREDENTIALS</Text>
                        </View>
                        <View style={{
                            padding: 20,
                            paddingTop: 20,
                            gap: 20,
                            bottom: 40
                        }}>
                            <View style={{
                                backgroundColor: "white",
                                overflow: "hidden",
                                borderRadius: 10,
                                bottom: 80
                            }}>
                                <View style={{
                                    backgroundColor: "rgba(0, 0, 0, 0.1)",
                                    gap: 10,
                                    padding: 20
                                }}>
                                    <View style={{
                                        gap: 5
                                    }}>
                                        <View style={[styles.textinput_container, {
                                            marginBottom: 5,
                                        }]}>
                                            <Image source={require("../../assets/BackgroundImages/email-icon.png")}
                                                style={{
                                                    height: 20,
                                                    width: 20,
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
                                                placeholder="**********"
                                                onChangeText={handleChange("password")}
                                                onBlur={handleBlur("password")}
                                            />
                                            <TouchableOpacity
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
                                    <View style={{
                                        alignItems: "flex-start",
                                        flexDirection: "row",
                                        gap: 5,
                                        paddingVertical: 5
                                    }}>
                                        <Text>Forgot Password</Text>
                                        <TouchableOpacity
                                            onPress={() => {
                                                navigation.navigate("ForgottenPassword")
                                            }}
                                        >
                                            <Text style={{
                                                color: "#FA8128",
                                                fontWeight: "500",
                                            }}>CLICK HERE</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                            <View style={{
                                gap: 10
                            }}>
                                <TouchableOpacity
                                    onPress={async () => {
                                        const errors = await validateForm();
                                        setTouched({ email: true, password: true });
                                        if (!errors.email && !errors.password) {
                                            handleSubmit();
                                        }
                                    }}
                                    style={[styles.continue_email_button, {
                                        padding: 25
                                    }]}>
                                    <Text style={styles.email_button_text}>Sign In</Text>
                                    <Image source={require("../../assets/BackgroundImages/VectorRight.png")}
                                        style={[styles.button_icon, {
                                            height: 20,
                                            width: 20
                                        }]}
                                    />
                                </TouchableOpacity>
                                <View style={{ flexDirection: 'row', gap: 6, alignSelf: "center" }}>
                                    <Text style={{ color: '#333', fontSize: 16 }}>Don't have an account?</Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            navigation.reset({
                                                index: 0,
                                                routes: [{ name: "SignUpScreen" }]
                                            })
                                        }}
                                    >
                                        <Text style={{ color: "#FFD125", fontSize: 16 }}>Sign Up</Text>
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
        </ImageBackground>
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
        backgroundColor: "white",
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
        borderColor: "#FA8128",
        position: 'relative',
    },
    textinput: {
        flex: 1,
        paddingVertical: Platform.OS === "android" ? 15 : 20,
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