import React, { useEffect, useRef, useState } from "react";
import { Text, View, StyleSheet, Button, TouchableOpacity, Image, ImageBackground, Modal, SafeAreaView, TextInput, Dimensions, Alert, ActivityIndicator, StatusBar } from "react-native";
import { Camera, CameraType } from "expo-camera";
import * as FaceDetector from "expo-face-detector";
import { TourGuideZone, useTourGuideController } from "rn-tourguide";
import * as Speech from "expo-speech";
import LottieView from "lottie-react-native";
import { Switch } from "react-native-paper";
import { addDoc, collection, doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../../Firebase/Settings";
import { Theme } from "../../Branding/Theme";
import { LinearGradient } from "expo-linear-gradient";

interface PushUpTrackerIProps {
    navigation: any;
}

const { width: screenWidth } = Dimensions.get('window');

const PushUpsScreen = ({
    navigation
}: PushUpTrackerIProps
) => {
    const [hasPermission, setHasPermission] = useState<Boolean | null>(null);
    const [faceData, setFaceData] = useState<any[]>([]);
    const [time, setTime] = useState(60);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [prepTime, setPrepTime] = useState(5);
    const [pushUpCount, setPushUpCount] = useState(0);
    const [faceClose, setFaceClose] = useState(false);
    const cameraRef = useRef<Camera>(null);
    const [recordingStarted, setRecordingStarted] = useState<boolean | null>(null);
    const previousY = useRef<number | null>(null);
    const [beginModal, setBeginModal] = useState(false);
    const [isStartModalVisible, setIsStartModalVisible] = useState(false);
    const [showDemoModal, setShowDemoModal] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const countRef = useRef(5);
    const [isResultModalVisible, setIsResultModalVisible] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [countdownFinished, setCountdownFinished] = useState(false);
    const [manualInputModal, setManualInputModal] = useState(false);
    const [mainTimer, setMainTimer] = useState<number | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const mainTimerRef = useRef<NodeJS.Timeout | null>(null);
    const [videoUri, setVideoUri] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [timerModal, setTimerModal] = useState(false);
    const [autoDetect, setAutoDetect] = useState(false);
    const [manualInputValue, setManualInputValue] = useState('');
    const [sessionActive, setSessionActive] = useState(false);
    const [showManualInputModal, setShowManualInputModal] = useState(false)
    const {
        canStart,
        start,
        stop,
        eventEmitter,
    }: any = useTourGuideController();
    const [isCountdownActive, setIsCountdownActive] = useState(false);
    const [speechEnabled, setSpeechEnabled] = useState(true);
    const [lastAnnouncedCount, setLastAnnouncedCount] = useState(0);
    const startIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);


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

    React.useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");
        })();
    }, []);

    if (hasPermission === false) {
        return (
            <View>
                <Text>
                    No access to camera
                </Text>
            </View>
        )
    }

    const speakText = (text: string, options = {}) => {
        if (!speechEnabled) return;

        const defaultOptions = {
            rate: 0.8,
            pitch: 1.0,
            volume: 1.0,
            ...options
        };

        Speech.speak(text, defaultOptions);
    };

    const stopSpeech = () => {
        Speech.stop();
    };

    useEffect(() => {
        return () => {
            resetTimers();
            // Additional cleanup for countdown timer
            if (countdownTimerRef.current) {
                clearTimeout(countdownTimerRef.current);
                countdownTimerRef.current = null;
            }
        };
    }, []);
    useEffect(() => {
        if (countdown !== null && countdown > 0) {
            // Announce countdown numbers
            if (countdown <= 5) {
                if (countdown === 5) {
                    // Don't announce 5, just start counting
                } else {
                    speakText(countdown.toString());
                }
            }

            // Store the timer reference so we can clear it
            countdownTimerRef.current = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);

            // Cleanup function to clear the timer
            return () => {
                if (countdownTimerRef.current) {
                    clearTimeout(countdownTimerRef.current);
                    countdownTimerRef.current = null;
                }
            };
        } else if (countdown === 0) {
            // Countdown finished, start the main session
            speakText("Begin!");

            setBeginModal(false);
            setIsStartModalVisible(true);
            setSessionActive(true);
            setCountdownFinished(true);
            setCountdown(null);

            // Start the main timer
            setMainTimer(time);
            mainTimerRef.current = setInterval(() => {
                setMainTimer((prevTime) => {
                    if (prevTime && prevTime > 0) {
                        // Announce time milestones
                        if (prevTime === 30) {
                            speakText("30 seconds remaining!");
                        } else if (prevTime === 10) {
                            speakText("10 seconds left!");
                        } else if (prevTime <= 5 && prevTime > 0) {
                            speakText(prevTime.toString());
                        }

                        return prevTime - 1;
                    } else {
                        // Timer finished
                        speakText("Time's up! Great job!");

                        if (mainTimerRef.current) {
                            clearInterval(mainTimerRef.current);
                            mainTimerRef.current = null;
                        }
                        setIsStartModalVisible(false);

                        // Show appropriate modal based on mode
                        setTimeout(() => {
                            if (autoDetect) {
                                setIsResultModalVisible(true);
                            } else {
                                setManualInputModal(true);
                            }
                        }, 300);

                        return 0;
                    }
                });
            }, 1000);
        }
    }, [countdown, time, autoDetect, speechEnabled]);

    // Function to handle closing the countdown modal
    const handleCloseCountdownModal = () => {
        // Clear the countdown timer
        if (countdownTimerRef.current) {
            clearTimeout(countdownTimerRef.current);
            countdownTimerRef.current = null;
        }

        // Stop speech
        stopSpeech();

        // Reset countdown state
        setCountdown(null);
        setBeginModal(false);
        setCountdownFinished(false);
        setSessionActive(false);

        // Reset other related states
        setPushUpCount(0);
        setFaceData([]);
        setFaceClose(false);
        previousY.current = null;
        setLastAnnouncedCount(0);

        console.log("Countdown timer cancelled");
    };

    // Updated resetTimers function to include countdown cleanup
    const resetTimers = () => {
        setSessionActive(false);
        setPushUpCount(0);
        setMainTimer(null);
        setFaceData([]);
        stopSpeech();
        setFaceClose(false);
        setLastAnnouncedCount(0);
        previousY.current = null;

        // Clear countdown timer
        if (countdownTimerRef.current) {
            clearTimeout(countdownTimerRef.current);
            countdownTimerRef.current = null;
        }

        // Reset countdown state
        setCountdown(null);
        setCountdownFinished(false);

        // Clear all other timers
        if (mainTimerRef.current) {
            clearInterval(mainTimerRef.current);
            mainTimerRef.current = null;
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (startIntervalRef.current) {
            clearInterval(startIntervalRef.current);
            startIntervalRef.current = null;
        }
    };

    useEffect(() => {
        if (pushUpCount > lastAnnouncedCount && pushUpCount > 0) {

            if (pushUpCount === 10) {
                setTimeout(() => speakText("Great job! Keep going!"), 1000);
            } else if (pushUpCount === 25) {
                setTimeout(() => speakText("You're doing amazing!"), 1000);
            } else if (pushUpCount === 38) {
                setTimeout(() => speakText("Excellent! You've reached the tactical standard!"), 1000);
            } else if (pushUpCount === 50) {
                setTimeout(() => speakText("Outstanding! Fifty push-ups!"), 1000);
            }

            setLastAnnouncedCount(pushUpCount);
        }
    }, [pushUpCount, lastAnnouncedCount, speechEnabled]);

    const handleEndCountdown = () => {
        Alert.alert(
            'End Countdown',
            'Are you sure you want to end the push up count?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'End',
                    onPress: async () => {
                        try {
                            // Stop all timers and intervals
                            if (startIntervalRef.current) {
                                clearInterval(startIntervalRef.current);
                                startIntervalRef.current = null;
                            }
                            if (mainTimerRef.current) {
                                clearInterval(mainTimerRef.current);
                                mainTimerRef.current = null;
                            }


                            // Stop speech and face detection
                            Speech.stop();
                            setCountdownFinished(false);
                            setSessionActive(false);

                            // Close session modal
                            setIsStartModalVisible(false);

                            // Reset timer
                            setTime(60);
                            setMainTimer(null);

                            // Show result modal after delay

                            speakText(`Session ended! You completed ${pushUpCount} push-ups!`);

                            setTimeout(() => {
                                if (autoDetect) {
                                    setIsResultModalVisible(true);
                                } else {
                                    setManualInputModal(true);
                                }
                            }, 300);
                        } catch (error) {
                            console.error("Error in handleEndCountdown:", error);
                        }
                    },
                    style: 'destructive'
                },
            ],
            { cancelable: true }
        );
    };

    const handleBeginPress = () => {
        setBeginModal(true);
        setCountdown(5); // Start 5-second countdown
        setPushUpCount(0); // Reset count
        setFaceData([]); // Reset face data
        setFaceClose(false); // Reset face close state
        previousY.current = null; // Reset previous Y position
        setLastAnnouncedCount(0); // Reset speech counter
    };

    const handleSubmitResult = async () => {
        // Prevent multiple submissions
        if (isUploading) {
            return;
        }

        // Set uploading state to true immediately
        setIsUploading(true);

        const user = auth.currentUser;

        if (!user) {
            console.warn("No user signed in");
            setIsUploading(false);
            return;
        }

        const userDetailsRef = doc(db, "UserDetails", user.uid);
        const pushUpDocRef = doc(db, `UserDetails/${user.uid}/PushUps/${Date.now()}`);
        console.log("Attempting to save push-up session to path:", pushUpDocRef);

        const TacticalPoints = pushUpCount >= 38 ? 5 : 0;

        const sessionData = {
            uid: user.uid,
            pushUpCount: pushUpCount,
            duration: time,
            timestamp: new Date().toISOString(),
            mode: autoDetect ? 'auto' : 'manual',
            TacticalPoints: TacticalPoints
        };

        try {
            await setDoc(pushUpDocRef, sessionData);

            // 2. Fetch current personal best
            const userDoc = await getDoc(userDetailsRef);
            const existingData = userDoc.exists() ? userDoc.data().personalBests || {} : {};
            const currentPushUpBest = existingData.pushUps || 0;
            const userData = userDoc.exists() ? userDoc.data() : {};
            const currentTotal = userData.TacticalPoints || 0;

            await setDoc(userDetailsRef, {
                TacticalPoints: currentTotal + TacticalPoints
            }, { merge: true });

            // Update personal bests if new value is higher
            if (pushUpCount > currentPushUpBest) {
                await setDoc(userDetailsRef, {
                    personalBests: {
                        ...existingData,
                        pushUps: pushUpCount // Only update pushUps, keep others unchanged
                    }
                }, { merge: true });
            }

            console.log("Push-up session data saved to Firestore:", sessionData);

            // Reset and navigate after successful save
            resetTimers();
            setIsResultModalVisible(false);
            setManualInputModal(false); // Close manual input modal too
            navigation.goBack();
            setTime(60);
            setVideoUri(null);

            // Show success message
            Alert.alert('Success', 'Your push-up session has been saved!');

        } catch (error) {
            console.error("Error saving push-up session data to Firestore:", error);
            Alert.alert('Error', 'Failed to submit result. Please try again.');
        } finally {
            // Always reset uploading state
            setIsUploading(false);
        }
    };

    const handleFaceDetected = ({ faces }: any) => {
        if (!countdownFinished || !autoDetect) return;

        setFaceData(faces); // ✅ Always update face data for UI

        if (faces.length === 0) return;

        const face = faces[0];
        const faceSize = face.bounds.size.height;

        // Push-up logic
        if (previousY.current !== null) {
            if (faceSize < 200 && !faceClose) {
                setFaceClose(true);
            }

            if (faceSize > 250 && faceClose) {
                setFaceClose(false); // Push-up completed
                setPushUpCount((count) => count + 1);
            }
        }

        previousY.current = faceSize;
    };

    const formatTime = (seconds: number) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
    }

    const increaseTime = () => setTime(prev => prev + 10);
    const decreaseTime = () => setTime(prev => (prev > 10 ? prev - 10 : 0));

    const toggleSpeech = () => {
        setSpeechEnabled(!speechEnabled);
        if (!speechEnabled) {
            speakText("Speech enabled");
        } else {
            stopSpeech();
        }
    };

    return (
        <View
            style={[styles.container, {
            }]}
        >
            <View style={{
                height: "40%",
            }}>
                <LinearGradient
                    colors={['#FFD700', '#FFA500']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                        flex: 1,
                        paddingTop: 50
                    }}
                >
                    <View style={{
                        flexDirection: "row",
                        paddingHorizontal: 20,
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
                        }}>PUSH UPS</Text>
                        <TouchableOpacity
                            onPress={() => {
                                navigation.navigate("PushUpHistory")
                            }}
                        >
                            <Image
                                source={require("../../../assets/downloadedIcons/notification.png")}
                                style={{
                                    height: 30,
                                    width: 30,
                                    resizeMode: "contain"
                                }}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1, padding: 20 }}>
                        <View style={{
                            flex: 1,
                            borderRadius: 10,
                            overflow: "hidden"
                        }}>
                            <Camera
                                type={CameraType.front}
                                style={{ flex: 1 }}
                                onFacesDetected={handleFaceDetected}
                                faceDetectorSettings={{
                                    mode: FaceDetector.FaceDetectorMode.fast,
                                    detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
                                    runClassification: FaceDetector.FaceDetectorClassifications.none,
                                    minDetectionInterval: 100,
                                    tracking: true,
                                }}
                            >
                                {recordingStarted && (
                                    <View style={styles.recordingIndicator}>
                                        <Text style={styles.recordingText}>●</Text>
                                    </View>
                                )}
                            </Camera>
                        </View>
                    </View>
                </LinearGradient>
            </View>
            <View style={{
                flex: 1,
            }}>
                <View style={{
                    flex: 1,
                    paddingBottom: 20,
                    justifyContent: "space-between"
                }}>

                    <SafeAreaView style={{
                        padding: 20,
                        flex: 1,
                    }}>
                        <View style={{
                            padding: 20,
                            flex: 1,
                            justifyContent: "space-between"
                        }}>
                            <View style={{
                                gap: 20,
                            }}>
                                <View style={{
                                    padding: 20,
                                    gap: 20,
                                    backgroundColor: 'white',
                                    borderRadius: 16,
                                    justifyContent: "center",
                                    shadowColor: '#000',
                                    shadowOffset: {
                                        width: 0,
                                        height: 10,
                                    },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 8,
                                }}>
                                    <Text style={{
                                        alignSelf: "center",
                                        fontWeight: "400",
                                        textAlign: "center",
                                        fontSize: 14
                                    }}>
                                        Target Push-Up Count
                                    </Text>
                                    <View style={{
                                        paddingHorizontal: 10,
                                        alignItems: "center",
                                        borderRadius: 25,
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                    }}>
                                        <View style={{
                                            alignItems: "center",
                                            gap: 10
                                        }}>
                                            <Switch
                                                value={speechEnabled}
                                                onValueChange={toggleSpeech}
                                                color={"#FA812890"}
                                            />
                                            <Text style={{
                                                fontWeight: "400",
                                                fontSize: 10
                                            }}>Enable speech</Text>
                                        </View>
                                        <TourGuideZone
                                            zone={2}
                                            shape="rectangle"
                                            text="🎯 Minimum Target: This is the minimum number of push-ups you need to complete to pass the fitness test. Aim to reach or exceed this number!"
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
                                            zone={3}
                                            shape="rectangle"
                                            text="🔄 Auto-Detect Mode: Toggle ON to automatically count push-ups using face tracking. Toggle OFF to manually input your count at the end of the session."
                                        >
                                            <View style={{
                                                alignItems: "center",
                                                gap: 10
                                            }}>
                                                <Switch
                                                    color={"#FA812890"}
                                                    value={autoDetect}
                                                    onValueChange={(value) => setAutoDetect(value)}
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
                                    shadowColor: '#000',
                                    shadowOffset: {
                                        width: 0,
                                        height: 10,
                                    },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 8,
                                }}>
                                    <Text style={{
                                        alignSelf: "center",
                                        fontWeight: "400",
                                        textAlign: "center",
                                        fontSize: 14
                                    }}>
                                        Session Duration
                                    </Text>
                                    <View style={{
                                        paddingHorizontal: 10,
                                        alignItems: "center",
                                        borderRadius: 25,
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                    }}>
                                        <TourGuideZone
                                            zone={4}
                                            shape="circle"
                                            text="➖ Decrease Time: Tap to reduce the session duration by 10 seconds. Minimum duration is 10 seconds."
                                        >
                                            <TouchableOpacity
                                                style={{
                                                    height: 30,
                                                    width: 30,
                                                    alignItems: "center",
                                                    backgroundColor: "#FA812890",
                                                    borderRadius: 15,
                                                    justifyContent: "center"
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
                                            zone={5}
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
                                                }}>DURATION</Text>
                                            </View>
                                        </TourGuideZone>
                                        <TourGuideZone
                                            zone={6}
                                            shape="circle"
                                            text="➕ Increase Time: Tap to add 10 seconds to your session duration. Adjust based on your fitness level."
                                        >
                                            <TouchableOpacity
                                                style={{
                                                    height: 30,
                                                    width: 30,
                                                    alignItems: "center",
                                                    backgroundColor: "#FA812890",
                                                    borderRadius: 15,
                                                    justifyContent: "center"
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
                                zone={7}
                                shape="rectangle"
                                text="🚀 Start Your Session: Tap to begin your push-up session. You'll get a 5-second countdown to prepare before the timer starts!"
                            >
                                <View style={{}}>
                                    <TouchableOpacity style={{
                                        backgroundColor: "#FA812890",
                                        justifyContent: "space-between",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        padding: 20,
                                        borderRadius: 5
                                    }}
                                        onPress={() => {
                                            handleBeginPress();
                                        }}
                                    >
                                        <Text style={{
                                            color: "white",
                                            fontWeight: "600"
                                        }}>START PUSH-UPS</Text>
                                        <Image source={require("../../../assets/Icons/fast-forward.png")}
                                            style={{
                                                width: 15,
                                                height: 15,
                                                resizeMode: "contain"
                                            }}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </TourGuideZone>
                        </View>
                    </SafeAreaView>
                </View>
                <Modal
                    visible={beginModal}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={handleCloseCountdownModal}
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
                                height: "30%",
                                width: "100%",
                                justifyContent: "center",
                                alignSelf: "center",
                                alignItems: "center",
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
                                        handleCloseCountdownModal();
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
                                    <View>
                                        {countdown !== null && (
                                            <Text style={styles.countdownText}>{countdown > 0 ? countdown : "Begin!"}</Text>
                                        )}
                                    </View>
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
                                paddingTop: 50,
                                borderBottomRightRadius: 10,
                                alignItems: "center",
                                gap: 20,
                                borderBottomLeftRadius: 10
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
                                        {mainTimer !== null ? formatTime(mainTimer) : formatTime(time)}
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
                                    }}>{pushUpCount}</Text>

                                </View>
                            </View>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                                    padding: 20,
                                    width: "70%",
                                    borderRadius: 5,
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
                                paddingTop: 50,
                                alignItems: "center",
                                gap: 20,
                                borderTopRightRadius: 10,
                                borderTopLeftRadius: 10
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
                                        resetTimers();
                                        setPrepTime(5);
                                        if (intervalRef.current) {
                                            clearInterval(intervalRef.current);
                                            intervalRef.current = null;
                                        }
                                        setTime(60);
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
                                    }}>{pushUpCount}</Text>
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
                                alignItems: "center",
                                opacity: isUploading ? 0.6 : 1
                            }}
                                onPress={handleSubmitResult}
                                disabled={isUploading}
                                activeOpacity={isUploading ? 1 : 0.7}
                            >
                                <Text style={{
                                    color: "white"
                                }}>{isUploading ? 'UPLOADING...' : 'SUBMIT'}</Text>
                                {isUploading ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <Image source={require("../../../assets/downloadedIcons/fast.png")}
                                        style={{
                                            width: 25,
                                            height: 25,
                                            resizeMode: "contain"
                                        }}
                                    />
                                )}
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                </Modal>
                <Modal
                    visible={manualInputModal}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => {
                        setManualInputModal(false);
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
                                value={pushUpCount === 0 ? "" : pushUpCount.toString()}
                                onChangeText={(text) => setPushUpCount(Number(text) || 0)}
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
                            <TouchableOpacity
                                style={[styles.getStartedBtn, {
                                    backgroundColor: "#FA812890",
                                    opacity: (isUploading || !pushUpCount) ? 0.6 : 1,
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }]}
                                onPress={handleSubmitResult}
                                disabled={isUploading || !pushUpCount}
                                activeOpacity={(isUploading || !pushUpCount) ? 1 : 0.7}
                            >
                                <Text style={{
                                    color: "white",
                                    fontWeight: "600"
                                }}>
                                    {isUploading ? 'UPLOADING...' : 'SUBMIT'}
                                </Text>
                                {isUploading ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <Image source={require("../../../assets/downloadedIcons/fast.png")}
                                        style={{
                                            height: 24,
                                            width: 24
                                        }}
                                    />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </View>
    );
}

