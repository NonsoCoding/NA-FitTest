import { Alert, Button, Image, ImageBackground, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Theme } from "../Branding/Theme";
import { useEffect, useRef, useState } from "react";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { DrawerParamList } from "../nav/type";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../../Firebase/Settings";
import { doc, getDoc, getFirestore, onSnapshot, updateDoc } from "firebase/firestore";
import { getAuth, setPersistence } from "firebase/auth";
import LottieView from "lottie-react-native";
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather, FontAwesome, FontAwesome5, FontAwesome6, Ionicons } from "@expo/vector-icons";
import CameraModal from "../Modals/CameraModal";
import * as ImagePicker from "expo-image-picker";
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
    const [userInfo, setUserInfo] = useState<{ firstName: string; lastName: string; serviceNumber: string; dateOfBirth: string; profilePic: any; gender: string } | null>(null);
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState(new Date());
    const [isFormEdited, setIsFormEdited] = useState(false)
    const [show, setShow] = useState(false);
    const [isCameraModalVisible, setIsCameraModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [previewProfilePictureeModal, setPreviewProfilePictureeModal] = useState(false);
    const inputRef = useRef<TextInput>(null); // 👈 create ref
    const originalValues = useRef({
        height: '',
        weight: '',
        dateOfBirth: new Date(),
    });

    const onChange = (event: any, selectedDate?: Date) => {
        setShow(Platform.OS === 'ios');
        if (selectedDate) {
            setDateOfBirth(selectedDate);
            setIsDateOfBirthEditing(false);
        }
    };

    // Format date to display in a user-friendly way
    const formatDate = (date: Date) => {
        return format(date, 'MMM, dd, yyyy');
    };

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const docRef = doc(db, "UserDetails", user.uid);

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                console.log("Real-time User Data: ", data);

                setUserInfo({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    gender: data.gender,
                    serviceNumber: data.serviceNumber,
                    dateOfBirth: data.dateOfBirth,
                    profilePic: data.profilePic
                });

                if (data.height) {
                    setHeight(data.height);
                    originalValues.current.height = data.height;
                };
                if (data.weight) {
                    setWeight(data.weight);
                    originalValues.current.weight = data.weight;
                };
                if (data.dateOfBirth?.toDate) {
                    const dob = data.dateOfBirth.toDate();
                    setDateOfBirth(dob);
                    originalValues.current.dateOfBirth = dob;
                }
            } else {
                console.log("No such document");
            }
        }, (error) => {
            console.log("Error fetching user data in real-time: ", error);
        });

        return () => unsubscribe(); // Clean up the listener when the component unmounts
    }, []);


    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            setEmail(user.email || '');
        }
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



    const takePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            alert("Camera permission is required!");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const imageUri = result.assets[0].uri;
            setSelectedImage(imageUri);
        }
    };


    const pickImage = async () => {
        // Delay closing modal just enough to prevent UI conflict
        setTimeout(async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
                allowsEditing: true
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const imageUri = result.assets[0].uri;
                setSelectedImage(imageUri);
            }
        }, 1000);
        setIsCameraModalVisible(false);
    };

    const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dkfh0oefs/image/upload";
    const UPLOAD_PRESET = "unsigned_preset"; // replace this

    const uploadToCloudinary = async (imageUri: string) => {
        const data = new FormData();
        data.append("file", {
            uri: imageUri,
            type: "image/jpeg",
            name: "profile.jpg",
        } as any);
        data.append("upload_preset", UPLOAD_PRESET);

        try {
            const res = await fetch(CLOUDINARY_URL, {
                method: "POST",
                body: data,
            });
            const json = await res.json();
            console.log("Uploaded image URL:", json.secure_url);
            return json.secure_url;
        } catch (err) {
            console.error("Upload failed", err);
            return null;
        }
    };

    const saveProfileImage = async (url: string) => {
        const auth = getAuth();
        const db = getFirestore();
        const user = auth.currentUser;

        if (!user) return;

        const userRef = doc(db, "UserDetails", user.uid);

        try {
            await updateDoc(userRef, {
                profilePic: url,
            });
            console.log("Profile image saved to Firestore ✅");
        } catch (err) {
            console.error("Failed to save image URL to Firestore ❌", err);
        }
    };

    useEffect(() => {
        const edited =
            height !== originalValues.current.height ||
            weight !== originalValues.current.weight ||
            formatDate(dateOfBirth) !== formatDate(originalValues.current.dateOfBirth);

        setIsFormEdited(edited);
    }, [height, weight, dateOfBirth]);


    const handleSetProfilePic = async () => {
        try {
            if (selectedImage) {
                setIsLoading(true);
                const uploadedUrl = await uploadToCloudinary(selectedImage);
                if (uploadedUrl) {
                    setIsLoading(false)
                    await saveProfileImage(uploadedUrl);
                    setSelectedImage(null);
                    setIsCameraModalVisible(false);
                }
            }
        } catch (error) {
            setIsLoading(false)
            console.error("Upload error", error);
        } finally {
            setIsLoading(false);
        }
    }

    const deleteProfileImage = async (userId: string) => {
        const auth = getAuth();
        // const 
        try {
            const userDocRef = doc(db, "UserDetails", userId);
            await updateDoc(userDocRef, {
                profilePic: ""
            });

            console.log("Image deleted successfully");

        } catch (error) {
            console.error("Error deleting image: ", error);
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
                    <Text style={{ color: "#fff", marginTop: 10 }}>Setting profile...</Text>
                </View>
            )}
            {selectedImage ? (
                <View style={{
                    flex: 1,
                    backgroundColor: "black",
                    justifyContent: "center",
                }}>
                    <View style={{ flexDirection: "row", gap: 20, justifyContent: "space-between", paddingHorizontal: 20 }}>
                        <TouchableOpacity
                            onPress={() => setSelectedImage(null)}
                            style={{
                                backgroundColor: "gray",
                                padding: 10,
                                borderRadius: 5
                            }}
                        >
                            <Text style={{ color: "white", fontWeight: "bold" }}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                handleSetProfilePic();
                            }}
                            style={{
                                backgroundColor: "#657432",
                                padding: 10,
                                borderRadius: 5
                            }}
                        >
                            <Text style={{ color: "white", fontWeight: "bold" }}>Save</Text>
                        </TouchableOpacity>
                    </View>
                    <Image
                        source={{ uri: selectedImage }}
                        style={{
                            width: "100%",
                            height: "80%",
                            borderRadius: 10,
                            resizeMode: "contain"
                        }}
                    />
                </View>
            ) : (
                <View style={{
                    flex: 1
                }}>
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
                                fontWeight: "700",
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
                            backgroundColor: Theme.colors.primaryColor,
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
                                <View style={{
                                    alignItems: "center",
                                    gap: 5
                                }}>
                                    <TouchableOpacity onPress={() => {
                                        setPreviewProfilePictureeModal(true)
                                    }} style={{

                                    }}>
                                        {userInfo?.profilePic ? (
                                            <Image
                                                source={{ uri: userInfo.profilePic }}
                                                style={{
                                                    width: 60,
                                                    height: 60,
                                                    resizeMode: "cover",
                                                    borderRadius: 30
                                                }}
                                            />
                                        ) : (
                                            <Image
                                                source={require("../../assets/downloadedIcons/profile.png")}
                                                style={{
                                                    width: 60,
                                                    height: 60,
                                                    resizeMode: "cover",
                                                    borderRadius: 30
                                                }}
                                            />
                                        )}
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 5
                                    }}
                                        onPress={() => {
                                            setIsCameraModalVisible(true);
                                        }}
                                    >
                                        <Text style={{
                                            color: "white"
                                        }}>Edit</Text>
                                        {/* <FontAwesome6 name="pen"
                                            color={"white"}
                                            size={10}
                                        /> */}
                                    </TouchableOpacity>
                                </View>
                                <View style={{
                                    gap: 5
                                }}>
                                    <Text style={{
                                        fontWeight: "700",
                                        fontSize: 17,
                                        color: "white"
                                    }}>{userInfo?.firstName} {userInfo?.lastName}</Text>
                                    <Text style={{
                                        color: "white",
                                        fontSize: 12
                                    }}>SN: {userInfo?.serviceNumber}</Text>
                                    <Text style={{
                                        fontSize: 12,
                                        color: "white"
                                    }}>{userInfo?.gender}</Text>
                                    <Text style={{
                                        color: "white",
                                        fontWeight: "200"
                                    }}>{email}</Text>
                                </View>
                            </View>

                            <View>
                                <TouchableOpacity onPress={() => {
                                    navigation.navigate("EditDetails")
                                }}>
                                    <Feather name="edit" size={30} color={'white'} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={{
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
                                    color={isHeightEditing ? Theme.colors.primaryColor : "black"}
                                />
                            </View>
                            <View style={{
                                gap: 5
                            }}>
                                <Text style={{
                                    color: Theme.colors.mediumPrimary
                                }}>Height (ft)</Text>
                                <View style={[styles.textinput_container, {
                                    borderColor: isHeightEditing ? Theme.colors.primaryColor : "black",
                                    borderWidth: isHeightEditing ? 2 : 1
                                }]}>
                                    <TextInput
                                        ref={inputRef}
                                        placeholder={height || "Enter height (ft)"}
                                        value={height}
                                        onChangeText={setHeight}
                                        placeholderTextColor={Theme.colors.second_primary}
                                        style={styles.textinput}
                                        editable={isHeightEditing}
                                    />
                                    <TouchableOpacity onPress={() => {
                                        setIsHeightEditing(prev => {
                                            const newState = !prev;
                                            if (!prev) {
                                                setTimeout(() => inputRef.current?.focus(), 700);
                                            }
                                            return newState;
                                        })
                                    }}>
                                        <Feather
                                            name="edit"
                                            size={25}
                                            color={isHeightEditing ? Theme.colors.primaryColor : "black"}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={{
                                gap: 5
                            }}>
                                <Text style={{
                                    color: Theme.colors.mediumPrimary
                                }}>Weight (lbs)</Text>
                                <View style={[styles.textinput_container, {
                                    borderColor: isWeightEditing ? Theme.colors.primaryColor : 'black',
                                    borderWidth: isWeightEditing ? 2 : 1
                                }]}>
                                    <TextInput
                                        ref={inputRef}
                                        placeholder={weight || "Enter weight (lbs)"}
                                        placeholderTextColor={Theme.colors.second_primary}
                                        style={styles.textinput}
                                        value={weight}
                                        onChangeText={setWeight}
                                        editable={isWeightEditing}
                                    />
                                    <TouchableOpacity onPress={() => {
                                        setIsWeightEditing(prev => {
                                            const newState = !prev;
                                            if (!prev) {
                                                setTimeout(() => inputRef.current?.focus(), 700);
                                            }
                                            return newState;
                                        })
                                    }}>
                                        <Feather
                                            name="edit"
                                            color={isWeightEditing ? Theme.colors.primaryColor : 'black'}
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
                                }}>DateofBirth</Text>
                                <View style={[styles.textinput_container, {
                                    borderColor: isDateOfBirthEditing ? Theme.colors.primaryColor : "black",
                                    borderWidth: isDateOfBirthEditing ? 2 : 1
                                }]}>
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
                                        <Feather
                                            name="edit"
                                            size={25}
                                            color={isDateOfBirthEditing ? Theme.colors.primaryColor : "black"}
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
                            disabled={!isFormEdited}
                            onPress={() => {
                                updateProfileDetails({
                                    height: height,
                                    weight: weight,
                                    dateOfBirth: dateOfBirth
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

                        <Modal
                            visible={isCameraModalVisible}
                            animationType="slide"
                            transparent={true}
                            onRequestClose={() => {
                                setIsCameraModalVisible(false)
                            }}
                        >
                            <View style={{
                                flex: 1,
                                backgroundColor: "rgba(0, 0, 0, 0.4)",
                                justifyContent: "flex-end"
                            }}>
                                <View style={{
                                    backgroundColor: Theme.colors.primaryColor,
                                    height: "40%",
                                    borderTopLeftRadius: 10,
                                    borderTopRightRadius: 10,
                                    justifyContent: "flex-start",
                                    padding: 20,
                                    gap: 30
                                }}>
                                    <View style={{
                                        flexDirection: "row",
                                        justifyContent: 'space-between',
                                    }}>
                                        <View style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            gap: 20
                                        }}>
                                            <Image
                                                style={{
                                                    height: 40,
                                                    width: 40,
                                                    borderRadius: 20,
                                                }}
                                                source={{ uri: userInfo?.profilePic || require("../../assets/downloadedIcons/profile.png") }}
                                            />
                                            <Text style={{
                                                color: 'white',
                                                fontWeight: "700",
                                                fontSize: 18
                                            }}>Edit profile picture</Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => {
                                                setIsCameraModalVisible(false);
                                            }}
                                            style={{
                                                backgroundColor: "#292929",
                                                padding: 5,
                                                alignItems: "center",
                                                justifyContent: "center",
                                                paddingHorizontal: 12,
                                                borderRadius: 30
                                            }}
                                        >
                                            <FontAwesome5
                                                name="times"
                                                color={"white"}
                                                size={23}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{
                                        backgroundColor: "#292929",
                                        padding: 20,
                                        borderRadius: 5,
                                        gap: 30
                                    }}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                takePhoto();
                                            }}
                                            style={{
                                                flexDirection: 'row',
                                                justifyContent: "space-between",
                                                alignItems: "center"
                                            }}>
                                            <Text style={{
                                                color: 'white',
                                                fontWeight: "700"
                                            }}>
                                                Take photo
                                            </Text>

                                            <Ionicons
                                                name="camera"
                                                size={25}
                                                color={"white"}
                                            />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => {
                                                pickImage();
                                            }}
                                            style={{
                                                flexDirection: 'row',
                                                justifyContent: "space-between",
                                                alignItems: "center"
                                            }}>
                                            <Text style={{
                                                color: 'white',
                                                fontWeight: "700"
                                            }}>
                                                Choose photo
                                            </Text>

                                            <FontAwesome
                                                name="photo"
                                                size={22}
                                                color={"white"}
                                            />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => {
                                                deleteProfileImage("");
                                            }}
                                            style={{
                                                flexDirection: 'row',
                                                justifyContent: "space-between",
                                                alignItems: "center"
                                            }}>
                                            <Text style={{
                                                color: 'red',
                                                fontWeight: "700"
                                            }}>
                                                Delete photo
                                            </Text>

                                            <Ionicons
                                                name="trash-outline"
                                                size={25}
                                                color={'white'}
                                            />
                                        </TouchableOpacity>
                                    </View>

                                </View>
                            </View>
                        </Modal>
                        <Modal
                            visible={previewProfilePictureeModal}
                            transparent={false}
                            onRequestClose={() => {
                                setPreviewProfilePictureeModal(false);
                            }}
                        >
                            <View style={{
                                flex: 1,
                                backgroundColor: "rgba(0, 0, 0, 0.4)",
                                justifyContent: "center"
                            }}>
                                <TouchableOpacity
                                    onPress={() => {
                                        setPreviewProfilePictureeModal(false)
                                    }}
                                    style={{
                                        position: "absolute",
                                        top: Platform.OS === "android" ? 20 : 50,
                                        padding: 20,
                                    }}>
                                    <Text style={{
                                        fontWeight: "700"
                                    }}> Close</Text>
                                </TouchableOpacity>
                                <Image
                                    source={{ uri: userInfo?.profilePic || require("../../assets/downloadedIcons/profile.png") }}
                                    style={{
                                        height: "40%"
                                    }}
                                />
                            </View>
                        </Modal>
                    </View>
                </View>
            )}
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
        backgroundColor: Theme.colors.primaryColor,
    },
    cancelButton: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
    }
})