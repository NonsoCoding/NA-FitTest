import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Theme } from "../Branding/Theme";
import { useEffect, useRef, useState } from "react";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { DrawerParamList } from "../nav/type";
import { useNavigation } from "@react-navigation/native";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../Firebase/Settings";
import LottieView from "lottie-react-native";
import { Feather } from "@expo/vector-icons";

interface IProfileProps {

}


const EditDetails = ({

}: IProfileProps) => {
    const [isFirstNameEditing, setIsFirstNameEditing] = useState(false);
    const [isLastNameEditing, setIsLastNameEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailEditing, setIsEmailEditing] = useState(false);
    const [isPasswordEditing, setIsPasswordEditing] = useState(false);
    const [isFullNameEditing, setIsFullNameEditing] = useState(false);
    const [isGenderEditing, setIsGenderEditing] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [isFormEdited, setIsFormEdited] = useState(false)
    const [email, setEmail] = useState('');
    const [gender, setGender] = useState('');
    const [userInfo, setUserInfo] = useState<{ firstName: string; lastName: string; gender: string; } | null>(null);
    const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();

    const firstNameInputRef = useRef<TextInput>(null);
    const lastNameInputRef = useRef<TextInput>(null);

    const originalValues = useRef({
        firstName: '',
        lastName: '',
        gender: '',
    });

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
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    gender: data.gender || '',
                });

                // Set state and original values
                const userFirstName = data.firstName || '';
                const userLastName = data.lastName || '';
                const userGender = data.gender || '';

                setFirstName(userFirstName);
                setLastName(userLastName);
                setGender(userGender);

                originalValues.current = {
                    firstName: userFirstName,
                    lastName: userLastName,
                    gender: userGender,
                };

            } else {
                console.log("No such document")
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
    }, []);

    useEffect(() => {
        console.log('Checking form changes:', {
            firstName,
            lastName,
            gender,
            original: originalValues.current
        });

        const edited =
            firstName !== originalValues.current.firstName ||
            lastName !== originalValues.current.lastName ||
            gender !== originalValues.current.gender;

        console.log('Form edited:', edited);
        setIsFormEdited(edited);
    }, [firstName, lastName, gender]);

    const updateProfileDetails = async (values: { firstName: string; lastName: string; gender: string }) => {
        setIsLoading(true)
        const user = auth.currentUser;
        if (!user) {
            setIsLoading(false);
            return;
        }

        try {
            const userDocRef = doc(db, "UserDetails", user.uid);
            await updateDoc(userDocRef, {
                firstName: values.firstName,
                lastName: values.lastName,
                gender: values.gender
            });

            // Update original values after successful save
            originalValues.current = {
                firstName: values.firstName,
                lastName: values.lastName,
                gender: values.gender
            };

            console.log("Profile updated successfully");
            Alert.alert("Success", "Profile updated successfully");

            // Force re-evaluation of form edited state
            setIsFormEdited(false);

        } catch (error) {
            console.log("Error updating profile: ", error);
            Alert.alert("Error", "Failed to update profile");
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
                    <Text style={{ color: "#fff", marginTop: 10 }}>Saving changes..</Text>
                </View>
            )}
            <View style={{
                height: "22%",
                backgroundColor: Theme.colors.primaryColor,
                padding: 20,
                paddingTop: 60,
                justifyContent: "center",
                gap: 30
            }}>
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    top: 10,
                    justifyContent: "flex-end",
                }}>
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
                    }}>EDIT DETAILS</Text>
                </View>
            </View>
            <View style={{
                flex: 3,
                padding: 20,
                gap: 10
            }}>
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 5
                }}>
                    <Text style={{
                        fontSize: 12,
                        fontWeight: "600"
                    }}>CLICK THE ICON TO MAKE EDITABLE </Text>
                    <Feather
                        name="edit"
                        size={15}
                    />
                </View>
                <View style={{
                    gap: 10
                }}>
                    <View style={{
                        gap: 5
                    }}>
                        <Text style={{
                            color: Theme.colors.mediumPrimary
                        }}>FirstName</Text>
                        <View style={[styles.textinput_container, {
                            borderColor: isFirstNameEditing ? Theme.colors.primaryColor : 'black',
                            borderWidth: isFirstNameEditing ? 2 : 1
                        }]}>
                            <TextInput
                                ref={firstNameInputRef}
                                placeholder={userInfo?.firstName || "FirstName"}
                                placeholderTextColor={Theme.colors.second_primary}
                                style={styles.textinput}
                                value={firstName}
                                onChangeText={setFirstName}
                                editable={isFirstNameEditing}
                            />
                            <TouchableOpacity onPress={() => {
                                setIsFirstNameEditing(prev => {
                                    const newState = !prev;
                                    if (!prev) {
                                        setTimeout(() => firstNameInputRef.current?.focus(), 100);
                                    }
                                    return newState;
                                })
                            }}>
                                <Feather
                                    name="edit"
                                    color={isFirstNameEditing ? Theme.colors.primaryColor : "black"}
                                    size={25}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{
                        gap: 5
                    }}>
                        <Text style={{
                            color: Theme.colors.mediumPrimary
                        }}>LastName</Text>
                        <View style={[styles.textinput_container, {
                            borderColor: isLastNameEditing ? Theme.colors.primaryColor : "black",
                            borderWidth: isLastNameEditing ? 2 : 1
                        }]}>
                            <TextInput
                                ref={lastNameInputRef}
                                placeholder={userInfo?.lastName || "LastName"}
                                placeholderTextColor={Theme.colors.second_primary}
                                style={styles.textinput}
                                value={lastName}
                                onChangeText={setLastName}
                                editable={isLastNameEditing}
                            />
                            <TouchableOpacity onPress={() => {
                                setIsLastNameEditing(prev => {
                                    const newState = !prev;
                                    if (!prev) {
                                        setTimeout(() => lastNameInputRef.current?.focus(), 100);
                                    }
                                    return newState;
                                })
                            }}>
                                <Feather
                                    name="edit"
                                    color={isLastNameEditing ? Theme.colors.primaryColor : "black"}
                                    size={25}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.genderContainer}>
                        <View style={styles.radioGroup}>
                            <RadioButton
                                selected={gender === 'Male'}
                                onPress={() => setGender('Male')}
                                label="Male"
                            />
                            <RadioButton
                                selected={gender === 'Female'}
                                onPress={() => setGender('Female')}
                                label="Female"
                            />
                        </View>
                    </View>
                    <View style={{
                        gap: 5
                    }}>
                        <Text style={{
                            color: Theme.colors.mediumPrimary
                        }}>Email</Text>
                        <View style={styles.textinput_container}>
                            <TextInput
                                placeholder={email}
                                placeholderTextColor={Theme.colors.second_primary}
                                style={styles.textinput}
                                editable={isEmailEditing}
                            />
                            <TouchableOpacity onPress={() => setIsEmailEditing(false)}>
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
                            color: Theme.colors.mediumPrimary
                        }}>Password</Text>
                        <View style={styles.textinput_container}>
                            <TextInput
                                placeholder="************"
                                placeholderTextColor={Theme.colors.second_primary}
                                style={styles.textinput}
                                editable={isPasswordEditing}
                            />
                            <TouchableOpacity onPress={() => {
                                navigation.navigate("ResetPassword")
                            }}>
                                <Text style={{
                                    fontWeight: "300",
                                    fontSize: 12,
                                    color: Theme.colors.primaryColor
                                }}>Change password</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <TouchableOpacity
                    disabled={!isFormEdited}
                    onPress={() => {
                        updateProfileDetails({
                            firstName: firstName,
                            lastName: lastName,
                            gender: gender
                        })
                    }}
                    style={[styles.continue_email_button, {
                        padding: 20,
                        backgroundColor: !isFormEdited ? 'grey' : Theme.colors.primaryColor
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

export default EditDetails;

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
        borderColor: Theme.colors.black
    },
    textinput: {
        flex: 1,
        paddingVertical: 10
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
    email_button_text: {
        fontSize: 15,
        color: "white"
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
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