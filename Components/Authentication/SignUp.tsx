
import * as React from 'react'
import { Alert, Dimensions, Image, ImageBackground, KeyboardAvoidingView, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
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
import { doc, getFirestore, setDoc } from 'firebase/firestore';

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
        const db = getFirestore();

        try {
            const userCredentials = await createUserWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredentials.user;
            const uid = userCredentials.user.uid;
            console.log('User created: ', user);
            saveUserToStorage(uid)

            await setDoc(doc(db, "UserRoles", uid), {
                role: "user",
                email: values.email,
                createdAt: new Date()
            })

            await sendEmailVerification(user);
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
        <View style={styles.safeArea}>
            <StatusBar
                barStyle="light-content"
                backgroundColor="transparent"
                translucent={true}
            />
            <ImageBackground
                source={require("../../assets/BackgroundImages/Background.png")}
                style={styles.container}
                resizeMode="cover"
            >
                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <LottieView
                            source={require("../../assets/ExerciseGifs/Animation - 1745262738989.json")}
                            style={styles.loadingAnimation}
                            resizeMode="contain"
                            loop={true}
                            autoPlay={true}
                        />
                        <Text style={styles.loadingText}>Signing you in...</Text>
                    </View>
                )}

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.keyboardAvoidingView}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContainer}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <Formik<SignUpValues>
                            initialValues={{ email: "", password: "" }}
                            validationSchema={signUpValidation}
                            onSubmit={SignUp}
                        >
                            {({ handleChange, handleBlur, handleSubmit, validateForm, values, errors, touched, setTouched }) => (
                                <View style={styles.formContainer}>
                                    {/* Header Section */}
                                    <View style={styles.headerSection}>
                                        <Text style={styles.headerTitle}>SIGN UP</Text>
                                        <Text style={styles.headerSubtitle}>Welcome! Let us create an account for you</Text>
                                    </View>

                                    {/* Form Section */}
                                    <View style={styles.formSection}>
                                        <View style={styles.inputContainer}>
                                            <View style={styles.inputWrapper}>
                                                <View style={styles.inputField}>
                                                    <View style={styles.inputIcon}>
                                                        <Image
                                                            source={require("../../assets/BackgroundImages/email-icon.png")}
                                                            style={styles.iconImage}
                                                            resizeMode='contain'
                                                        />
                                                    </View>
                                                    <TextInput
                                                        style={styles.textInput}
                                                        placeholderTextColor="#999"
                                                        placeholder="Enter your email"
                                                        value={values.email}
                                                        onChangeText={handleChange("email")}
                                                        onBlur={handleBlur("email")}
                                                        keyboardType="email-address"
                                                        autoCapitalize="none"
                                                        autoCorrect={false}
                                                    />
                                                </View>
                                                {touched.email && errors.email && (
                                                    <Text style={styles.errorText}>{errors.email}</Text>
                                                )}
                                            </View>

                                            <View style={styles.inputWrapper}>
                                                <View style={styles.inputField}>
                                                    <View style={styles.inputIcon}>
                                                        <Image
                                                            source={require("../../assets/BackgroundImages/Password-icon.png")}
                                                            style={styles.iconImage}
                                                            resizeMode='contain'
                                                        />
                                                    </View>
                                                    <TextInput
                                                        style={styles.textInput}
                                                        placeholderTextColor="#999"
                                                        placeholder="Enter your password"
                                                        value={values.password}
                                                        secureTextEntry={!togglePasswordVisibility}
                                                        onChangeText={handleChange("password")}
                                                        onBlur={handleBlur("password")}
                                                        autoCapitalize="none"
                                                        autoCorrect={false}
                                                    />
                                                    <TouchableOpacity
                                                        style={styles.eyeIcon}
                                                        onPress={() => setTogglePasswordVisibility(!togglePasswordVisibility)}
                                                        activeOpacity={0.7}
                                                    >
                                                        <Feather
                                                            name={togglePasswordVisibility ? 'eye' : 'eye-off'}
                                                            size={20}
                                                            color="#FA8128"
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                                {touched.password && errors.password && (
                                                    <Text style={styles.errorText}>{errors.password}</Text>
                                                )}
                                            </View>
                                        </View>

                                        {/* Action Buttons */}
                                        <View style={styles.actionSection}>
                                            <TouchableOpacity
                                                onPress={async () => {
                                                    const errors = await validateForm();
                                                    setTouched({ email: true, password: true });
                                                    if (!errors.email && !errors.password) {
                                                        handleSubmit();
                                                    }
                                                }}
                                                style={styles.signInButton}
                                                activeOpacity={0.8}
                                            >
                                                <Text style={styles.signInButtonText}>Sign Up</Text>
                                                <Image
                                                    source={require("../../assets/BackgroundImages/VectorRight.png")}
                                                    style={styles.buttonIcon}
                                                    resizeMode="contain"
                                                />
                                            </TouchableOpacity>

                                            <View style={styles.signUpContainer}>
                                                <Text style={styles.signUpText}>Already have an account? </Text>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        navigation.reset({
                                                            index: 0,
                                                            routes: [{ name: "LoginScreen" }]
                                                        })
                                                    }}
                                                    activeOpacity={0.7}
                                                >
                                                    <Text style={styles.signUpLink}>Sign In</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            )}
                        </Formik>
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Success Modal */}
                <Modal
                    visible={isLoginCompleteModalVisible}
                    animationType="fade"
                    transparent={true}
                    onRequestClose={() => setIsLoginCompleteModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setIsLoginCompleteModalVisible(false)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.modalCloseText}>×</Text>
                            </TouchableOpacity>
                            <View style={styles.modalContent}>
                                <Image
                                    source={require("../../assets/downloadedIcons/info-fill.png")}
                                    style={styles.modalIcon}
                                />
                                <Text style={styles.modalText}>Login Successful!</Text>
                            </View>
                        </View>
                    </View>
                </Modal>
            </ImageBackground>
        </View>
    )
}

