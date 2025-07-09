import { Alert, Dimensions, Image, ImageBackground, Modal, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Theme } from "../../Branding/Theme";
import React, { useEffect, useRef, useState } from "react";
import { Accelerometer } from "expo-sensors";
import { Switch } from "react-native-paper";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../../Firebase/Settings";
import * as Speech from "expo-speech";
import LottieView from "lottie-react-native";
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { LinearGradient } from "expo-linear-gradient";
import { TourGuideZone, useTourGuideController } from "rn-tourguide";

const { width: screenWidth } = Dimensions.get('window');

interface ITestProps {
    navigation?: any;
}

enum PullupState {
    READY,       // Starting position, waiting for movement
    GOING_UP,    // User is pulling up
    UP,          // User is in the up position (chin over bar)
    GOING_DOWN,  // User is going down
    DOWN         // User has completed a rep (back to starting position)
}

interface SensorData {
    z?: number;
    x?: number;
    y?: number;
}

const PullUpTestScreen = ({
    navigation
}: ITestProps) => {

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isPrepModalVisible, setIsPrepModalVisible] = useState(false);
    const [isStartModalVisible, setIsStartModalVisible] = useState(false);
    const [isResultModalVisible, setIsResultModalVisible] = useState(false);
    const [prepTime, setPrepTime] = useState(5);
    const [time, setTime] = useState(60);
    const [isStartRunning, setIsStartRunning] = useState(false);
    const [startTime, setStartTime] = useState(60);
    const [isAutoDetectEnabled, setIsAutoDetectEnabled] = useState(true);
    const [showManualInputModal, setShowManualInputModal] = useState(false);
    const [sensorData, setSensorData] = useState<SensorData>({});
    const [pullUpCount, setPullUpCount] = useState(0);
    const [pullupState, setPullupState] = useState<PullupState>(PullupState.READY);
    const [isFirstCalibration, setIsFirstCalibration] = useState(true);

    // Adjusted thresholds for arm-mounted pull-up detection
    const [calibrationValues, setCalibrationValues] = useState({
        upThreshold: 0.3,      // Threshold for detecting upward movement (pulling up)
        downThreshold: -0.3,   // Threshold for detecting downward movement (going down)
        midThreshold: 0.0,     // Neutral position
        minUpValue: 0.4,       // Minimum acceleration to confirm top position
        minDownValue: -0.4     // Minimum acceleration to confirm bottom position
    });

    const {
        canStart,
        start,
        stop,
        eventEmitter,
    }: any = useTourGuideController();
    const [lastCountTime, setLastCountTime] = useState<number>(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isCountingActive, setIsCountingActive] = useState(false);

    // Pull-up specific timing constants
    const MIN_PULLUP_TIME = 500;  // Minimum time for a valid pull-up (ms) - increased for pull-ups
    const MAX_PULLUP_TIME = 1200; // Maximum time for a valid pull-up (ms) - increased for pull-ups
    const COOLDOWN_MS = 300;      // Cooldown between reps - increased for pull-ups

    // Track timestamps for each state transition
    const [stateTimestamps, setStateTimestamps] = useState({
        upStart: 0,
        upEnd: 0,
        downStart: 0,
        downEnd: 0
    });

    // Track recent sensor values for smoothing (focusing on Y-axis for arm movement)
    const recentYValues = useRef<number[]>([]);
    const recentZValues = useRef<number[]>([]);
    const MAX_HISTORY = 7; // Increased for better smoothing

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

    // Refs for intervals
    const startIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const sayNumber = (number: number) => {
        Speech.speak(number.toString());
    }

    const createCurvedPath = () => {
        const height = 450;
        const waveHeight = 45;

        return `M 0 0 
        L 0 ${height} 
        Q ${screenWidth * 0.25} ${height + waveHeight} ${screenWidth * 0.5} ${height}
        Q ${screenWidth * 0.75} ${height - waveHeight} ${screenWidth} ${height}
        L ${screenWidth} 0 
        Z`;
    };

    const createTopCurvedPath = () => {
        const height = 400;
        const waveHeight = 45;

        return `M 0 0
            L 0 ${waveHeight}
            Q ${screenWidth * 0.25} ${waveHeight * 2} ${screenWidth * 0.5} ${waveHeight}
            Q ${screenWidth * 0.75} 0 ${screenWidth} ${waveHeight}
            L ${screenWidth} ${height}
            L 0 ${height}
            Z`;
    };

    const saveRunResultToFirestore = async () => {
        const user = auth.currentUser;

        if (!user) {
            console.warn("No user signed in");
            return;
        }
        const userDetailsRef = doc(db, "UserDetails", user.uid);
        const pullUpDocRef = doc(db, `UserDetails/${user.uid}/PullUps/${Date.now()}`);
        console.log("Attempting to save run to path:", pullUpDocRef);

        const TacticalPoints = pullUpCount >= 38 ? 10 : 0;

        const runData = {
            uid: user.uid,
            pullUpCount: pullUpCount,
            startTime: startTime,
            timestamp: new Date().toISOString(),
            TacticalPoints: TacticalPoints
        };

        try {
            await setDoc(pullUpDocRef, runData);

            // 2. Fetch current personal best
            const userDoc = await getDoc(userDetailsRef);
            const existingData = userDoc.exists() ? userDoc.data().personalBests || {} : {};
            const currentPullUpBest = existingData.pullUps || 0;
            const userData = userDoc.exists() ? userDoc.data() : {};
            const currentTotal = userData.TacticalPoints || 0;

            await setDoc(userDetailsRef, {
                TacticalPoints: currentTotal + TacticalPoints
            }, { merge: true });

            // Update personal bests if new value is higher
            if (pullUpCount > currentPullUpBest) {
                await setDoc(userDetailsRef, {
                    personalBests: {
                        ...existingData,
                        pullUps: pullUpCount // Only update pullUps, keep others unchanged
                    }
                }, { merge: true });
            }

            console.log("Run data saved to Firestore:", runData);
        } catch (error) {
            console.error("Error saving run data to Firestore:", error);
        }
    };

    // Function to get smoothed Y value (primary axis for arm movement)
    const getSmoothedY = () => {
        if (recentYValues.current.length === 0) return 0;
        const sum = recentYValues.current.reduce((a, b) => a + b, 0);
        return sum / recentYValues.current.length;
    };

    // Function to get smoothed Z value (secondary axis for validation)
    const getSmoothedZ = () => {
        if (recentZValues.current.length === 0) return 0;
        const sum = recentZValues.current.reduce((a, b) => a + b, 0);
        return sum / recentZValues.current.length;
    };

    // Add new sensor values and maintain limited history
    const addSensorValues = (y: number, z: number) => {
        // Y-axis values (primary for arm movement)
        recentYValues.current.push(y);
        if (recentYValues.current.length > MAX_HISTORY) {
            recentYValues.current.shift();
        }

        // Z-axis values (secondary for validation)
        recentZValues.current.push(z);
        if (recentZValues.current.length > MAX_HISTORY) {
            recentZValues.current.shift();
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

    // Start preparation countdown
    const startPrepCountdown = () => {
        if (prepTime > 0 && !isRunning) {
            setIsRunning(true);
        }
    };

    // Start main countdown when modal is visible
    useEffect(() => {
        if (isStartModalVisible) {
            startMainCountdown();
            // Reset pull-up counter when starting the test
            setPullUpCount(0);
            setPullupState(PullupState.READY);
            setIsFirstCalibration(true);
        }
    }, [isStartModalVisible]);

    const startMainCountdown = () => {
        if (time > 0 && !isStartRunning) {
            setIsStartRunning(true);
            if (isAutoDetectEnabled) {
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

    // Main timer logic
    useEffect(() => {
        if (isStartRunning && time > 0) {
            // Enable pull-up counting when the timer starts
            if (isAutoDetectEnabled) {
                setIsAutoDetectEnabled(true);
            }

            startIntervalRef.current = setInterval(() => {
                setTime(prev => {
                    if (prev === 1) {
                        clearInterval(startIntervalRef.current as NodeJS.Timeout);
                        setIsStartRunning(false);
                        setIsStartModalVisible(false);

                        // Disable pull-up counting when the timer ends
                        setIsCountingActive(false);

                        setTimeout(() => {
                            if (isAutoDetectEnabled) {
                                Speech.stop();
                                Speech.speak("Time's up!");
                                console.log("Times Up");
                                setIsResultModalVisible(true);
                            } else {
                                askForManualInputModal()
                            }
                        }, 700);
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (startIntervalRef.current) clearInterval(startIntervalRef.current);
        };
    }, [isStartRunning]);

    // Accelerometer setup
    useEffect(() => {
        const subscription = Accelerometer.addListener(accelerometerData => {
            setSensorData(accelerometerData);
        });

        Accelerometer.setUpdateInterval(100);

        return () => subscription.remove();
    }, []);

    // Pull-up detection logic - optimized for arm-mounted phone
    useEffect(() => {
        if (!isCountingActive || sensorData.y === undefined || sensorData.z === undefined || !isAutoDetectEnabled) return;

        const now = Date.now();
        const y = sensorData.y;
        const z = sensorData.z;

        addSensorValues(y, z);
        const smoothedY = getSmoothedY();
        const smoothedZ = getSmoothedZ();

        // More forgiving combined acceleration threshold
        const combinedAcceleration = Math.sqrt(smoothedY * smoothedY + smoothedZ * smoothedZ);
        const verticalComponent = smoothedY;

        switch (pullupState) {
            case PullupState.READY:
                // More sensitive upward movement detection
                if (verticalComponent > calibrationValues.upThreshold && combinedAcceleration > 0.3) {
                    setPullupState(PullupState.GOING_UP);
                    setStateTimestamps(prev => ({ ...prev, upStart: now }));
                    console.log("Starting pull-up - going up", verticalComponent);
                }
                break;

            case PullupState.GOING_UP:
                // Ensure minimum time has passed before allowing transition to UP
                const timeInGoingUp = now - stateTimestamps.upStart;

                // More forgiving top position detection with minimum time requirement
                if (timeInGoingUp > 200 && ( // Require at least 200ms in GOING_UP state
                    verticalComponent > calibrationValues.minUpValue ||
                    (verticalComponent > calibrationValues.upThreshold && combinedAcceleration < 0.4))) {
                    setPullupState(PullupState.UP);
                    setStateTimestamps(prev => ({ ...prev, upEnd: now }));
                    console.log("Reached top position", verticalComponent, "after", timeInGoingUp, "ms");
                }
                // More forgiving incomplete rep detection - but only after some time
                else if (timeInGoingUp > 300 && verticalComponent < (calibrationValues.midThreshold - 0.1)) {
                    setPullupState(PullupState.READY);
                    console.log("Incomplete rep - returning to ready after", timeInGoingUp, "ms");
                }
                break;

            case PullupState.UP:
                // Ensure minimum time has passed before allowing transition to GOING_DOWN
                const timeInUp = now - stateTimestamps.upEnd;

                // More sensitive downward movement detection with minimum time requirement
                if (timeInUp > 150 && // Require at least 150ms in UP state
                    verticalComponent < calibrationValues.downThreshold && combinedAcceleration > 0.3) {
                    setPullupState(PullupState.GOING_DOWN);
                    setStateTimestamps(prev => ({ ...prev, downStart: now }));
                    console.log("Starting descent", verticalComponent, "after", timeInUp, "ms at top");
                }
                break;

            case PullupState.GOING_DOWN:
                // Ensure minimum time has passed before allowing transition to DOWN
                const timeInGoingDown = now - stateTimestamps.downStart;

                // More forgiving bottom position detection with minimum time requirement
                if (timeInGoingDown > 200 && ( // Require at least 200ms in GOING_DOWN state
                    verticalComponent < calibrationValues.minDownValue ||
                    (verticalComponent < calibrationValues.downThreshold && combinedAcceleration < 0.4))) {

                    const totalDuration = now - stateTimestamps.upStart;
                    const upDuration = stateTimestamps.upEnd - stateTimestamps.upStart;
                    const downDuration = now - stateTimestamps.downStart;

                    // Much more forgiving validation criteria
                    if (totalDuration >= MIN_PULLUP_TIME &&
                        totalDuration <= MAX_PULLUP_TIME &&
                        upDuration > 200 && // Proper minimum up duration
                        downDuration > 200 && // Proper minimum down duration
                        now - lastCountTime > COOLDOWN_MS) {

                        setPullUpCount(prev => {
                            const newCount = prev + 1;
                            Speech.stop();
                            sayNumber(newCount);
                            return newCount;
                        });
                        setLastCountTime(now);
                        console.log("Pull-up counted!", {
                            total: totalDuration,
                            up: upDuration,
                            down: downDuration,
                            verticalComponent: verticalComponent,
                            combinedAcceleration: combinedAcceleration
                        });
                    } else {
                        // More detailed logging for debugging
                        console.log("Pull-up not counted", {
                            total: totalDuration,
                            up: upDuration,
                            down: downDuration,
                            verticalComponent: verticalComponent,
                            combinedAcceleration: combinedAcceleration,
                            timeSinceLastCount: now - lastCountTime,
                            reason: totalDuration < MIN_PULLUP_TIME ? "too fast" :
                                totalDuration > MAX_PULLUP_TIME ? "too slow" :
                                    upDuration <= 200 ? "up duration too short" :
                                        downDuration <= 200 ? "down duration too short" :
                                            now - lastCountTime <= COOLDOWN_MS ? "cooldown active" : "invalid pattern"
                        });

                        // Only say "Not counted" for timing issues, not for cooldown
                        if (now - lastCountTime > COOLDOWN_MS) {
                            Speech.stop();
                            Speech.speak("Not counted!")
                        }
                    }

                    setPullupState(PullupState.DOWN);
                    setStateTimestamps(prev => ({ ...prev, downEnd: now }));
                }
                break;

            case PullupState.DOWN:
                // Shorter wait time before allowing next rep
                if (now - stateTimestamps.downEnd > 300) { // Reduced from 500ms
                    setPullupState(PullupState.READY);
                    console.log("Ready for next rep");
                }
                break;
        }
    }, [sensorData, isCountingActive, isAutoDetectEnabled, pullupState, stateTimestamps, lastCountTime]);

    const handleEndCountdown = () => {
        Alert.alert(
            'End Countdown',
            'Are you sure you want to end the pull up count?',
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
            backgroundColor: "white"
        }}>
            {/* <View style={{
                backgroundColor: Theme.colors.primaryColor,
                justifyContent: "flex-end",
                gap: 20,
                padding: 20,
                height: "14%",
            }}>
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between"
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
                    }}>PULL-UPS (TEST MODE)</Text>
                    <TouchableOpacity style={{

                    }}
                        onPress={() => {
                            navigation.navigate("PullUpsHistory")
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
            </View> */}
            <View style={styles.shadowWrapper}>
                <View style={styles.headerContainer}>
                    <Svg height="500" width={screenWidth} style={styles.svg}>
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
                    <View style={styles.contentOverlay}>
                        <View style={{
                            alignItems: "center",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            padding: 20,
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
                            }}>PULL UP</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    navigation.navigate("PullUpHistory")
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
                            paddingHorizontal: 20,
                            shadowColor: '#000',
                            shadowOffset: {
                                width: 0,
                                height: 1,
                            },
                            shadowOpacity: 0.6,
                            shadowRadius: 15,
                            // Android shadow
                            elevation: 6,
                            // Ensure shadow doesn't get clipped
                            zIndex: 1,
                        }}>
                            <View style={{
                                backgroundColor: 'white',
                                borderRadius: 10,
                                height: "70%",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                <LottieView
                                    source={require("../../../assets/ExerciseGifs/push-ups.json")}
                                    style={{
                                        height: 150,
                                        width: 150
                                    }}
                                    autoPlay={true}
                                    loop={true}
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </View>
            <View style={{
                padding: 20,
                flex: 1,
                zIndex: 999
            }}>
                <SafeAreaView style={{
                    padding: 20,
                    flex: 1,
                    justifyContent: "space-between"
                }}>
                    <View style={{
                        bottom: 60,
                        gap: 20
                    }}>
                        <View style={{
                            padding: 20,
                            gap: 20,
                            backgroundColor: 'white',
                            borderRadius: 16,
                            justifyContent: "center",
                            // iOS shadow
                            shadowColor: '#000',
                            shadowOffset: {
                                width: 0,
                                height: 10,
                            },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
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
                                Maximum number of pull-ups
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
                                    text="🎯 Minimum Target: This is the minimum number of pull-ups you need to complete to pass the fitness test. Aim to reach or exceed this number!"
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
                                    text="🔄 Auto-Detect Mode: Toggle ON to automatically count pull-ups using face tracking. Toggle OFF to manually input your count at the end of the session."
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
                            padding: 20,
                            gap: 20,
                            backgroundColor: 'white',
                            borderRadius: 16,
                            justifyContent: "center",
                            // iOS shadow
                            shadowColor: '#000',
                            shadowOffset: {
                                width: 0,
                                height: 10,
                            },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
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
                        text="🚀 Start Your Session: Tap to begin your pull-up session. You'll get a 5-second countdown to prepare before the timer starts!"
                    >

                        <TouchableOpacity style={styles.getStartedBtn}
                            onPress={() => {
                                modalToPrepModal();
                            }}
                        >
                            <Text style={{
                                color: "black"
                            }}>GET STARTED</Text>
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
                    setIsPrepModalVisible(false);
                }}
            >
                <View style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(0, 0, 0, 0.5)"
                }}>
                    <View style={{
                        height: 250,
                        width: "70%",
                        backgroundColor: Theme.colors.primaryColor,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 5
                    }}>
                        <View style={{
                            alignItems: "center"
                        }}>
                            <View style={{
                                flexDirection: "row",
                                alignItems: "flex-end",
                            }}>
                                <Text style={{
                                    fontSize: 60,
                                    color: "white",
                                }}>0{prepTime}</Text>
                                <Text style={{
                                    fontSize: 17,
                                    bottom: 10,
                                    color: "white",
                                }}>sec</Text>
                            </View>
                            <Text style={{
                                color: "white"
                            }}>GET READY TO SPRINT</Text>
                        </View>
                    </View>
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
                    <View style={[styles.shadowTopWrapper, {
                        top: 100,
                    }]}>
                        <View style={styles.headerContainer}>
                            <Svg height="500" width={screenWidth} style={styles.svg}>
                                <Defs>
                                    <SvgLinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <Stop offset="0%" stopColor="#FFD700" stopOpacity="1" />
                                        <Stop offset="100%" stopColor="#FFA500" stopOpacity="1" />
                                    </SvgLinearGradient>
                                </Defs>
                                <Path
                                    d={createTopCurvedPath()}
                                    fill="url(#grad)"
                                />
                            </Svg>

                            {/* Content overlay - positioned absolutely to center over SVG */}
                            <View style={styles.contentOverlay}
                            >
                                <View
                                    style={{
                                        height: 300,
                                        width: "100%",
                                        alignSelf: "center",
                                        gap: 20,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderRadius: 15
                                    }}
                                >

                                    <View style={{
                                        height: 150,
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
                                            }}>{pullUpCount}</Text>
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
                                        }}>END PULLUP</Text>
                                        <Image source={require("../../../assets/Icons/fast-forward.png")}
                                            style={{
                                                width: 15,
                                                height: 15,
                                                resizeMode: "contain"
                                            }}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
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
                    <View style={[styles.shadowTopWrapper, {
                        top: 100,
                    }]}>
                        <View style={styles.headerContainer}>
                            <Svg height="500" width={screenWidth} style={styles.svg}>
                                <Defs>
                                    <SvgLinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <Stop offset="0%" stopColor="#FFD700" stopOpacity="1" />
                                        <Stop offset="100%" stopColor="#FFA500" stopOpacity="1" />
                                    </SvgLinearGradient>
                                </Defs>
                                <Path
                                    d={createTopCurvedPath()}
                                    fill="url(#grad)"
                                />
                            </Svg>

                            {/* Content overlay - positioned absolutely to center over SVG */}
                            <View style={styles.contentOverlay}
                            >
                                <View
                                    style={{
                                        height: 300,
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
                                            }}>{pullUpCount}</Text>
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
                                            }}>Correct pull-up</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity style={[, {
                                        width: "70%",
                                        backgroundColor: "rgba(0, 0, 0, 0.3)",
                                        justifyContent: "space-between",
                                        flexDirection: "row",
                                        padding: 20,
                                        borderRadius: 5,
                                        alignItems: "center"
                                    }]}
                                        onPress={() => {
                                            setIsResultModalVisible(false);
                                            navigation.goBack();
                                            setTime(60)
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
                                </View>
                            </View>
                        </View>
                    </View>
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
                    padding: 20
                }}>
                    <View style={{
                        height: 300,
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
                                }}>Input your pull-up count</Text>
                            </View>
                        </View>
                        <TextInput
                            value={pullUpCount === 0 ? "" : pullUpCount.toString()}
                            onChangeText={(text) => setPullUpCount(Number(text))}
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
                                setTime(60)
                                saveRunResultToFirestore();
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
        </View>
    )
}

export default PullUpTestScreen;

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
})