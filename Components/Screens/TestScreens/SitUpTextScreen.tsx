import { Alert, Dimensions, Image, ImageBackground, Modal, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Theme } from "../../Branding/Theme";
import React, { useEffect, useRef, useState } from "react";
import { Accelerometer } from "expo-sensors";
import { Switch } from "react-native-paper";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { auth, db } from "../../../Firebase/Settings";
import * as Speech from "expo-speech";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";
import { TourGuideZone, useTourGuideController } from "rn-tourguide";
import { Video } from 'expo-av';

interface ITestProps {
    navigation?: any;
}

enum SitupState {
    READY,       // Starting position (lying down)
    GOING_UP,    // User is sitting up
    UP,          // User is in the up position
    GOING_DOWN,  // User is going back down
    DOWN         // User has completed a rep (back to lying position)
}

interface SensorData {
    z?: number;
    x?: number;
    y?: number;
}

const { width: screenWidth } = Dimensions.get('window');

const SitUpTestScreen = ({
    navigation
}: ITestProps) => {

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isPrepModalVisible, setIsPrepModalVisible] = useState(false);
    const [time, setTime] = useState(60);
    const [isStartModalVisible, setIsStartModalVisible] = useState(false);
    const [isResultModalVisible, setIsResultModalVisible] = useState(false);
    const [prepTime, setPrepTime] = useState(5);
    const [isStartRunning, setIsStartRunning] = useState(false);
    const [startTime, setStartTime] = useState(60);
    const [isAutoDetectEnabled, setIsAutoDetectEnabled] = useState(true);
    const [showManualInputModal, setShowManualInputModal] = useState(false);
    const [sensorData, setSensorData] = useState<SensorData>({});
    const [sitUpCount, setSitUpCount] = useState(0);
    const [situpState, setSitupState] = useState<SitupState>(SitupState.READY);
    const [isFirstCalibration, setIsFirstCalibration] = useState(true);
    const [progress, setProgress] = useState(0);
    const calibrationValuesRef = useRef({
        downThreshold: 0.25,
        upThreshold: -0.35,
        midThreshold: -0.075
    });
    const calibrationValues = calibrationValuesRef.current;

    const {
        canStart,
        start,
        stop,
        eventEmitter,
    }: any = useTourGuideController();
    const [lastCountTime, setLastCountTime] = useState<number>(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isGoingDown, setIsGoingDown] = useState(false);
    const [isCountingActive, setIsCountingActive] = useState(false);
    const insets = useSafeAreaInsets();

    React.useEffect(() => {
        if (canStart) {
            start()
        }
    }, [canStart])

    const handleOnStart = () => console.log('start')
    const handleOnStop = () => console.log('stop')
    const handleOnStepChange = () => console.log(`stepChange`);

    React.useEffect(() => {
        eventEmitter.on('start', handleOnStart)
        eventEmitter.on('stop', handleOnStop)
        eventEmitter.on('stepChange', handleOnStepChange)

        return () => {
            eventEmitter.off('start', handleOnStart)
            eventEmitter.off('stop', handleOnStop)
            eventEmitter.off('stepChange', handleOnStepChange)
        }
    }, [])

    // Sit-up specific timing constraints
    const MIN_SITUP_TIME = 800;  // Minimum time for a valid sit-up (ms)
    const MAX_SITUP_TIME = 4000; // Maximum time for a valid sit-up (ms)
    const COOLDOWN_MS = 300;     // Cooldown between reps

    // Track timestamps for each state transition
    const [stateTimestamps, setStateTimestamps] = useState({
        downStart: 0,
        downEnd: 0,
        upStart: 0,
        upEnd: 0
    });

    // Refs for intervals
    const startIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Track recent Z values for smoothing
    const recentZValues = useRef<number[]>([]);
    const MAX_HISTORY = 7; // Increased for better smoothing

    const sayNumber = (number: number) => {
        Speech.speak(number.toString());
    }

    const saveRunResultToFirestore = async () => {
        const user = auth.currentUser;

        if (!user) {
            console.warn("No user signed in");
            return;
        }

        const userDetailsRef = doc(db, "UserDetails", user.uid);
        const sitUpDocRef = doc(db, `UserDetails/${user.uid}/SitUps/${Date.now()}`);
        console.log("Attempting to save sit-up data to path:", sitUpDocRef);

        const TacticalPoints = sitUpCount >= 38 ? 10 : 0;

        const runData = {
            uid: user.uid,
            sitUpCount: sitUpCount,
            startTime: startTime,
            timestamp: new Date().toISOString(),
            TacticalPoints: TacticalPoints,
        };

        try {
            await setDoc(sitUpDocRef, runData);

            // 2. Fetch current personal best
            const userDoc = await getDoc(userDetailsRef);
            const existingData = userDoc.exists() ? userDoc.data().personalBests || {} : {};
            const currentSitUpBest = existingData.sitUps || 0;
            const userData = userDoc.exists() ? userDoc.data() : {};
            const currentTotal = userData.TacticalPoints || 0;

            await setDoc(userDetailsRef, {
                TacticalPoints: currentTotal + TacticalPoints
            }, { merge: true });

            // Update personal bests if new value is higher
            if (sitUpCount > currentSitUpBest) {
                await setDoc(userDetailsRef, {
                    personalBests: {
                        ...existingData,
                        sitUps: sitUpCount
                    }
                }, { merge: true });
            }

            console.log("Sit-up data saved to Firestore:", runData);
        } catch (error) {
            console.error("Error saving sit-up data to Firestore:", error);
        }
    };

    // Function to get smoothed Z value
    const getSmoothedZ = () => {
        if (recentZValues.current.length === 0) return 0;
        const sum = recentZValues.current.reduce((a, b) => a + b, 0);
        return sum / recentZValues.current.length;
    };

    // Add new Z value and maintain limited history
    const addZValue = (z: number) => {
        recentZValues.current.push(z);
        if (recentZValues.current.length > MAX_HISTORY) {
            recentZValues.current.shift();
        }
    };

    // Start preparation countdown
    const startPrepCountdown = () => {
        if (prepTime > 0 && !isRunning) {
            setIsRunning(true);
        }
    };

    const hanldleGetStarted = () => {
        if (isAutoDetectEnabled) {
            setIsModalVisible(true);
        } else {
            setIsPrepModalVisible(true);
            startPrepCountdown();
        }
    }

    const askForManualInputModal = () => {
        setShowManualInputModal(true);
    }


    const startMainCountdown = () => {
        if (time > 0 && !isStartRunning) {
            setIsStartRunning(true);
            if (isAutoDetectEnabled && !isCountingActive) {
                setIsCountingActive(true);
            }
        }
    };

    const modalToPrepModal = () => {
        setIsModalVisible(false);
        setTimeout(() => {
            setIsPrepModalVisible(true);
            startPrepCountdown();
        }, 700);
    };

    // Preparation timer logic
    useEffect(() => {
        if (isRunning && prepTime > 0) {
            sayNumber(prepTime);
            intervalRef.current = setInterval(() => {
                setPrepTime(prev => {
                    const newTime = prev - 1;
                    if (newTime > 0) {
                        sayNumber(newTime);
                    }

                    if (newTime <= 0) {
                        clearInterval(intervalRef.current as NodeJS.Timeout);
                        setIsRunning(false);
                        setIsPrepModalVisible(false);
                        setTimeout(() => {
                            Speech.speak("Begin!")
                            setIsStartModalVisible(true);
                        }, 700)
                    }

                    return newTime;
                });
            }, 1000);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning]);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                const next = prev + 0.1;
                return next > 1 ? 1 : next;
            });
        }, 500);

        return () => clearInterval(interval);
    }, []);

    // Main timer logic
    useEffect(() => {
        if (isStartRunning && time > 0) {
            const interval = setInterval(() => {
                setTime(prev => {
                    if (prev === 1) {
                        clearInterval(interval);
                        setIsStartRunning(false);
                        setIsStartModalVisible(false);
                        setIsCountingActive(false);

                        setTimeout(() => {
                            if (isAutoDetectEnabled) {
                                Speech.stop();
                                Speech.speak("Time's up!");
                                setIsResultModalVisible(true);
                            } else {
                                askForManualInputModal();
                            }
                        }, 700);
                    }

                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(interval); // 🛑 Prevent memory leak
        }
    }, [isStartRunning, isAutoDetectEnabled]);

    // Accelerometer setup
    useEffect(() => {
        const subscription = Accelerometer.addListener(accelerometerData => {
            setSensorData(accelerometerData);
        });

        Accelerometer.setUpdateInterval(100);

        return () => subscription.remove();
    }, []);

    // Sit-up detection logic optimized for chest-mounted phone
    useEffect(() => {
        if (!isCountingActive || sensorData.z === undefined || !isAutoDetectEnabled) return;

        const now = Date.now();
        const z = sensorData.z;

        addZValue(z);
        const smoothedZ = getSmoothedZ();

        const calibrationValues = calibrationValuesRef.current;

        console.log("Smoothed Z:", smoothedZ.toFixed(3), "State:", SitupState[situpState]);

        // IMPROVED: More gradual and ongoing calibration
        if (sitUpCount < 10) { // Calibrate for first 10 reps instead of 3
            const calibrationFactor = 0.05; // Gentler adjustment

            if (situpState === SitupState.DOWN && smoothedZ > calibrationValues.downThreshold) {
                // Gradually adjust down threshold
                calibrationValuesRef.current.downThreshold = Math.max(
                    calibrationValues.downThreshold - calibrationFactor,
                    smoothedZ * 0.8 // Don't go below 80% of current reading
                );
            }

            if (situpState === SitupState.UP && smoothedZ < calibrationValues.upThreshold) {
                // Gradually adjust up threshold
                calibrationValuesRef.current.upThreshold = Math.min(
                    calibrationValues.upThreshold + calibrationFactor,
                    smoothedZ * 1.2 // Don't go above 120% of current reading
                );
            }

            // Update mid threshold
            calibrationValuesRef.current.midThreshold =
                (calibrationValuesRef.current.upThreshold + calibrationValuesRef.current.downThreshold) / 2;
        }

        // 5. ADD PARTIAL MOVEMENT DETECTION
        // Allow for less perfect form
        const movementThreshold = 0.15; // Minimum movement required

        switch (situpState) {
            case SitupState.READY:
                if (smoothedZ > calibrationValues.downThreshold) {
                    setSitupState(SitupState.DOWN);
                    setStateTimestamps(prev => ({ ...prev, downStart: now, downEnd: now }));
                    console.log("Ready - lying down");
                }
                break;

            case SitupState.DOWN:
                // More forgiving transition to going up
                if (smoothedZ < calibrationValues.midThreshold ||
                    (smoothedZ < calibrationValues.downThreshold - movementThreshold)) {
                    setSitupState(SitupState.GOING_UP);
                    setStateTimestamps(prev => ({ ...prev, upStart: now }));
                    console.log("Starting to sit up");
                }
                break;

            case SitupState.GOING_UP:
                // More forgiving "up" detection
                if (smoothedZ < calibrationValues.upThreshold ||
                    (smoothedZ < calibrationValues.midThreshold - movementThreshold)) {
                    setSitupState(SitupState.UP);
                    setStateTimestamps(prev => ({ ...prev, upEnd: now }));
                    console.log("Reached sitting position");
                } else if (smoothedZ > calibrationValues.downThreshold) {
                    // Only reset if they go way back down
                    setSitupState(SitupState.DOWN);
                    console.log("Reset to down");
                }
                break;

            case SitupState.UP:
                // More forgiving transition to going down
                if (smoothedZ > calibrationValues.midThreshold ||
                    (smoothedZ > calibrationValues.upThreshold + movementThreshold)) {
                    setSitupState(SitupState.GOING_DOWN);
                    setStateTimestamps(prev => ({ ...prev, downStart: now }));
                    console.log("Going back down");
                }
                break;

            case SitupState.GOING_DOWN:
                // More forgiving completion detection
                if (smoothedZ > calibrationValues.downThreshold ||
                    (smoothedZ > calibrationValues.midThreshold + movementThreshold)) {

                    const totalDuration = now - stateTimestamps.upStart;
                    const timeSinceLastCount = now - lastCountTime;

                    // RELAXED VALIDATION - more forgiving
                    if (totalDuration >= MIN_SITUP_TIME &&
                        totalDuration <= MAX_SITUP_TIME &&
                        timeSinceLastCount > COOLDOWN_MS) {

                        setSitUpCount(prev => {
                            const newCount = prev + 1;
                            Speech.stop();
                            sayNumber(newCount);
                            console.log(`Sit-up #${newCount} completed! Duration: ${totalDuration}ms`);
                            return newCount;
                        });

                        setLastCountTime(now);
                    } else {
                        // LESS STRICT FEEDBACK - don't always say "not counted"
                        if (totalDuration < MIN_SITUP_TIME) {
                            console.log(`Too fast - Duration: ${totalDuration}ms`);
                            // Don't give audio feedback for slightly too fast
                        } else if (totalDuration > MAX_SITUP_TIME) {
                            console.log(`Too slow - Duration: ${totalDuration}ms`);
                            // Don't give audio feedback for slightly too slow
                        } else {
                            Speech.stop();
                            Speech.speak("Not counted!");
                            console.log(`Invalid sit-up - Duration: ${totalDuration}ms, Cooldown: ${timeSinceLastCount}ms`);
                        }
                    }

                    setSitupState(SitupState.DOWN);
                    setStateTimestamps(prev => ({ ...prev, downEnd: now }));
                }
                break;
        }
    }, [sensorData, situpState, isCountingActive, isAutoDetectEnabled, lastCountTime, stateTimestamps]);

    useEffect(() => {
        if (isStartModalVisible) {
            startMainCountdown();
        }
    }, [isStartModalVisible])

    useEffect(() => {
        const subscription = Accelerometer.addListener(accelerometerData => {
            setSensorData(accelerometerData);
        });

        Accelerometer.setUpdateInterval(100);

        return () => subscription.remove();
    }, []);

    const stopTracking = async (): Promise<void> => {
        await saveRunResultToFirestore();
    };

    const resetTestState = () => {
        setSitUpCount(0);
        setSitupState(SitupState.READY);
        setStateTimestamps({
            downStart: 0,
            downEnd: 0,
            upStart: 0,
            upEnd: 0
        });
        setLastCountTime(0);
        setIsCountingActive(false);
        // Clear recent Z values for fresh calibration
        recentZValues.current = [];
        // Reset calibration values
        calibrationValuesRef.current = {
            downThreshold: 0.25,
            upThreshold: -0.35,
            midThreshold: -0.075
        };
    };

    const handleEndCountdown = () => {
        Alert.alert(
            'End Countdown',
            'Are you sure you want to end the sit up count?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'End',
                    onPress: () => {
                        if (startIntervalRef.current) {
                            clearInterval(startIntervalRef.current)
                            startIntervalRef.current = null;
                        }

                        Speech.stop();
                        setIsStartRunning(false);
                        setIsCountingActive(false);
                        setIsStartModalVisible(false);
                        setTime(60);

                        if (isAutoDetectEnabled) {
                            setIsResultModalVisible(true);
                        } else {
                            askForManualInputModal();
                        }
                    },
                    style: 'destructive'
                },
            ],
            { cancelable: true }
        );
    };

    const formatTime = (seconds: number) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
    }

    const increaseTime = () => setTime(prev => prev + 10);
    const decreaseTime = () => setTime(prev => (prev > 10 ? prev - 10 : 0));

    return (
        <View style={{
            flex: 1,
            gap: 10
        }}>
            <LinearGradient
                colors={['#FFD700', '#FFA500']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                    height: "40%",
                    paddingTop: 50,
                    borderBottomRightRadius: 10,
                    borderBottomLeftRadius: 10
                }}
            >
                <View style={{
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingHorizontal: 20,
                }}>
                    <TouchableOpacity
                        onPress={() => {
                            navigation.goBack();
                        }}
                    >
                        <Image source={require("../../../assets/downloadedIcons/back1.png")}
                            style={{
                                width: 20,
                                height: 20
                            }}
                        />
                    </TouchableOpacity>
                    <Text style={{
                        color: "white"
                    }}>SIT-UPS (TEST MODE)</Text>
                    <TouchableOpacity
                        onPress={() => {
                            navigation.navigate("SitUpHistory")
                        }}
                    >
                        <Image source={require("../../../assets/downloadedIcons/notification.png")}
                            style={{
                                height: 30,
                                width: 30,
                                resizeMode: "contain"
                            }}
                        />
                    </TouchableOpacity>
                </View>
                <View style={{
                    paddingTop: 20
                }}>
                    <Video
                        source={require("../../../assets/ExerciseGifs/situps.mp4")}
                        rate={1.0}
                        shouldPlay
                        isLooping
                        style={{
                            height: "85%",
                            width: "85%",
                            alignSelf: "center"
                        }}
                    />
                </View>
            </LinearGradient>
            <View style={{
                flex: 1,
                padding: 20
            }}>
                <SafeAreaView style={{
                    padding: 20,
                    flex: 1,
                    justifyContent: "space-between",
                }}>
                    <View style={{
                        gap: 20,
                    }}>
                        <View style={{
                            padding: 15,
                            backgroundColor: 'white',
                            borderRadius: 16,
                            gap: 10,
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
                            {/* <VideoView
                        style={{
                            alignSelf: "center",
                            width: 280,
                            height: 280,
                            borderRadius: 20
                        }}
                        player={sitUpsPlayer}
                    /> */}
                            <Text style={{
                                alignSelf: "center",
                                fontWeight: "400",
                                textAlign: "center",
                                fontSize: 14
                            }}>
                                Target sit-ups count
                            </Text>
                            <View style={{
                                paddingHorizontal: 10,
                                alignItems: "center",
                                borderRadius: 25,
                                flexDirection: "row",
                                justifyContent: "space-between",
                            }}>
                                <TourGuideZone
                                    zone={1}
                                    shape="rectangle"
                                    text="🎯 Minimum Target: This is the minimum number of sit-ups you need to complete to pass the fitness test. Aim to reach or exceed this number!"
                                >

                                    <View style={{
                                        alignItems: "center"
                                    }}>
                                        <Text style={{
                                            fontSize: 35,
                                            fontWeight: "600"
                                        }}>
                                            38
                                        </Text>
                                        <Text style={{
                                            fontSize: 10,
                                            fontWeight: "400"
                                        }}>MINIMUM</Text>
                                    </View>
                                </TourGuideZone>
                                <TourGuideZone
                                    zone={2}
                                    shape="rectangle"
                                    text="🔄 Auto-Detect Mode: Toggle ON to automatically count sit-ups using face tracking. Toggle OFF to manually input your count at the end of the session."
                                >

                                    <View style={{
                                        alignItems: "center",
                                        gap: 10
                                    }}>
                                        <Switch
                                            color={"#FA812890"}
                                            value={isAutoDetectEnabled}
                                            onValueChange={(value) => setIsAutoDetectEnabled(value)}
                                        />
                                        <Text style={{
                                            fontSize: 10,
                                            fontWeight: "400"
                                        }}>AUTO DETECT</Text>
                                    </View>
                                </TourGuideZone>
                            </View>
                        </View>
                        <View style={{
                            padding: 15,
                            backgroundColor: 'white',
                            borderRadius: 16,
                            gap: 10,
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
                            {/* <VideoView
                        style={{
                            alignSelf: "center",
                            width: 280,
                            height: 280,
                            borderRadius: 20
                        }}
                        player={sitUpsPlayer}
                    /> */}
                            <Text style={{
                                alignSelf: "center",
                                fontWeight: "400",
                                textAlign: "center",
                                fontSize: 14
                            }}>
                                Set your preferred time limit
                            </Text>
                            <View style={{
                                paddingHorizontal: 10,
                                alignItems: "center",
                                borderRadius: 25,
                                flexDirection: "row",
                                justifyContent: "space-between",
                            }}>
                                <TourGuideZone
                                    zone={3}
                                    shape="circle"
                                    text="➖ Decrease Time: Tap to reduce the session duration by 10 seconds. Minimum duration is 10 seconds."
                                >

                                    <TouchableOpacity
                                        style={{
                                            height: 30,
                                            width: 30,
                                            borderRadius: 15,
                                            alignItems: "center",
                                            backgroundColor: "#FA812890"
                                        }}
                                        onPress={() => {
                                            decreaseTime();
                                        }}
                                    >
                                        <Text style={{
                                            color: "white",
                                            fontSize: 20
                                        }}>-</Text>
                                    </TouchableOpacity>
                                </TourGuideZone>
                                <TourGuideZone
                                    zone={4}
                                    shape="rectangle"
                                    text="⏱️ Timer Display: Shows your selected session duration. You can increase or decrease this time based on your fitness level and goals."
                                >

                                    <View style={{
                                        alignItems: "center"
                                    }}>
                                        <Text style={{
                                            fontSize: 35,
                                            fontWeight: "600"
                                        }}>
                                            {formatTime(time)}
                                        </Text>
                                        <Text style={{
                                            fontSize: 10
                                        }}>MINUTE</Text>
                                    </View>
                                </TourGuideZone>
                                <TourGuideZone
                                    zone={5}
                                    shape="circle"
                                    text="➕ Increase Time: Tap to add 10 seconds to your session duration. Adjust based on your fitness level."
                                >

                                    <TouchableOpacity
                                        style={{
                                            height: 30,
                                            borderRadius: 15,
                                            width: 30,
                                            alignItems: "center",
                                            backgroundColor: "#FA812890"
                                        }}
                                        onPress={() => {
                                            increaseTime();
                                        }}
                                    >
                                        <Text style={{
                                            color: "white",
                                            fontSize: 20
                                        }}>+</Text>
                                    </TouchableOpacity>
                                </TourGuideZone>
                            </View>
                        </View>
                    </View>
                    <TourGuideZone
                        zone={6}
                        shape="rectangle"
                        text="🚀 Start Your Session: Tap to begin your sit-up session. You'll get a 5-second countdown to prepare before the timer starts!"
                    >

                        <TouchableOpacity style={styles.getStartedBtn}
                            onPress={() => {
                                modalToPrepModal();
                            }}
                        >
                            <Text style={{
                                color: "white",
                                fontWeight: "600"
                            }}>START SIT-UPS</Text>
                            <Image source={require("../../../assets/Icons/fast-forward.png")}
                                style={{
                                    width: 15,
                                    height: 15,
                                    resizeMode: "contain"
                                }}
                            />
                        </TouchableOpacity>
                    </TourGuideZone>
                </SafeAreaView>
            </View>
            <Modal
                visible={isPrepModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => {
                    setIsModalVisible(false);
                }}
            >
                <View style={{
                    flex: 1,
                    justifyContent: "flex-end",
                }}>
                    <LinearGradient
                        colors={['#FFD700', '#FFA500']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                            height: "25%",
                            width: "100%",
                            alignSelf: "center",
                            gap: 20,
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 15
                        }}
                    >
                        <View style={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            padding: 20
                        }}>
                            <TouchableOpacity style={{
                            }}
                                onPress={() => {
                                    setIsPrepModalVisible(false);
                                    setPrepTime(5);
                                    setIsRunning(false);
                                    if (intervalRef.current) {
                                        clearInterval(intervalRef.current);
                                        intervalRef.current = null;
                                    }
                                }}
                            >
                                <Text style={{
                                    fontSize: 17,
                                    color: "white",
                                }}>close</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{
                            height: 150,
                            width: '70%',
                            borderRadius: 5,
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 10,
                        }}>
                            <View style={{
                                flexDirection: "row",
                                alignItems: "flex-end",
                            }}>
                                <Text style={{
                                    fontSize: 60,
                                    color: "white",
                                }}>{prepTime}</Text>
                                <Text style={{
                                    fontSize: 17,
                                    bottom: 10,
                                    color: "white",
                                }}>sec</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => {

                                }}
                            >
                                <Text style={{
                                    color: "white"
                                }}>GET READY</Text>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </View>
            </Modal>
            <Modal
                visible={isStartModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => {
                    setIsModalVisible(false);
                }}
            >
                <View style={{
                    flex: 1,
                    justifyContent: "flex-end"
                }}>
                    <LinearGradient
                        colors={['#FFD700', '#FFA500']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                            height: "35%",
                            width: "100%",
                            alignSelf: "center",
                            gap: 20,
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 15
                        }}
                    >

                        <View style={{
                            height: 120,
                            width: '70%',
                            borderRadius: 5,
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 10,
                            backgroundColor: "rgba(0, 0, 0, 0.3)"
                        }}>
                            <View style={{
                                flexDirection: "row",
                                alignItems: "flex-end",

                            }}>
                                <Text style={{
                                    fontSize: 20,
                                    color: "white"
                                }}>
                                    {formatTime(time)}
                                </Text>
                                <Text style={{
                                    fontSize: 12,
                                    color: "white",
                                }}>sec</Text>
                            </View>
                            <View style={{
                                flexDirection: "row",
                                alignItems: "flex-end",
                            }}>
                                <Text style={{
                                    fontSize: 50,
                                    color: "white",
                                }}>{sitUpCount}</Text>

                            </View>
                        </View>
                        <TouchableOpacity
                            style={{
                                backgroundColor: "rgba(0, 0, 0, 0.3)",
                                padding: 20,
                                width: "70%",
                                justifyContent: "space-between",
                                flexDirection: "row",
                                alignItems: "center"
                            }}
                            onPress={() => {
                                handleEndCountdown();
                            }}
                        >
                            <Text style={{
                                color: "white"
                            }}>END SITUP</Text>
                            <Image source={require("../../../assets/Icons/fast-forward.png")}
                                style={{
                                    width: 15,
                                    height: 15,
                                    resizeMode: "contain"
                                }}
                            />
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            </Modal>
            <Modal
                visible={isResultModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => {
                    setIsModalVisible(false);
                }}
            >
                <View style={{
                    flex: 1,
                    justifyContent: "flex-end"
                }}>
                    <LinearGradient
                        colors={['#FFD700', '#FFA500']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                            height: "35%",
                            width: "100%",
                            alignSelf: "center",
                            gap: 20,
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 15
                        }}
                    >
                        <View style={{
                            position: "absolute",
                            top: 10,
                            right: 0,
                            paddingHorizontal: 20
                        }}>
                            <TouchableOpacity style={{

                            }}
                                onPress={() => {
                                    setIsResultModalVisible(false);
                                    setPrepTime(5);
                                    setIsRunning(false);
                                    if (intervalRef.current) {
                                        clearInterval(intervalRef.current);
                                        intervalRef.current = null;
                                    }
                                    resetTestState();
                                    setTime(60)
                                    setIsStartRunning(false);
                                    if (startIntervalRef.current) {
                                        clearInterval(startIntervalRef.current);
                                        startIntervalRef.current = null;
                                    }
                                }}
                            >
                                <Text style={{
                                    fontSize: 17,
                                    color: "white",
                                }}>close</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{
                            height: 100,
                            width: '70%',
                            borderRadius: 5,
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 10,
                            backgroundColor: "rgba(0, 0, 0, 0.3)"
                        }}>
                            <View style={{
                                flexDirection: "row",
                                alignItems: "flex-end",
                            }}>
                                <Text style={{
                                    fontSize: 40,
                                    color: "white",
                                }}>{sitUpCount}</Text>
                                {/* <Text style={{
                                        fontSize: 17,
                                        bottom: 10,
                                        color: "white",
                                    }}>min</Text> */}
                            </View>
                            <View
                            >
                                <Text style={{
                                    color: "white"
                                }}>Correct Sit Ups</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={{
                            width: "70%",
                            backgroundColor: "rgba(0, 0, 0, 0.3)",
                            justifyContent: "space-between",
                            flexDirection: "row",
                            padding: 20,
                            borderRadius: 5,
                            alignItems: "center"
                        }}
                            onPress={() => {
                                setIsResultModalVisible(false);
                                navigation.goBack();
                                stopTracking();
                                setTime(60);
                            }}
                        >
                            <Text style={{
                                color: "white"
                            }}>SUBMIT</Text>
                            <Image source={require("../../../assets/downloadedIcons/fast.png")}
                                style={{
                                    width: 25,
                                    height: 25,
                                    resizeMode: "contain"
                                }}
                            />
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            </Modal>
            <Modal
                visible={showManualInputModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => {
                    setShowManualInputModal(false);
                }}
            >
                <View style={{
                    flex: 1,
                    justifyContent: "center",
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    padding: 20,
                }}>
                    <View style={{
                        height: "30%",
                        padding: 20,
                        justifyContent: "center",
                        backgroundColor: Theme.colors.backgroundColor,
                        gap: 20
                    }}>
                        <View style={{
                            gap: 10
                        }}>
                            <Text style={{
                                textAlign: "center",
                                fontWeight: "600"
                            }}>TIME OVER!!!</Text>
                            <View>
                                <Text style={{
                                    fontWeight: "200",
                                    fontSize: 16,
                                    textAlign: "center"
                                }}>Input your Sit-up count</Text>
                            </View>
                        </View>
                        <TextInput
                            value={sitUpCount === 0 ? "" : sitUpCount.toString()}
                            onChangeText={(text) => setSitUpCount(Number(text))}
                            keyboardType="numeric"
                            placeholderTextColor="#aaa"
                            style={{
                                borderWidth: 1,
                                borderColor: '#ccc',
                                borderRadius: 10,
                                alignSelf: "center",
                                width: "30%",
                                padding: 15,
                                fontSize: 16,
                                backgroundColor: '#f9f9f9',
                                color: '#000',
                            }}
                        />
                        <TouchableOpacity style={styles.getStartedBtn}
                            onPress={() => {
                                setShowManualInputModal(false);
                                setPrepTime(5);
                                saveRunResultToFirestore();
                                stopTracking();
                                setIsRunning(false);
                                if (intervalRef.current) {
                                    clearInterval(intervalRef.current);
                                    intervalRef.current = null;
                                }
                            }}
                        >
                            <Text style={{
                                color: "white"
                            }}>SUBMIT</Text>
                            <Image source={require("../../../assets/downloadedIcons/fast.png")}
                                style={{
                                    height: 24,
                                    width: 24
                                }}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            {/* <Text>Push-Up Count: {sitUpCount}</Text>
            <Text>Sensor Z: {sensorData.z?.toFixed(2)}</Text> */}
        </View>
    )
}

export default SitUpTestScreen;

const styles = StyleSheet.create({
    container: {
    },
    getStartedBtn: {
        padding: 20,
        backgroundColor: "#FA812890",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        alignSelf: "center",
        borderRadius: 5,
        gap: 10,
        flexDirection: "row"
    },
})