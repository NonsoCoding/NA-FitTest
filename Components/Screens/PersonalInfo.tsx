import { Alert, Dimensions, Image, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
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

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Define your view dimensions (manually or based on your design)
const VIEW_WIDTH = 300;
const VIEW_HEIGHT = 150;

// Calculate offset
const offsetX = (screenWidth - VIEW_WIDTH) / 2;
const offsetY = (screenHeight - VIEW_HEIGHT) / 4.8;


const validationSchema = yup.object().shape({
    firstName: yup.string().required("First name is required."),
    lastName: yup.string().required("Last name is required."),
    serviceNumber: yup.string().required("Service number is a required."),
    gender: yup.string().required("Gender is required.")
})

// Custom Radio Button Component
const RadioButton = ({ selected, onPress, label }: { selected: boolean; onPress: () => void; label: string }) => {
    return (
        <TouchableOpacity style={styles.radioContainer} onPress={onPress}>
            <View style={[styles.radioCircle, selected && styles.selectedRadio]}>
                {selected && <View style={styles.radioDot} />}
            </View>
            <Text style={styles.radioLabel}>{label}</Text>
        </TouchableOpacity>
    );
};

const PersonalInfo = ({
    navigation
}: IPersonalInfoProps) => {

    const [isLoading, setIsLoading] = useState(false);

    const savePersonalInfo = async (values: { firstName: string; lastName: string; serviceNumber: string; gender: string }) => {
        setIsLoading(true);
        const user = auth.currentUser;
        if (!user) return;

        try {
            await setDoc(doc(db, "UserDetails", user.uid), {
                firstName: values.firstName,
                lastName: values.lastName,
                serviceNumber: values.serviceNumber,
                gender: values.gender,
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
            Alert.alert("Welcome to your dashboard.");
            navigation.reset({
                index: 0,
                routes: [{ name: "MainDrawer" }]
            })
        } catch (error) {
            setIsLoading(false)
            console.error("Error saving personal info: ", error);
            Alert.alert("Error", "Failed to save profile info")
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <ImageBackground
            source={require("../../assets/BackgroundImages/Background.png")}
            style={styles.container}
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
                initialValues={{ firstName: "", lastName: "", serviceNumber: "", gender: "", }}
                validationSchema={validationSchema}
                onSubmit={(values) => savePersonalInfo(values)}
            >
                {({ handleChange, handleBlur, handleSubmit, validateForm, values, errors, touched, setTouched, setFieldValue }) => {
                    return (
                        <View style={{
                            flex: 1,
                            justifyContent: "flex-end"
                        }}>

                            <View
                                style={{
                                    position: "absolute",
                                    width: VIEW_WIDTH,
                                    height: VIEW_HEIGHT,
                                    top: offsetY,
                                    left: offsetX,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Text style={{
                                    fontWeight: '600',
                                    fontSize: 35,
                                }}>PERSONAL INFO</Text>
                                <Text style={{
                                    fontSize: 15,
                                    fontWeight: "300"
                                }}>FILL IN YOUR PERSONAL INFO</Text>
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

                                        gap: 10,
                                        padding: 20
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
                                                    color={"#FFD125"}
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
                                                    color={"#FFD125"}
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

                                            {/* Gender Selection */}
                                            <View style={styles.genderContainer}>
                                                <View style={styles.radioGroup}>
                                                    <RadioButton
                                                        selected={values.gender === 'Male'}
                                                        onPress={() => setFieldValue('gender', 'Male')}
                                                        label="Male"
                                                    />
                                                    <RadioButton
                                                        selected={values.gender === 'Female'}
                                                        onPress={() => setFieldValue('gender', 'Female')}
                                                        label="Female§§§§§§"
                                                    />
                                                </View>
                                                {touched.gender && errors.gender && (
                                                    <Text style={styles.errorText}>{errors.gender}</Text>
                                                )}
                                            </View>

                                            <View style={styles.textinput_container}>
                                                <MaterialIcons
                                                    name="military-tech"
                                                    size={20}
                                                    color={"#FFD125"}
                                                />
                                                <TextInput
                                                    placeholderTextColor={"#8c8c8e"}
                                                    style={styles.textinput}
                                                    placeholder="Enter Army Number"
                                                    onChangeText={(text) => handleChange('serviceNumber')('N/A' + text)}
                                                    onBlur={handleBlur('serviceNumber')}
                                                    value={values.serviceNumber.replace(/^N\/A/, '')}
                                                />
                                            </View>
                                            {touched.serviceNumber && errors.serviceNumber && (
                                                <Text style={{
                                                    color: "red"
                                                }}>{errors.serviceNumber}</Text>
                                            )}
                                        </View>
                                    </View>
                                </View>
                                <View>
                                    <TouchableOpacity style={styles.btn}
                                        onPress={async () => {
                                            console.log("Submit button pressed");
                                            const errors = await validateForm();
                                            setTouched({ firstName: true, lastName: true, serviceNumber: true, gender: true });
                                            if (!errors.firstName && !errors.lastName && !errors.serviceNumber && !errors.gender) {
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
                    )
                }}

            </Formik>
        </ImageBackground>
    )
}

export default PersonalInfo;

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    btn: {
        backgroundColor: Theme.colors.primaryColor,
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
        borderBottomWidth: 1,
        borderColor: "#FFD125",
        position: 'relative',
    },
    textinput: {
        flex: 1,
        paddingVertical: 20,
        paddingHorizontal: 10,
        fontSize: 14,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    // Gender Radio Button Styles
    genderContainer: {
        marginVertical: 10,
    },
    genderTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 10,
        color: '#333',
    },
    radioGroup: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 5,
    },
    radioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    radioCircle: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Theme.colors.lightPrimary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    selectedRadio: {
        borderColor: Theme.colors.primaryColor,
    },
    radioDot: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: Theme.colors.primaryColor,
    },
    radioLabel: {
        fontSize: 14,
        color: '#333',
    },
    errorText: {
        color: "red",
        fontSize: 14,
        marginTop: 5,
    },
})