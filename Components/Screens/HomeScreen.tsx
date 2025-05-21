import { Image, ImageBackground, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Theme } from "../Branding/Theme";
import LottieView from "lottie-react-native";
import { useEffect, useState } from "react";
import { auth, db } from "../../Firebase/Settings";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { async } from "@firebase/util";

interface IHomePageProps {
    navigation: any;
}

const HomePage = ({
    navigation
}: IHomePageProps) => {

    const [isLoading, setIsLoading] = useState(false);
    const [userInfo, setUserInfo] = useState<{
        firstName: string;
        lastName: string;
        serviceNumber: string;
        TacticalPoints: string;
        profilePic: any;
    } | null>(null);
    const [personalBests, setPersonalBests] = useState({
        pushUps: 0,
        sitUps: 0,
        pullUps: 0,
        runTime: 0,
        sprintTime: 0
    })
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });


    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const subscribeToUserData = (uid: any) => {
        const docRef = doc(db, "UserDetails", uid);

        const unsubscribe = onSnapshot(docRef, async (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                console.log("Real-time User Data: ", data);
                console.log("Full docSnap data: ", docSnap.data());

                const userData = {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    serviceNumber: data.serviceNumber,
                    TacticalPoints: data.TacticalPoints,
                    profilePic: data.profilePic
                };
                setUserInfo(userData);
                try {
                    await AsyncStorage.setItem('userInfo', JSON.stringify(userData));
                    console.log("Saved userInfo to storage:", userData);
                    console.log("Profile pic URI:", userInfo?.profilePic);
                    console.log("Full docSnap data: ", docSnap.data());

                } catch (e) {
                    console.error("Error saving userInfo to storage:", e);
                }
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


    useEffect(() => {
        checkStoredUser();
    }, [])

    const savePersonalBestsToStorage = async (bests: typeof personalBests) => {
        try {
            await AsyncStorage.setItem('personalBests', JSON.stringify(bests));
            console.log("Saved personalBests to storage:", bests);
        } catch (e) {
            console.error("Error saving personalBests to storage:", e);
        }
    };



    useEffect(() => {
        const loadPersonalBestsFromStorage = async () => {
            try {
                const storedBests = await AsyncStorage.getItem('personalBests');
                if (storedBests) {
                    const parsed = JSON.parse(storedBests);
                    console.log("Loaded personalBests from storage:", parsed);
                    setPersonalBests(parsed);
                }
            } catch (e) {
                console.error("Error loading personalBests from storage:", e);
            }
        };

        loadPersonalBestsFromStorage();
    }, []);



    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const userDetailsRef = doc(db, "UserDetails", user.uid);

        const unsubscribe = onSnapshot(userDetailsRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data().personalBests || {};
                console.log("Real-time personalBests: ", data);

                const bests = {
                    pushUps: data.pushUps || 0,
                    sitUps: data.sitUps || 0,
                    pullUps: data.pullUps || 0,
                    runTime: data.runTime || 0,
                    sprintTime: data.sprintTime || 0
                }
                setPersonalBests(bests);
                savePersonalBestsToStorage(bests)
            }
        }, (error) => {
            console.error("Error fetching personalBests in real-time:", error);
        });

        return () => unsubscribe(); // Cleanup listener on unmount
    }, []);

    const loadUserInfoFromStorage = async () => {
        try {
            const storedInfo = await AsyncStorage.getItem('userInfo');
            if (storedInfo) {
                const parsed = JSON.parse(storedInfo);
                setUserInfo(parsed);
                console.log("Loaded userInfo from storage:", parsed);
                console.log('stored info', storedInfo);

            }
        } catch (e) {
            console.error("Error loading userInfo from storage:", e);
        }
    };

    useEffect(() => {
        loadUserInfoFromStorage();
    }, [])

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
            <View style={styles.top_container}>
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between"
                }}>
                    <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10
                    }}>
                        <Image source={require("../../assets/downloadedIcons/Frame.png")}
                            style={{
                                width: 20,
                                height: 20,
                                resizeMode: "contain"
                            }}
                        />
                        <Text style={{
                            color: "white"
                        }}>{formattedDate}</Text>
                    </View>
                    <TouchableOpacity style={{
                        backgroundColor: "white",
                        borderRadius: 10
                    }}
                        // onPress={() => {
                        //     setIsLogOutModalVisible(true);
                        // }}
                        onPress={() => navigation.openDrawer()}
                    >
                        <Image source={require("../../assets/downloadedIcons/notification.png")}
                            style={{
                                width: 30,
                                height: 30
                            }}
                        />
                    </TouchableOpacity>
                </View>
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10
                }}>
                    <View>
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
                    </View>
                    <View style={{
                    }}>
                        <Text style={{
                            color: "white",
                            fontSize: 20,
                            fontWeight: '300'
                        }}>{userInfo?.firstName} {userInfo?.lastName}</Text>
                        <Text style={{
                            color: "white",
                            fontSize: 12,
                            fontWeight: '200'
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
                            <Text style={{
                                color: 'white',
                                fontWeight: '200'
                            }}>{userInfo?.TacticalPoints ?? 0}</Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={{
                flex: 3
            }}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={{

                    }}
                >
                    <View style={{
                        padding: 10,
                        gap: 10,

                    }}>
                        <View style={{
                            padding: 20,
                            borderRadius: 5,
                            backgroundColor: "rgba(0, 0, 0, 0.05)"
                        }}>
                            <TouchableOpacity style={styles.exercise_btn}
                                onPress={() => {
                                    navigation.navigate("PushUpsScreen")
                                }}
                            >

                                <View style={{
                                    gap: 4
                                }}>
                                    <Text style={{
                                        fontSize: 24,
                                        fontWeight: "300",

                                    }}>Push-Ups</Text>
                                    <Text style={{
                                        fontWeight: '200'
                                    }}>Minimum Requirement: 38</Text>
                                    <View style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 7,
                                    }}>
                                        <Image source={require("../../assets/downloadedIcons/medalIcon.png")}
                                            style={{
                                                width: 15,
                                                height: 15
                                            }}
                                        />
                                        <Text style={{
                                            fontWeight: '200'
                                        }}>Personal Best: {personalBests.pushUps}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{
                            padding: 20,
                            borderRadius: 5,
                            backgroundColor: "rgba(0, 0, 0, 0.05)"
                        }}>
                            <TouchableOpacity style={styles.exercise_btn}
                                onPress={() => {
                                    navigation.navigate("SprintScreen")
                                }}
                            >
                                <View style={{
                                    gap: 4
                                }}>
                                    <Text style={{
                                        fontSize: 24,
                                        fontWeight: "300",

                                    }}>300 Meter Sprint</Text>
                                    <Text style={{
                                        fontWeight: '200'
                                    }}>Minimum Requirement: 60s</Text>
                                    <View style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 7,
                                    }}>
                                        <Image source={require("../../assets/downloadedIcons/medalIcon.png")}
                                            style={{
                                                width: 15,
                                                height: 15
                                            }}
                                        />
                                        <Text style={{
                                            fontWeight: '200'
                                        }}>Personal Best: {formatTime(personalBests.sprintTime)}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{
                            padding: 20,
                            borderRadius: 5,
                            backgroundColor: "rgba(0, 0, 0, 0.05)"
                        }}>
                            <TouchableOpacity style={styles.exercise_btn}
                                onPress={() => {
                                    navigation.navigate("SitUpScreen")
                                }}
                            >
                                <View style={{
                                    gap: 4
                                }}>
                                    <Text style={{
                                        fontSize: 24,
                                        fontWeight: "300",

                                    }}>Sit-Ups</Text>
                                    <Text style={{
                                        fontWeight: '200'
                                    }}>Minimum Requirement: 38</Text>
                                    <View style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 7,
                                    }}>
                                        <Image source={require("../../assets/downloadedIcons/medalIcon.png")}
                                            style={{
                                                width: 15,
                                                height: 15
                                            }}
                                        />
                                        <Text style={{
                                            fontWeight: '200'
                                        }}>Personal Best: {personalBests.sitUps}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{
                            padding: 20,
                            borderRadius: 5,
                            backgroundColor: "rgba(0, 0, 0, 0.05)"
                        }}>
                            <TouchableOpacity style={styles.exercise_btn}
                                onPress={() => {
                                    navigation.navigate("RunningScreen")
                                }}
                            >
                                <View style={{
                                    gap: 4
                                }}>
                                    <Text style={{
                                        fontSize: 24,
                                        fontWeight: "300",
                                    }}>1.5 Mile Run</Text>
                                    <Text style={{
                                        fontWeight: '200'
                                    }}>Minimum Requirement: 10:00 min</Text>
                                    <View style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 7,
                                    }}>
                                        <Image source={require("../../assets/downloadedIcons/medalIcon.png")}
                                            style={{
                                                width: 15,
                                                height: 15
                                            }}
                                        />
                                        <Text style={{
                                            fontWeight: '200'
                                        }}>Personal Best: {formatTime(personalBests.runTime)}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{
                            padding: 20,
                            borderRadius: 5,
                            backgroundColor: "rgba(0, 0, 0, 0.05)"
                        }}>
                            <TouchableOpacity style={styles.exercise_btn}
                                onPress={() => {
                                    navigation.navigate("PullUpScreen")
                                }}
                            >
                                <View style={{
                                    gap: 4
                                }}>
                                    <Text style={{
                                        fontSize: 24,
                                        fontWeight: "300",
                                    }}>Pull-Ups</Text>
                                    <Text style={{
                                        fontWeight: '200'
                                    }}>Minimum Requirement: 38</Text>
                                    <View style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 7,
                                    }}>
                                        <Image source={require("../../assets/downloadedIcons/medalIcon.png")}
                                            style={{
                                                width: 15,
                                                height: 15
                                            }}
                                        />
                                        <Text style={{
                                            fontWeight: '200'
                                        }}>Personal Best: {personalBests.pullUps}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </View>

        </View>
    )
}

export default HomePage;

const styles = StyleSheet.create({
    container: {
    },
    top_container: {
        height: "25%",
        backgroundColor: Theme.colors.primaryColor,
        padding: 20,
        paddingTop: 80,
        justifyContent: "space-between",
        gap: 20,
    },
    exercise_btn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 20
    },
    logout_btn: {
        backgroundColor: Theme.colors.primaryColor,
        padding: 15,
        borderRadius: 10,
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
    }
})
