import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform, StatusBar, Modal } from 'react-native';
import { DrawerContentComponentProps, DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { Theme } from '../Branding/Theme';
import LottieView from 'lottie-react-native';
import { auth, db } from '../../Firebase/Settings';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from 'firebase/auth';
import { Feather, Octicons } from '@expo/vector-icons';


type CustomDrawerContentProps = DrawerContentComponentProps & {
    navigation: DrawerNavigationProp<any, any>;
};

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
    const navigation = props.navigation;

    const [isLogOutModalVisible, setIsLogOutModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userInfo, setUserInfo] = useState<{ firstName: string; lastName: string; serviceNumber: string; TacticalPoints: string, profilePic: any } | null>(null);
    const currentRoute = props.state.routeNames[props.state.index];

    const subscribeToUserData = (uid: any) => {
        const docRef = doc(db, "UserDetails", uid);

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                console.log("Real-time User Data: ", data);
                console.log("Full docSnap data: ", docSnap.data());

                setUserInfo({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    serviceNumber: data.serviceNumber,
                    TacticalPoints: data.TacticalPoints,
                    profilePic: data.profilePic
                });
            } else {
                console.log("No such document");
            }
        }, (error) => {
            console.log("Error fetching user data in real-time: ", error);
        });

        return unsubscribe;
    };


    const getUserFromStorage = async () => {
        try {
            const uid = await AsyncStorage.getItem('userUid');
            console.log("Retrieved user UID from storage:", uid);
            return uid;
        } catch (e) {
            console.log("Error retrieving user from storage:", e);
            return null;
        }
    };

    useEffect(() => {
        const checkStoredUser = async () => {
            // Check if there's a stored UID
            const storedUid = await getUserFromStorage();

            if (storedUid) {
                console.log("Found stored user UID:", storedUid);
                // Subscribe to user data with the stored UID
                subscribeToUserData(storedUid);

                // Optional: You can also navigate to main screen here if needed
                // navigation.reset({
                //     index: 0,
                //     routes: [{ name: "MainDrawer" }]
                // });
            } else {
                console.log("No user found in storage");
                // You can redirect to login screen here if needed
            }
        };

        checkStoredUser();
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

    return (
        <View style={styles.container}>
            {isLoading && (
                <Modal
                    visible={true}
                    transparent={true}
                    animationType='fade'
                >
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
                        <Text style={{ color: "#fff", marginTop: 10 }}>Logging out...</Text>
                    </View>
                </Modal>
            )}
            <View style={styles.profileSection}>
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10
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
                    <View>
                        <Text style={{
                            fontSize: 12,
                            fontWeight: "600"
                        }}>{userInfo?.firstName} {userInfo?.lastName}</Text>
                        <Text style={{
                            fontSize: 12
                        }}>SN: {userInfo?.serviceNumber}</Text>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: "center"
                        }}>
                            <Image source={require("../../assets/downloadedIcons/medalIcon.png")}
                                style={{
                                    height: 20,
                                    width: 20
                                }}
                            />
                            <Text>{userInfo?.TacticalPoints}</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={() => navigation.closeDrawer()}
                >
                    <Octicons name='x' size={30} />
                </TouchableOpacity>
            </View>
            <View style={{
                padding: 20,
                gap: 10
            }}>
                <View style={{
                    borderWidth: 0.5,
                    borderColor: Theme.colors.second_primary
                }}></View>
                <TouchableOpacity
                    onPress={() => props.navigation.navigate('HomePage')}
                    style={[currentRoute === 'HomePage' && styles.activeItem, {
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 15,
                        paddingVertical: 10,
                        justifyContent: "space-between"
                    }]}
                >
                    <Text style={[
                        styles.drawerItemText,
                        currentRoute === "HomePage" && styles.activeText
                    ]}>Home</Text>
                    <Image source={require("../../assets/downloadedIcons/home-9-fill.png")}
                        style={{
                            width: 20,
                            height: 20,
                            resizeMode: "contain"
                        }}
                    />
                </TouchableOpacity>
                <View style={{
                    borderWidth: 0.5,
                    borderColor: Theme.colors.second_primary
                }}></View>
                <TouchableOpacity
                    onPress={() => props.navigation.navigate('Profile')}
                    style={[currentRoute === 'Profile' && styles.activeItem, {
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 15,
                        paddingVertical: 10,
                        justifyContent: "space-between"
                    }]}
                >
                    <Text style={[
                        styles.drawerItemText,
                        currentRoute === 'Profile' && styles.activeText
                    ]}>My Profile</Text>
                    <Image source={require("../../assets/downloadedIcons/user-shared-fill.png")}
                        style={{
                            width: 20,
                            height: 20,
                            resizeMode: "contain"
                        }}
                    />
                </TouchableOpacity>
                <View style={{
                    borderWidth: 0.5,
                    borderColor: Theme.colors.second_primary
                }}></View>
                <TouchableOpacity
                    onPress={() => props.navigation.navigate('History')}
                    style={[currentRoute === 'History' && styles.activeItem, {
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 10,
                        paddingHorizontal: 15,
                        justifyContent: "space-between"
                    }]}
                >
                    <Text style={[
                        styles.drawerItemText,
                        currentRoute === 'History' && styles.activeText
                    ]}>History</Text>
                    <Image source={require("../../assets/downloadedIcons/history-line.png")}
                        style={{
                            width: 20,
                            height: 20,
                            resizeMode: "contain"
                        }}
                    />
                </TouchableOpacity>
                <View style={{
                    borderWidth: 0.5,
                    borderColor: Theme.colors.second_primary
                }}></View>
                <TouchableOpacity
                    onPress={() => props.navigation.navigate('About')}
                    style={[currentRoute === 'About' && styles.activeItem, {
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 10,
                        paddingHorizontal: 15,
                        justifyContent: "space-between"
                    }]}
                >
                    <Text style={[
                        styles.drawerItemText,
                        currentRoute === 'About' && styles.activeText
                    ]}>About</Text>
                    <Feather name="info" size={20} />
                </TouchableOpacity>
                <View style={{
                    borderWidth: 0.5,
                    borderColor: Theme.colors.second_primary
                }}></View>
                <TouchableOpacity
                    onPress={() => {
                        setIsLogOutModalVisible(true);
                    }}
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 15,
                        paddingVertical: 10,
                        justifyContent: "space-between"
                    }}
                >
                    <Text style={{}}>Logout</Text>
                    <Image source={require("../../assets/downloadedIcons/logout-box-r-line.png")}
                        style={{
                            width: 20,
                            height: 20,
                            resizeMode: "contain"
                        }}
                    />
                </TouchableOpacity>
                <View style={{
                    borderWidth: 0.5,
                    borderColor: Theme.colors.second_primary
                }}></View>
            </View>
            <Modal
                visible={isLogOutModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => {

                }}
            >
                <View style={{
                    justifyContent: "flex-end",
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    flex: 1,
                }}>
                    <View style={{
                        backgroundColor: "white",
                        height: 250,
                        borderRadius: 5,
                        padding: 20,
                        gap: 30,
                        justifyContent: "center"
                    }}>
                        <TouchableOpacity style={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            padding: 13,
                        }}
                            onPress={() => {
                                setIsLogOutModalVisible(false);
                            }}
                        >
                            <Text style={{
                                color: Theme.colors.primaryColor,
                                fontSize: 18
                            }}>cancel</Text>
                        </TouchableOpacity>
                        <View style={{
                            alignItems: 'center'
                        }}>
                            <Text style={{
                                fontSize: 18,
                                fontWeight: "200"
                            }}>Are you sure you want to logout</Text>
                            <Text style={{
                                fontSize: 18,
                                fontWeight: "200"
                            }}>from your account?</Text>
                        </View>
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
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.backgroundColor,
        marginTop: Platform.OS === "android" ? StatusBar.currentHeight : null,
    },
    profileSection: {
        alignItems: 'flex-start',
        padding: 20,
        gap: 10,
        paddingTop: Platform.OS === "android" ? 40 : 70,
        justifyContent: "space-between",
        flexDirection: "row",
    },
    logout_btn: {
        backgroundColor: Theme.colors.primaryColor,
        padding: 15,
        borderRadius: 5,
        alignItems: "center"
    },
    logout_text: {
        color: "white",
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    drawerItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 10,
        justifyContent: "space-between",
    },

    activeItem: {
        backgroundColor: Theme.colors.second_primary + "20", // Light highlight
        borderLeftWidth: 4,
        borderLeftColor: Theme.colors.primaryColor,
    },

    drawerItemText: {
        fontSize: 14,
    },

    activeText: {
        fontWeight: "bold",
        color: Theme.colors.primaryColor,
    },

    drawerItemIcon: {
        width: 20,
        height: 20,
        resizeMode: "contain",
    }

});

export default CustomDrawerContent;
