import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Theme } from "../Branding/Theme";
import { Formik } from "formik";
import { FontAwesome6, Fontisto } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { useState } from "react";
import { auth } from "../../Firebase/Settings";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import * as yup from "yup";

interface IResetPasswordProps {
    navigation: any;
}

const ResetPassword = ({
    navigation
}: IResetPasswordProps) => {

    const resetFormValidation = yup.object().shape({
        oldPassword: yup.string().required("old password is required."),
        newPassword: yup.string().required("new password is required.").min(6, "Password must be at least 6 characters"),
        confirmNewPassword: yup.string().oneOf([yup.ref('newPassword')], 'Passwords must match').required("Confirm password is required.")
    })

    const [isLoading, setIsLoading] = useState(false);

    const handleChangedPassword = async (values: { oldPassword: string; newPassword: string; confirmNewPassword: string; }) => {
        setIsLoading(true);
        const user = auth.currentUser;

        if (!user || !user.email) {
            Alert.alert('Error', 'No user is signed in.');
            return;
        }

        if (values.newPassword !== values.confirmNewPassword) {
            Alert.alert('Error', 'New password do not match.');
            return;
        }

        const credential = EmailAuthProvider.credential(user.email, values.oldPassword);

        try {
            setIsLoading(true);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, values.newPassword);
            Alert.alert('success', 'Password updated successfully.')
            console.log("success", "Password updated successfully");
            navigation.reset({
                index: 0,
                routes: [{ name: "Profile" }]
            })
        } catch (error: any) {
            setIsLoading(false);
            Alert.alert('Error', error.message)
            console.log("Error: ", error.message);
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
                            fontSize: 40,
                            fontWeight: "700",
                            color: "white",
                            lineHeight: 45,
                        }}>Reset password</Text>
                    </View>
                    <Text style={{
                        fontSize: 16,
                        fontWeight: "300",
                        color: "white"
                    }}>Type your new password to recover your account</Text>
                </View>
            </View>
            <Formik
                initialValues={{ oldPassword: "", newPassword: "", confirmNewPassword: "" }}
                validationSchema={resetFormValidation}
                onSubmit={handleChangedPassword}
            >
                {({ errors, setSubmitting, touched, setTouched, handleBlur, validateForm, handleChange, values, handleSubmit }) => {
                    return (
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
                                        <Image source={require("../../assets/downloadedIcons/lock-2-fill.png")}
                                            style={{
                                                height: 20,
                                                width: 20
                                            }}
                                            resizeMode='contain'
                                        />
                                        <TextInput
                                            style={styles.textinput}
                                            placeholderTextColor={"#8c8c8e"}
                                            value={values.oldPassword}
                                            onChangeText={handleChange("oldPassword")}
                                            onBlur={handleBlur("oldPassword")}
                                            placeholder="old password"
                                        />
                                    </View>
                                    {touched.oldPassword && errors.oldPassword && (
                                        <Text style={{
                                            color: "red"
                                        }}>{errors.oldPassword}</Text>
                                    )}
                                    <View style={[styles.textinput_container, {
                                        marginBottom: 5
                                    }]}>
                                        <Image source={require("../../assets/downloadedIcons/lock-2-fill.png")}
                                            style={{
                                                height: 20,
                                                width: 20
                                            }}
                                            resizeMode='contain'
                                        />
                                        <TextInput
                                            style={styles.textinput}
                                            placeholderTextColor={"#8c8c8e"}
                                            value={values.newPassword}
                                            onChangeText={handleChange("newPassword")}
                                            onBlur={handleBlur("newPassword")}
                                            placeholder="new password"
                                        />
                                    </View>
                                    {touched.newPassword && errors.newPassword && (
                                        <Text style={{
                                            color: "red"
                                        }}>{errors.newPassword}</Text>
                                    )}
                                    <View style={[styles.textinput_container, {
                                        marginBottom: 5
                                    }]}>
                                        <Image source={require("../../assets/downloadedIcons/lock-2-fill.png")}
                                            style={{
                                                height: 20,
                                                width: 20
                                            }}
                                            resizeMode='contain'
                                        />
                                        <TextInput
                                            style={styles.textinput}
                                            placeholderTextColor={"#8c8c8e"}
                                            value={values.confirmNewPassword}
                                            onChangeText={handleChange("confirmNewPassword")}
                                            onBlur={handleBlur("confirmNewPassword")}
                                            placeholder="confirm password"
                                        />
                                    </View>
                                    {touched.confirmNewPassword && errors.confirmNewPassword && (
                                        <Text style={{
                                            color: "red"
                                        }}>{errors.confirmNewPassword}</Text>
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
                                    style={[styles.continue_email_button, {
                                        padding: 20
                                    }]}>
                                    <Text style={styles.email_button_text}>confirm</Text>
                                    <Image source={require("../../assets/Icons/fast-forward.png")}
                                        style={[styles.button_icon, {
                                            height: 15,
                                            width: 15
                                        }]}
                                    />
                                </TouchableOpacity>
                                <View style={{ flexDirection: 'row', gap: 6, alignSelf: "center" }}>
                                    <Text style={{ color: '#333', fontSize: 16 }}>Changed your mind?</Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            navigation.goBack()
                                        }}
                                    >
                                        <Text style={{ color: Theme.colors.primaryColor, fontSize: 16 }}>back</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )
                }}
            </Formik>
        </View>
    )
}

export default ResetPassword;

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