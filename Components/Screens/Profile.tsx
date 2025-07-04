import { Alert, Button, Dimensions, Image, ImageBackground, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Theme } from "../Branding/Theme";
import { useEffect, useRef, useState } from "react";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { DrawerParamList } from "../nav/type";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../../Firebase/Settings";
import { doc, getDoc, getFirestore, onSnapshot, updateDoc } from "firebase/firestore";
import { getAuth, setPersistence, signOut } from "firebase/auth";
import LottieView from "lottie-react-native";
import { format } from 'date-fns';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather, FontAwesome, FontAwesome5, FontAwesome6, Ionicons } from "@expo/vector-icons";
import CameraModal from "../Modals/CameraModal";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";


interface IProfileProps {
    navigation: any;
}


const { width: screenWidth } = Dimensions.get('window');

const Profile = ({
    navigation
}: IProfileProps) => {

    const [email, setEmail] = useState('');
    const [isLogOutModalVisible, setIsLogOutModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const [isHeightEditing, setIsHeightEditing] = useState(false);
    const [isWeightEditing, setIsWeightEditing] = useState(false);
    const [isDateOfBirthEditing, setIsDateOfBirthEditing] = useState(false);
    const [isFirstNameEditing, setIsFirstNameEditing] = useState(false);
    const [isLastNameEditing, setIsLastNameEditing] = useState(false);
    const [isEmailEditing, setIsEmailEditing] = useState(false);
    const [isPasswordEditing, setIsPasswordEditing] = useState(false);
    const [userInfo, setUserInfo] = useState<{ firstName: string; lastName: string; serviceNumber: string; dateOfBirth: string; profilePic: any; gender: string } | null>(null);
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [firstName, setFirstName] = useState("");
    const [gender, setGender] = useState('');
    const [lastName, setLastName] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState(new Date());
    const [isFormEdited, setIsFormEdited] = useState(false)
    const [show, setShow] = useState(false);
    const [isCameraModalVisible, setIsCameraModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [previewProfilePictureeModal, setPreviewProfilePictureeModal] = useState(false);
    const inputRef = useRef<TextInput>(null); // 👈 create ref
    const firstNameRef = useRef<TextInput>(null);
    const lastNameRef = useRef<TextInput>(null);
    const heightRef = useRef<TextInput>(null);
    const weightRef = useRef<TextInput>(null);
    const originalValues = useRef({
        firstName: '',
        lastName: '',
        gender: '',
        height: '',
        weight: '',
        dateOfBirth: new Date(),
    });


    const createCurvedPath = () => {
        const height = 160;
        const waveHeight = 45;

        return `M 0 0 
        L 0 ${height} 
        Q ${screenWidth * 0.25} ${height + waveHeight} ${screenWidth * 0.5} ${height}
        Q ${screenWidth * 0.75} ${height - waveHeight} ${screenWidth} ${height}
        L ${screenWidth} 0 
        Z`;
    };

    const onChange = (event: any, selectedDate?: Date) => {
        setShow(Platform.OS === 'ios');
        if (selectedDate) {
            setDateOfBirth(selectedDate);
            setIsDateOfBirthEditing(false);
        }
    };

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

                if (data.height && typeof data.height === 'string' && !isNaN(parseFloat(data.height))) {
                    console.log("Height from Firebase:", data.height);
                    setHeight(data.height);
                    originalValues.current.height = data.height;
                } else {
                    console.log("Invalid height data:", data.height);
                    setHeight(""); // Set to empty if invalid
                }
                if (data.gender && typeof data.gender === 'string') {
                    setGender(data.gender);
                    originalValues.current.gender = data.gender;
                }
                if (data.firstName) {
                    setFirstName(data.firstName);
                    originalValues.current.firstName = data.firstName;
                };
                if (data.lastName) {
                    setLastName(data.lastName);
                    originalValues.current.lastName = data.lastName;
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

    const logout = async () => {
        setIsLoading(true);
        try {
            await AsyncStorage.removeItem('userUid');
            await signOut(auth);
            setTimeout(() => {
                setIsLoading(false);
                navigation.reset({
                    index: 1,
                    routes: [{ name: "IntroScreen" }]
                })
            }, 5000);
        } catch (e) {
            setIsLoading(false);
            console.error('Error during logout: ', e);
        }
    }



    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            setEmail(user.email || '');
        }
    }, [])

    const updateProfileDetails = async (values: { firstName: string, lastName: string, gender: string, height: string; weight: string; dateOfBirth: Date }) => {
        setIsLoading(true)
        const user = auth.currentUser;
        if (!user) return;

        try {
            const userDocRef = doc(db, "UserDetails", user.uid);
            await updateDoc(userDocRef, {
                firstName: values.firstName,
                lastName: values.lastName,
                gender: values.gender,
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

    const hasFormChanged = () => {
        return (
            firstName !== originalValues.current.firstName ||
            lastName !== originalValues.current.lastName ||
            gender !== originalValues.current.gender ||
            height !== originalValues.current.height ||
            weight !== originalValues.current.weight ||
            formatDate(dateOfBirth) !== formatDate(originalValues.current.dateOfBirth)
        );
    };

    useEffect(() => {
        setIsFormEdited(hasFormChanged());
    }, [firstName, lastName, gender, height, weight, dateOfBirth]);


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
                    <View style={styles.shadowWrapper}>
                        <View style={styles.headerContainer}>
                            <Svg height="200" width={screenWidth} style={styles.svg}>
                                <Defs>
                                    <SvgLinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <Stop offset="0%" stopColor="#FFD700" stopOpacity="1" />
                                        <Stop offset="100%" stopColor="#FFA500" stopOpacity="1" />
                                    </SvgLinearGradient>
                                </Defs>
                                <Path
                                    d={createCurvedPath()}
                                    fill="url(#grad)"
                                />
                            </Svg>
                            {/* Content overlay - positioned absolutely to center over SVG */}
                            <SafeAreaView style={styles.contentOverlay}>
                                <View style={{
                                    flexDirection: "row",
                                    paddingHorizontal: 20,
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}>
                                    <View style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 10
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
                                        <View>
                                            <Text style={{
                                                color: "white",
                                                fontSize: 20,
                                                fontWeight: "700"
                                            }}>{userInfo?.firstName} {userInfo?.lastName}</Text>
                                            <Text style={{
                                                color: "white",
                                                fontSize: 12
                                            }}>{email}</Text>
                                            <Text style={{
                                                color: "white",
                                                fontSize: 12
                                            }}>{userInfo?.serviceNumber}</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity style={{
                                        height: 50,
                                        width: 40,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderRadius: 10,
                                        backgroundColor: "#FA8128"
                                    }}>
                                        <Image
                                            style={{
                                                height: 30,
                                                width: 30
                                            }}
                                            source={require("../../assets/Icons/bell.png")} />
                                    </TouchableOpacity>
                                </View>
                            </SafeAreaView>
                        </View>
                    </View>
                    <View style={{
                        flex: 3,
                        gap: 20
                    }}>
                        <ScrollView contentContainerStyle={{
                            padding: 20,
                            gap: 50
                        }}>
                            <View style={{
                                gap: 20
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
                                    padding: 10,
                                    gap: 10,
                                    backgroundColor: 'white',
                                    borderRadius: 16,
                                    justifyContent: "center",
                                    // iOS shadow
                                    shadowColor: '#000',
                                    shadowOffset: {
                                        width: 0,
                                        height: 4,
                                    },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8,

                                    // Android shadow
                                    elevation: 5,
                                }}>
                                    <View style={{
                                        flexDirection: "row",
                                        alignItems: 'center',
                                        gap: 10
                                    }}>
                                        <Image
                                            style={{
                                                height: 20,
                                                width: 20
                                            }}
                                            source={require("../../assets/Icons/steps-icon.png")} />
                                        <Text style={{
                                            color: Theme.colors.mediumPrimary,
                                            fontWeight: "800",
                                        }}>FIRST NAME</Text>
                                    </View>
                                    <View style={[styles.textinput_container, {

                                    }]}>
                                        <TextInput
                                            ref={inputRef}
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
                                                    setTimeout(() => inputRef.current?.focus(), 700);
                                                }
                                                return newState;
                                            })
                                        }}>
                                            <Feather
                                                name="edit"
                                                size={20}
                                                color={isFirstNameEditing ? Theme.colors.primaryColor : "black"}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={{
                                    padding: 10,
                                    gap: 10,
                                    backgroundColor: 'white',
                                    borderRadius: 16,
                                    justifyContent: "center",
                                    // iOS shadow
                                    shadowColor: '#000',
                                    shadowOffset: {
                                        width: 0,
                                        height: 4,
                                    },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8,

                                    // Android shadow
                                    elevation: 5,
                                }}>
                                    <View style={{
                                        flexDirection: "row",
                                        alignItems: 'center',
                                        gap: 10
                                    }}>
                                        <Image
                                            style={{
                                                height: 20,
                                                width: 20
                                            }}
                                            source={require("../../assets/Icons/steps-icon.png")} />
                                        <Text style={{
                                            color: Theme.colors.mediumPrimary,
                                            fontWeight: "800",
                                        }}>LAST NAME</Text>
                                    </View>
                                    <View style={[styles.textinput_container, {

                                    }]}>
                                        <TextInput
                                            ref={lastNameRef}
                                            placeholder={userInfo?.lastName || "lastName"}
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
                                                    setTimeout(() => lastNameRef.current?.focus(), 700);
                                                }
                                                return newState;
                                            })
                                        }}>
                                            <Feather
                                                name="edit"
                                                size={20}
                                                color={isLastNameEditing ? Theme.colors.primaryColor : "black"}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={{
                                    padding: 10,
                                    gap: 10,
                                    backgroundColor: 'white',
                                    borderRadius: 16,
                                    justifyContent: "center",
                                    // iOS shadow
                                    shadowColor: '#000',
                                    shadowOffset: {
                                        width: 0,
                                        height: 4,
                                    },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8,

                                    // Android shadow
                                    elevation: 5,
                                }}>
                                    <View style={{
                                        flexDirection: "row",
                                        alignItems: 'center',
                                        gap: 10
                                    }}>
                                        <Image
                                            style={{
                                                height: 20,
                                                width: 20
                                            }}
                                            source={require("../../assets/Icons/steps-icon.png")} />
                                        <Text style={{
                                            color: Theme.colors.mediumPrimary,
                                            fontWeight: "800",
                                        }}>HEIGHT (FT)</Text>
                                    </View>
                                    <View style={[styles.textinput_container, {

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
                                                size={20}
                                                color={isHeightEditing ? Theme.colors.primaryColor : "black"}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={{
                                    padding: 10,
                                    gap: 10,
                                    backgroundColor: 'white',
                                    borderRadius: 16,
                                    justifyContent: "center",
                                    // iOS shadow
                                    shadowColor: '#000',
                                    shadowOffset: {
                                        width: 0,
                                        height: 4,
                                    },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8,

                                    // Android shadow
                                    elevation: 5,
                                }}>
                                    <View style={{
                                        flexDirection: "row",
                                        alignItems: 'center',
                                        gap: 10
                                    }}>
                                        <Image
                                            style={{
                                                height: 20,
                                                width: 20
                                            }}
                                            source={require("../../assets/Icons/steps-icon.png")} />
                                        <Text style={{
                                            color: Theme.colors.mediumPrimary,
                                            fontWeight: "800"
                                        }}>WEIGHT (LBS)</Text>
                                    </View>
                                    <View style={[styles.textinput_container, {

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
                                                size={20}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={{
                                    padding: 10,
                                    gap: 10,
                                    backgroundColor: 'white',
                                    borderRadius: 16,
                                    justifyContent: "center",
                                    // iOS shadow
                                    shadowColor: '#000',
                                    shadowOffset: {
                                        width: 0,
                                        height: 4,
                                    },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8,

                                    // Android shadow
                                    elevation: 5,
                                }}>
                                    <View style={{
                                        flexDirection: "row",
                                        alignItems: 'center',
                                        gap: 10
                                    }}>
                                        <Image
                                            style={{
                                                height: 20,
                                                width: 20
                                            }}
                                            source={require("../../assets/Icons/steps-icon.png")} />
                                        <Text style={{
                                            color: Theme.colors.mediumPrimary,
                                            fontWeight: "800"
                                        }}>GENDER</Text>
                                    </View>
                                    <View style={[styles.textinput_container, {

                                    }]}>
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
                                    </View>
                                </View>
                                <View style={{
                                    padding: 10,
                                    gap: 10,
                                    backgroundColor: 'white',
                                    borderRadius: 16,
                                    justifyContent: "center",
                                    // iOS shadow
                                    shadowColor: '#000',
                                    shadowOffset: {
                                        width: 0,
                                        height: 4,
                                    },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8,

                                    // Android shadow
                                    elevation: 5,
                                }}>
                                    <View style={{
                                        flexDirection: "row",
                                        alignItems: 'center',
                                        gap: 10
                                    }}>
                                        <Image
                                            style={{
                                                height: 20,
                                                width: 20
                                            }}
                                            source={require("../../assets/Icons/steps-icon.png")} />
                                        <Text style={{
                                            color: Theme.colors.mediumPrimary,
                                            fontWeight: "800"
                                        }}>DateofBirth</Text>
                                    </View>
                                    <View style={[styles.textinput_container, {
                                    }]}>
                                        <Text style={[
                                            styles.textinput,
                                            { paddingVertical: 0 }
                                        ]}>
                                            {formatDate(dateOfBirth)}
                                        </Text>
                                        <TouchableOpacity onPress={() => {
                                            setIsDateOfBirthEditing(true);
                                            setShow(true);
                                        }}>
                                            <Feather
                                                name="edit"
                                                size={20}
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
                                        dateOfBirth: dateOfBirth,
                                        firstName: firstName,
                                        lastName: lastName,
                                        gender: gender
                                    })
                                }}
                                style={[styles.continue_email_button, {
                                    padding: 20,
                                    backgroundColor: !isFormEdited ? '#FA812840' : "#FA812890"
                                }]}>
                                <Text style={styles.email_button_text}>Save changes</Text>
                                <Image source={require("../../assets/Icons/fast-forward.png")}
                                    style={{
                                        height: 20,
                                        width: 20
                                    }}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.logout_btn}
                                onPress={() => {
                                    setIsLogOutModalVisible(false);
                                    setTimeout(() => {
                                        logout();
                                    }, 700);
                                }}
                            >
                                <Text style={styles.logout_text}>Logout</Text>
                            </TouchableOpacity>
                        </ScrollView>

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
        padding: 5,
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 5,
        borderColor: Theme.colors.black
    },
    textinput: {
        flex: 1,
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
    logout_btn: {
        backgroundColor: "#FA812890",
        padding: 20,
        borderRadius: 5,
        alignItems: "center"
    },
    logout_text: {
        color: "white",
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
    },
    headerContainer: {
        position: 'relative',
        justifyContent: "center",
        backgroundColor: 'transparent'
    },
    contentOverlay: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        bottom: 0,
        flex: 1,
        justifyContent: 'flex-start',
        gap: 20,
    },
    svg: {
        padding: 20,
    },
    shadowWrapper: {
        flex: 1,
        justifyContent: "center",
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.8,
        shadowRadius: 15,
        elevation: 12,
        zIndex: 1,
    },
    shadowTopWrapper: {
        flex: 1,
        justifyContent: "flex-end",
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.8,
        shadowRadius: 15,
        elevation: 12,
        zIndex: 1,
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
    genderContainer: {
        marginVertical: 10,
    },
})