export default PushUpsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    camera: {
        height: "30%",
        top: "3%",
        width: "100%",
        borderRadius: 10,
        overflow: "hidden",
    },
    overlay: {
        marginTop: 20,
        padding: 16,
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.6)",
        borderRadius: 12,
        marginHorizontal: 20,
    },
    countText: {
        fontSize: 60,
        fontWeight: "bold",
        color: "white",
        marginBottom: 8,
    },
    statusText: {
        fontSize: 16,
        color: "red",
        backgroundColor: "white",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 5,
    },
    recordingIndicator: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "red",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        zIndex: 10,
    },
    recordingText: {
        color: "white",
        fontSize: 12,
        fontWeight: "bold",
    },
    topBar: {
        marginTop: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    topBarIcon: {
        width: 24,
        height: 24,
        tintColor: "#000",
    },
    titleText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    timerRow: {
        flexDirection: "row",
        backgroundColor: "white",
        borderRadius: 8,
        padding: 10,
        alignItems: "center",
        justifyContent: "space-around",
        marginVertical: 10,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
    },
    timerBtn: {
        backgroundColor: "black",
        borderRadius: 6,
        width: 32,
        height: 32,
        alignItems: "center",
        justifyContent: "center",
    },
    timerBtnText: {
        color: "white",
        fontSize: 18,
    },
    startEndButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Theme.colors.primaryColor,
        padding: 16,
        margin: 20,
        borderRadius: 12,
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 5,
    },
    startEndText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
        marginRight: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
        padding: 24,
    },
    modalContent: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 24,
        alignItems: "center",
        justifyContent: "center",
    },
    modalCloseBtn: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "black",
        borderRadius: 15,
        width: 30,
        height: 30,
        alignItems: "center",
        justifyContent: "center",
    },
    countdownText: {
        fontSize: 48,
        fontWeight: "bold",
        color: "white",
    },
    inputField: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        width: "50%",
        padding: 12,
        fontSize: 16,
        backgroundColor: "#f9f9f9",
        color: "#000",
        marginBottom: 20,
        textAlign: "center",
    },
    svg: {
        padding: 20,
    },
    shadowWrapper: {
        flex: 1,

    }, getStartedBtn: {
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
});
