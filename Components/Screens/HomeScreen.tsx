import { Dimensions, Image, ImageBackground, ImageBase, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Theme } from "../Branding/Theme";
import LottieView from "lottie-react-native";
import { useEffect, useState } from "react";
import { auth, db } from "../../Firebase/Settings";
import { deleteDoc, doc, getDoc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { async } from "@firebase/util"
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import * as Progress from "react-native-progress";
import { Pedometer } from "expo-sensors";
import { string } from "yup";

const { width: screenWidth } = Dimensions.get('window');

interface IHomePageProps {
    navigation: any;
}

const { width } = Dimensions.get('window')

const pushUpsVideoSource = require('../../assets/ExerciseGifs/pushUps.mp4');
const pullUpVideoSource = require('../../assets/ExerciseGifs/pullUps.mp4');
const sprintVideoSource = require('../../assets/ExerciseGifs/sprint.mp4');
const sitUpVideoSource = require('../../assets/ExerciseGifs/situps.mp4');
const runningVideoSource = require('../../assets/ExerciseGifs/running.mp4');

const HomePage = ({
    navigation
}: IHomePageProps) => {

    const [isLoading, setIsLoading] = useState(false);
    const [isPedometerAvailable, setIsPedometerAvailable] = useState('checking');
    const [isAvailable, setIsAvailable] = useState('checking...');
    const [stepCount, setStepCount] = useState(0);

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
    const [baselineSteps, setBaselineSteps] = useState(0);
    const [monthlyTacticalPoints, setMonthlyTacticalPoints] = useState(0);
    const formattedDate = today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const barWidth = screenWidth * 0.65;

    const MONTHLY_TARGET = 300;
    const BRONZE_THRESHOLD = 0.3;
    const SILVER_THRESHOLD = 0.7;

    const progress = Math.min(monthlyTacticalPoints / MONTHLY_TARGET, 1);
    const progressPercentage = Math.round(progress * 100);

    const getcurrentTier = () => {
        if (progress < BRONZE_THRESHOLD) {
            return { name: "Bronze", color: "#CD7F32", icon: require("../../assets/Icons/BronzeMedal.png") }
        } else if (progress < SILVER_THRESHOLD) {
            return { name: 'Silver', color: '#COCOCO', icon: require("../../assets/Icons/Silver.png") }
        } else {
            return { name: 'Gold', color: '#FFD125', icon: require("../../assets/Icons/Gold-Badge1.png") }
        }
    }

    const currentTier = getcurrentTier();

    const getCurrentMonthKey = () => {
        const now = new Date();
        return `${now.getFullYear()} - ${now.getMonth() + 1}`
    }

    // This creates the curved path - the key part!
    const createCurvedPath = () => {
        const height = 160;
        const waveHeight = 45;

        // Simple single wave - one dip down, one peak up
        return `M 0 0 
        L 0 ${height} 
        Q ${screenWidth * 0.25} ${height + waveHeight} ${screenWidth * 0.5} ${height}
        Q ${screenWidth * 0.75} ${height - waveHeight} ${screenWidth} ${height}
        L ${screenWidth} 0 
        Z`;
    };

    const handleMonthlyTacticalPoints = async (totalPoints: number, uid: string) => {
        const currentMonthKey = getCurrentMonthKey();
        const storageRef = doc(db, "UserDetails", uid, "MonthlyProgress", currentMonthKey);

        try {
            // Get stored data for current month
            const snapShot = await getDoc(storageRef);
            const monthlyData = snapShot.exists() ? snapShot.data() : { points: 0, lastTotal: 0 }

            // Calculate points gained this month
            const pointsGained = totalPoints - monthlyData.lastTotal;
            const newMonthlyPoints = monthlyData.points + Math.max(0, pointsGained);

            await setDoc(storageRef, {
                points: newMonthlyPoints,
                lastTotal: totalPoints
            });


            setMonthlyTacticalPoints(newMonthlyPoints);

        } catch (error) {
            console.error("Error handling monthly tactical points:", error);
        }
    };

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

                await handleMonthlyTacticalPoints(data.TacticalPoints || 0, uid);

                if (data.stepBaseline) {
                    setBaselineSteps(data.stepBaseline);
                }

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


    const initializeStepsForNewAccount = async () => {
        const user = auth.currentUser;
        if (!user) return;

        // Check if this is a new account setup
        const userDocRef = doc(db, "UserDetails", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && !userDoc.data().stepBaseline) {
            // Get current device steps to use as baseline
            const now = new Date();
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const result = await Pedometer.getStepCountAsync(startOfDay, now);

            // Store baseline in Firestore
            await updateDoc(userDocRef, {
                stepBaseline: result.steps,
                stepBaselineDate: new Date().toISOString()
            });

            setBaselineSteps(result.steps);
        }
    };

    const checkStoredUser = async () => {
        // Check if there's a stored UID
        const storedUid = await getUserFromStorage();

        if (storedUid) {
            console.log("Found stored user UID:", storedUid);
            // Subscribe to user data with the stored UID
            subscribeToUserData(storedUid);

            await initializeStepsForNewAccount();
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

        Pedometer.isAvailableAsync().then(
            (result) => setIsAvailable(String(result)),
            (error) => setIsAvailable('Error: ' + error)
        );

        // Get steps from beginning of the day
        const now = new Date();
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        Pedometer.getStepCountAsync(startOfDay, now).then(
            (result) => {
                setStepCount(result.steps); // start from today’s steps
                saveStepCountToFirestore(result.steps);
            },
            (error) => {
                console.log('Error getting step count: ', error);
            }
        );

        // Start live updates
        const subscription = Pedometer.watchStepCount(async () => {
            const now = new Date();
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            try {
                const result = await Pedometer.getStepCountAsync(startOfDay, now);
                setStepCount(result.steps);
                saveStepCountToFirestore(result.steps);
            } catch (error: any) {
                console.log("Error updating live steps: ", error);

            }
        });

        // Cleanup on unmount
        return () => {
            subscription.remove();
        };
    }, []);



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

    const saveStepCountToFirestore = async (steps: number) => {
        const user = auth.currentUser;
        if (!user) return;

        const today = new Date().toISOString().split('T')[0]; // e.g., '2025-07-05'
        const stepDocRef = doc(db, "UserDetails", user.uid, "StepLogs", today);


        // Save the adjusted steps (steps minus baseline)
        const adjustedSteps = Math.max(0, steps - baselineSteps);

        try {
            await setDoc(stepDocRef, {
                steps: adjustedSteps,
                rawSteps: steps, // Keep raw steps for reference
                timestamp: new Date().toISOString()
            });
            console.log("Step count saved to Firestore");
        } catch (e) {
            console.error("Error saving step count: ", e);
        }
    };

    const resetStepData = async () => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            // Clear from Firestore
            const today = new Date().toISOString().split('T')[0];
            const stepDocRef = doc(db, "UserDetails", user.uid, "StepLogs", today);
            await deleteDoc(stepDocRef);

            // Reset local state
            setStepCount(0);

            console.log("Step data reset");
        } catch (error) {
            console.error("Error resetting step data:", error);
        }
    };

    // Update your step display logic
    const displaySteps = Math.max(0, stepCount - baselineSteps);

    useEffect(() => {
        loadUserInfoFromStorage();
    }, [])

    return (
        <View
            style={{
                flex: 1
            }}
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
                </View>
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    position: "absolute",
                    gap: 10,
                    padding: 20,
                    top: "25%"
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
                            fontWeight: '700'
                        }}>{userInfo?.firstName} {userInfo?.lastName}</Text>
                        <Text style={{
                            color: "white",
                            fontSize: 12,
                            fontWeight: '500'
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
                                fontWeight: '500'
                            }}>{userInfo?.TacticalPoints ?? 0}</Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={{
                padding: 20,
                gap: 30
            }}>
                <View style={{
                    padding: 10,
                    backgroundColor: 'white',
                    borderRadius: 16,
                    justifyContent: "center",
                    // iOS shadow
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: 4,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,

                    // Android shadow
                    elevation: 5,
                }}>
                    <View style={{
                        flexDirection: "row",
                        gap: 10,
                        alignItems: "center"
                    }}>
                        <Image
                            style={{
                                height: 20,
                                width: 20
                            }}
                            source={require("../../assets/Icons/steps-icon.png")} />
                        <Text style={{
                            color: "#6C659C"
                        }}>STEPS</Text>
                    </View>
                    <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between"
                    }}>
                        <View style={{
                            flexDirection: "row",
                            alignItems: "flex-end"
                        }}>
                            <Text style={{
                                fontSize: 35
                            }}>{displaySteps}</Text>
                            <Text style={{
                                bottom: 6,
                                fontSize: 8
                            }}>STEPS TODAY</Text>
                        </View>
                        <Image
                            style={{
                                height: 80,
                                width: 140,
                                resizeMode: "contain"
                            }}
                            source={require("../../assets/Icons/Graph.png")}
                        />
                    </View>
                </View>
                <View style={{
                    paddingHorizontal: 15,
                    paddingVertical: 30,
                    gap: 20,
                    backgroundColor: 'white',
                    borderRadius: 16,
                    justifyContent: "center",
                    // iOS shadow
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: 4,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,

                    // Android shadow
                    elevation: 5,
                }}>
                    <View style={{
                        flexDirection: "row",
                        gap: 10,
                        alignItems: "center"
                    }}>
                        <Image
                            style={{
                                height: 20,
                                width: 20
                            }}
                            source={require("../../assets/Icons/workout_icon.png")} />
                        <Text style={{
                            color: "#188649"
                        }}>WORKOUT</Text>
                    </View>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: "center",
                        justifyContent: "space-between"
                    }}>
                        <TouchableOpacity onPress={() => {
                            navigation.navigate("RunningScreen")
                        }}>
                            <Image
                                source={require("../../assets/Icons/exercise_icon.png")}
                                style={{
                                    height: 50,
                                    width: 50,
                                    resizeMode: 'contain'
                                }}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                navigation.navigate("SitUpScreen")
                            }}
                            style={{
                                borderWidth: 1,
                                padding: 10,
                                borderRadius: 50,
                                borderColor: "#D3D3D3"
                            }}>
                            <Image
                                source={require("../../assets/Icons/sit-up-icon.png")}
                                style={{
                                    height: 25,
                                    width: 25,
                                    resizeMode: 'contain'
                                }}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                navigation.navigate("PushUpsScreen")
                            }}
                            style={{
                                borderWidth: 1,
                                padding: 10,
                                borderRadius: 50,
                                borderColor: "#D3D3D3"
                            }}>
                            <Image
                                source={require("../../assets/Icons/boy-doing-pushups-.png")}
                                style={{
                                    height: 25,
                                    width: 25,
                                    resizeMode: 'contain'
                                }}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                navigation.navigate("SprintScreen")
                            }}
                            style={{
                                borderWidth: 1,
                                padding: 10,
                                borderRadius: 50,
                                borderColor: "#D3D3D3"
                            }}>
                            <Image
                                source={require("../../assets/Icons/sport.png")}
                                style={{
                                    height: 25,
                                    width: 25,
                                    resizeMode: 'contain'
                                }}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                navigation.navigate("PullUpScreen")
                            }}
                            style={{
                                borderWidth: 1,
                                padding: 10,
                                borderRadius: 50,
                                borderColor: "#D3D3D3"
                            }}>
                            <Image
                                source={require("../../assets/Icons/pull.png")}
                                style={{
                                    height: 25,
                                    width: 25,
                                    resizeMode: 'contain'
                                }}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{
                    paddingHorizontal: 15,
                    paddingVertical: 30,
                    gap: 20,
                    backgroundColor: 'white',
                    borderRadius: 16,
                    justifyContent: "center",
                    // iOS shadow
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: 4,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,

                    // Android shadow
                    elevation: 5,
                }}>
                    <View style={{
                        flexDirection: "row",
                        gap: 10,
                        alignItems: "center"
                    }}>
                        <Image
                            style={{
                                height: 20,
                                width: 20,
                            }}
                            source={require("../../assets/Icons/workout_icon.png")} />
                        <Text style={{
                            color: "#188649"
                        }}>TACTIXFIT POINTS</Text>
                    </View>
                    <View style={{
                        alignItems: "center",
                        flexDirection: "row",
                        alignSelf: "center",
                        gap: 20,
                        justifyContent: "center",
                    }}>
                        <View style={styles.wrapper}>
                            <Progress.Bar
                                progress={progress}
                                width={barWidth}
                                height={30}
                                color={currentTier.color}
                                borderRadius={15}
                                unfilledColor="#E0E0E0"
                                borderWidth={0}
                            />
                            <View style={styles.textContainer}>
                                <Text style={styles.progressText}>{progressPercentage}% COMPLETED ({monthlyTacticalPoints}/{MONTHLY_TARGET})</Text>
                            </View>
                        </View>
                        <View style={{
                            alignItems: "center"
                        }}>
                            <Image source={currentTier.icon}
                                style={{
                                    height: 20,
                                    width: 20
                                }}
                            />
                            <Text style={{
                                color: currentTier.color,
                                fontWeight: "900",
                                fontSize: 12,
                            }}>{currentTier.name}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    )
}

export default HomePage;

const styles = StyleSheet.create({
    container: {
    },
    headerContainer: {
        justifyContent: "center",
        backgroundColor: 'transparent',
    },
    svg: {
        padding: 20,
    },
    top_container: {
        backgroundColor: "#FFD700",
        height: "20%",
        justifyContent: "center",
        padding: 20
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
    },
    wrapper: {
        height: 50,
        justifyContent: "center",
        alignItems: "center",
    },
    textContainer: {
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
    },
    progressText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 13,
    },
    shadowWrapper: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.8,
        shadowRadius: 15,

        // Android shadow
        elevation: 12,

        // Ensure shadow doesn't get clipped
        zIndex: 1,
    },
})
