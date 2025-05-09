import { Alert, Button, Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Theme } from "../Branding/Theme";
import { useEffect, useState } from "react";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { DrawerParamList } from "../nav/type";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../../Firebase/Settings";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { setPersistence } from "firebase/auth";
import LottieView from "lottie-react-native";
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';

interface IProfileProps {

}


const Profile = ({

}: IProfileProps) => {

    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false)
    const [isHeightEditing, setIsHeightEditing] = useState(false);
    const [isWeightEditing, setIsWeightEditing] = useState(false);
    const [isDateOfBirthEditing, setIsDateOfBirthEditing] = useState(false);
    const [isFullNameEditing, setIsFullNameEditing] = useState(false);
    const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
    const [userInfo, setUserInfo] = useState<{ firstName: string; lastName: string; serviceNumber: string; dateOfBirth: string } | null>(null);
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState(new Date());
    const [show, setShow] = useState(false);


    const onChange = (event: any, selectedDate?: Date) => {
        setShow(Platform.OS === 'ios'); // iOS keeps the picker open
        if (selectedDate) {
            setDateOfBirth(selectedDate);
            setIsDateOfBirthEditing(false); // Close editing mode after selection
        }
    };

    // Format date to display in a user-friendly way
    const formatDate = (date: Date) => {
        return format(date, 'MMM, dd, yyyy');
    };

    const fetchUserInfo = async () => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const docRef = doc(db, "UserDetails", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                console.log("User Data: ", data);

                setUserInfo({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    serviceNumber: data.serviceNumber,
                    dateOfBirth: data.dateOfBirth
                });

                if (data.height) setHeight(data.height);
                if (data.weight) setWeight(data.weight);
                if (data.dateOfBirth?.toDate) {
                    setDateOfBirth(data.dateOfBirth.toDate());
                }
            } else {
                console.log("So such document")
            }
        } catch (error) {
            console.log("Error fetching user data: ", error);
        }
    }

    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            setEmail(user.email || '');
        }
        fetchUserInfo();
    }, [])

    const updateProfileDetails = async (values: { height: string; weight: string; dateOfBirth: Date }) => {
        setIsLoading(true)
        const user = auth.currentUser;
        if (!user) return;

        try {
            const userDocRef = doc(db, "UserDetails", user.uid);
            await updateDoc(userDocRef, {
                height: values.height,
                weight: values.weight,
                dateOfBirth: values.dateOfBirth
            })
            setIsLoading(false);
            console.log("Profile updated successfully");
            Alert.alert("success", "Profile updated successfully")
        } catch (error) {
            setIsLoading(false)
            console.log("Error updating profile: ", error);
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
            <View style={{
                height: "22%",
                backgroundColor: Theme.colos.primaryColor,
                padding: 20,
                paddingTop: 60,
                justifyContent: "center",
                gap: 30
            }}>
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}>
                    <TouchableOpacity style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10
                    }}
                        onPress={() => {
                            navigation.goBack();
                        }}
                    >
                        <Image source={require("../../assets/downloadedIcons/fast.png")}
                            style={{
                                width: 20,
                                height: 20
                            }}
                        />
                        <Text style={{
                            color: "white"
                        }}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => navigation.openDrawer()}
                    >
                        <Image source={require("../../assets/downloadedIcons/notification.png")}
                            style={{
                                height: 30,
                                width: 30
                            }}
                        />
                    </TouchableOpacity>
                </View>
                <View>
                    <Text style={{
                        fontWeight: 700,
                        fontSize: 40,
                        color: "white"
                    }}>MY PROFILE</Text>
                </View>
            </View>
            <View style={{
                flex: 3,
                padding: 20,
                gap: 20
            }}>
                <View style={{
                    backgroundColor: Theme.colos.primaryColor,
                    padding: 20,
                    borderRadius: 5,
                    flexDirection: "row",
                    justifyContent: "space-between"
                }}>
                    <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10
                    }}>
                        <Image source={require("../../assets/downloadedIcons/profile.png")}
                            style={{
                                height: 50,
                                width: 50,
                                resizeMode: "contain"
                            }}
                        />
                        <View>
                            <Text style={{
                                fontWeight: 700,
                                fontSize: 17,
                                color: "white"
                            }}>{userInfo?.firstName} {userInfo?.lastName}</Text>
                            <Text style={{
                                color: "white",
                                fontSize: 12
                            }}>SN: {userInfo?.serviceNumber}</Text>
                            <Text style={{
                                color: "white",
                                fontWeight: 200
                            }}>{email}</Text>
                        </View>
                    </View>
                    <View>
                        <TouchableOpacity onPress={() => {
                            navigation.navigate("EditDetails")
                        }}>
                            <Image source={require("../../assets/downloadedIcons/edit.png")}
                                style={{
                                    width: 40,
                                    height: 40
                                }}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{
                    gap: 10
                }}>
                    <View style={{
                        gap: 5
                    }}>
                        <Text style={{
                            color: Theme.colos.mediumPrimary
                        }}>Height (ft)</Text>
                        <View style={styles.textinput_container}>
                            <TextInput
                                placeholder={height || "Enter height (ft)"}
                                value={height}
                                onChangeText={setHeight}
                                placeholderTextColor={Theme.colos.second_primary}
                                style={styles.textinput}
                                editable={isHeightEditing}
                            />
                            <TouchableOpacity onPress={() => setIsHeightEditing(prev => !prev)}>
                                <Image source={require("../../assets/downloadedIcons/edit-line.png")}
                                    style={{
                                        height: 25,
                                        width: 25
                                    }}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{
                        gap: 5
                    }}>
                        <Text style={{
                            color: Theme.colos.mediumPrimary
                        }}>Weight (lbs)</Text>
                        <View style={styles.textinput_container}>
                            <TextInput
                                placeholder={weight || "Enter weight (lbs)"}
                                placeholderTextColor={Theme.colos.second_primary}
                                style={styles.textinput}
                                value={weight}
                                onChangeText={setWeight}
                                editable={isWeightEditing}
                            />
                            <TouchableOpacity onPress={() => setIsWeightEditing(prev => !prev)}>
                                <Image source={require("../../assets/downloadedIcons/edit-line.png")}
                                    style={{
                                        height: 25,
                                        width: 25
                                    }}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{
                        gap: 5
                    }}>
                        <Text style={{
                            color: Theme.colos.mediumPrimary
                        }}>DateofBirth</Text>
                        <View style={styles.textinput_container}>
                            <Text style={[
                                styles.textinput,
                                { paddingVertical: 10 }
                            ]}>
                                {formatDate(dateOfBirth)}
                            </Text>
                            <TouchableOpacity onPress={() => {
                                setIsDateOfBirthEditing(true);
                                setShow(true);
                            }}>
                                <Image source={require("../../assets/downloadedIcons/edit-line.png")}
                                    style={{
                                        height: 25,
                                        width: 25
                                    }}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Date Picker */}
                        {show && (
                            <View style={{
                                height: 140,
                                overflow: "hidden"
                            }}>
                                <DateTimePicker
                                    testID="dateTimePicker"
                                    value={dateOfBirth}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={onChange}
                                    maximumDate={new Date()} // Can't select future dates
                                    minimumDate={new Date(1900, 0, 1)} // Realistic minimum date
                                    style={{
                                        flex: 1
                                    }}
                                />

                                {/* Confirmation buttons for iOS */}
                                {Platform.OS === 'ios' && (
                                    <View style={styles.buttonContainer}>
                                        <TouchableOpacity
                                            style={[styles.button, styles.cancelButton]}
                                            onPress={() => {
                                                setShow(false);
                                                setIsDateOfBirthEditing(false);
                                            }}
                                        >
                                            <Text style={styles.buttonText}>Cancel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.button, styles.confirmButton]}
                                            onPress={() => {
                                                setShow(false);
                                                setIsDateOfBirthEditing(false);
                                            }}
                                        >
                                            <Text style={styles.buttonText}>Confirm</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        updateProfileDetails({
                            height: height,
                            weight: weight,
                            dateOfBirth: dateOfBirth
                        })
                    }}
                    style={[styles.continue_email_button, {
                        padding: 20
                    }]}>
                    <Text style={styles.email_button_text}>Save changes</Text>
                    <Image source={require("../../assets/Icons/fast-forward.png")}
                        style={{
                            height: 20,
                            width: 20
                        }}
                    />
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default Profile;

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    textinput_container: {
        borderWidth: 1,
        padding: 10,
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 5,
        borderColor: Theme.colos.black
    },
    textinput: {
        flex: 1,
        paddingVertical: 10
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
    email_button_text: {
        fontSize: 15,
        fontFamily: Theme.Montserrat_Font.Mont500,
        color: "white"
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    button: {
        flex: 1,
        padding: 12,
        borderRadius: 5,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    confirmButton: {
        backgroundColor: Theme.colos.primaryColor,
    },
    cancelButton: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
    }
})