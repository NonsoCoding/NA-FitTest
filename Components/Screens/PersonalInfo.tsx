import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Theme } from "../Branding/Theme";
import LottieView from "lottie-react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import * as yup from "yup";
import { Formik } from "formik";
import { auth, db } from "../../Firebase/Settings";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useState } from "react";

interface IPersonalInfoProps {
    navigation?: any;
}

const validationSchema = yup.object().shape({
    firstName: yup.string().required("First name is required."),
    lastName: yup.string().required("Last name is required."),
    serviceNumber: yup.string().required("Service number is a required.")
})

const PersonalInfo = ({
    navigation
}: IPersonalInfoProps) => {

    const [isLoading, setIsLoading] = useState(false);

    const savePersonalInfo = async (values: { firstName: string; lastName: string; serviceNumber: string }) => {
        setIsLoading(true);
        const user = auth.currentUser;
        if (!user) return;

        try {
            await setDoc(doc(db, "UserDetails", user.uid), {
                firstName: values.firstName,
                lastName: values.lastName,
                serviceNumber: values.serviceNumber,
                createdAt: serverTimestamp(),
                TacticalPoints: 0,
                personalBest: 0,
                PushUpMinRequirement: 38,
                SitUpMinRequirement: 38,
                PullUpMinRequirement: 38,
                RunningMinRequirement: "10:00",
                SprintingMinRequirement: 60,
            });
            setIsLoading(false)
            Alert.alert("Success", "Profile saved! Welcome to your dashboard.");
            navigation.navigate("MainDrawer")
        } catch (error) {
            setIsLoading(false)
            console.error("Error saving personal info: ", error);
            Alert.alert("Error", "Failed to save profile info")
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <View style={styles.container}>
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
            <Formik
                initialValues={{ firstName: "", lastName: "", serviceNumber: "" }}
                validationSchema={validationSchema}
                onSubmit={(values) => savePersonalInfo(values)}
            >
                {({ handleChange, handleBlur, handleSubmit, validateForm, values, errors, touched, setTouched }) => {
                    return (
                        <View style={{
                            flex: 1
                        }}>
                            <View style={{
                                flex: 1,
                                backgroundColor: Theme.colos.primaryColor,
                                padding: 20,
                                justifyContent: "flex-end"
                            }}>
                                <View>
                                    <Text style={{
                                        fontWeight: '600',
                                        color: "white",
                                        fontSize: 35,
                                    }}>Personal Info</Text>
                                    <Text style={{
                                        color: "white",
                                        fontSize: 15,
                                        fontWeight: "200"
                                    }}>Fill in your infomation</Text>
                                </View>
                            </View>
                            <View style={{
                                flex: 3,
                                padding: 20
                            }}>
                                <View style={{
                                    paddingBottom: 30,
                                    justifyContent: "space-between",
                                    flex: 1
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
                                                <Feather
                                                    name="user"
                                                    size={20}
                                                />
                                                <TextInput
                                                    style={styles.textinput}
                                                    placeholderTextColor={"#8c8c8e"}
                                                    placeholder="FirstName"
                                                    onChangeText={handleChange('firstName')}
                                                    value={values.firstName}
                                                    onBlur={handleBlur('firstName')}
                                                />
                                            </View>
                                            {touched.firstName && errors.firstName && (
                                                <Text style={{
                                                    color: "red"
                                                }}>{errors.firstName}</Text>
                                            )}
                                            <View style={[styles.textinput_container, {
                                                marginBottom: 5
                                            }]}>
                                                <Feather
                                                    name="user"
                                                    size={20}
                                                />
                                                <TextInput
                                                    style={styles.textinput}
                                                    placeholderTextColor={"#8c8c8e"}
                                                    placeholder="LastName"
                                                    onChangeText={handleChange("lastName")}
                                                    onBlur={handleBlur('lastName')}
                                                    value={values.lastName}
                                                />
                                            </View>
                                            {touched.lastName && errors.lastName && (
                                                <Text style={{
                                                    color: "red"
                                                }}>{errors.lastName}</Text>
                                            )}
                                            <View style={styles.textinput_container}>
                                                <MaterialIcons
                                                    name="military-tech"
                                                    size={20}
                                                />
                                                <TextInput
                                                    placeholderTextColor={"#8c8c8e"}
                                                    style={styles.textinput}
                                                    placeholder="Service Number"
                                                    onChangeText={handleChange('serviceNumber')}
                                                    onBlur={handleBlur('serviceNumber')}
                                                    value={values.serviceNumber}
                                                    keyboardType="number-pad"
                                                />
                                            </View>
                                            {touched.serviceNumber && errors.serviceNumber && (
                                                <Text style={{
                                                    color: "red"
                                                }}>{errors.serviceNumber}</Text>
                                            )}
                                        </View>
                                    </View>
                                    <View>
                                        <TouchableOpacity style={styles.btn}
                                            onPress={async () => {
                                                console.log("Submit button pressed");
                                                const errors = await validateForm();
                                                setTouched({ firstName: true, lastName: true, serviceNumber: true });
                                                if (!errors.firstName && !errors.lastName && !errors.serviceNumber) {
                                                    console.log("Form is valid, submitting...");
                                                    handleSubmit();
                                                } else {
                                                    console.log("Form errors:", errors);
                                                }
                                            }}
                                        >
                                            <Text style={{
                                                color: "white"
                                            }}>Continue</Text>
                                            <Image
                                                source={require("../../assets/downloadedIcons/fast.png")}
                                                style={{
                                                    height: 24,
                                                    width: 24
                                                }}
                                            />
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

export default PersonalInfo;


const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    btn: {
        backgroundColor: Theme.colos.primaryColor,
        flexDirection: "row",
        justifyContent: "space-between",
        borderRadius: 5,
        alignItems: "center",
        padding: 20
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
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
})