export default SignUpScreen;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    container: {
        flex: 1,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        minHeight: screenHeight,
    },
    formContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 50,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
    },
    headerTitle: {
        fontSize: Platform.OS === 'ios' ? 36 : 32,
        fontWeight: '700',
        color: 'black',
        textAlign: 'center',
        marginBottom: 10,
        letterSpacing: 1,
    },
    headerSubtitle: {
        fontSize: Platform.OS === 'ios' ? 16 : 14,
        fontWeight: '300',
        color: "black",
        textAlign: 'center',
        lineHeight: 22,
    },
    formSection: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 25,
        marginBottom: 40,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
    },
    inputContainer: {
        gap: 20,
        marginBottom: 25,
    },
    inputWrapper: {
        gap: 8,
    },
    inputField: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e9ecef',
        paddingHorizontal: 15,
        minHeight: 55,
    },
    inputIcon: {
        marginRight: 12,
    },
    iconImage: {
        height: 20,
        width: 20,
        tintColor: '#666',
    },
    textInput: {
        flex: 1,
        fontSize: Platform.OS === 'ios' ? 16 : 14,
        color: '#333',
        paddingVertical: Platform.OS === 'ios' ? 15 : 12,
    },
    eyeIcon: {
        padding: 8,
    },
    errorText: {
        color: '#dc3545',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    forgotPasswordContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 5,
    },
    forgotPasswordText: {
        color: '#666',
        fontSize: 14,
    },
    forgotPasswordLink: {
        color: '#FA8128',
        fontSize: 14,
        fontWeight: '600',
    },
    actionSection: {
        gap: 20,
    },
    signInButton: {
        backgroundColor: '#FA8128',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 18,
        borderRadius: 12,
        shadowColor: '#FA8128',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    signInButtonText: {
        color: '#fff',
        fontSize: Platform.OS === 'ios' ? 18 : 16,
        fontWeight: '600',
    },
    buttonIcon: {
        height: 20,
        width: 20,
        tintColor: '#fff',
    },
    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signUpText: {
        color: '#666',
        fontSize: 15,
    },
    signUpLink: {
        color: '#FFD125',
        fontSize: 15,
        fontWeight: '600',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    loadingAnimation: {
        height: 80,
        width: 80,
    },
    loadingText: {
        color: '#fff',
        fontSize: 16,
        marginTop: 15,
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
        padding: 20,
        paddingBottom: 40,
    },
    modalContainer: {
        backgroundColor: '#006F46',
        borderRadius: 12,
        padding: 20,
        minHeight: 80,
        position: 'relative',
    },
    modalCloseButton: {
        position: 'absolute',
        top: 10,
        right: 15,
        zIndex: 1,
        padding: 5,
    },
    modalCloseText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    modalIcon: {
        height: 24,
        width: 24,
    },
    modalText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
});