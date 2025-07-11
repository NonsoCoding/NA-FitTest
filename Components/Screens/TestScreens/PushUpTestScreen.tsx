import React, { useEffect, useRef, useState } from "react";
import { Text, View, StyleSheet, Button, TouchableOpacity, Image, ImageBackground, Modal, SafeAreaView, TextInput, Dimensions, Alert, ActivityIndicator } from "react-native";
import { Camera, CameraType } from "expo-camera";
import * as FaceDetector from "expo-face-detector";
import { TourGuideZone, useTourGuideController } from "rn-tourguide";
import * as Speech from "expo-speech";
import LottieView from "lottie-react-native";
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Switch } from "react-native-paper";
import { addDoc, collection, doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../../Firebase/Settings";
import { Theme } from "../../Branding/Theme";

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
    const startIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isCountdownActiveRef = useRef(false);


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

    const createBottomCurvedPath = () => {
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

    const resetTimers = () => {
        setIsCountdownActive(false); // ✅ Add this line
        stopCountdown();
        setSessionActive(false);
        setCountdownFinished(false);
        setPushUpCount(0);
        setMainTimer(null);
        setFaceData([]);
        setCountdown(null);
        setFaceClose(false);
        previousY.current = null;

        // Clear all timers
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

    const startCountdown = () => {
        countRef.current = 5;
        setCountdown(5);
        setCountdownFinished(false);
        isCountdownActiveRef.current = true;

        const speakAndCount = () => {
            if (!isCountdownActiveRef.current) return;

            Speech.speak(String(countRef.current), {
                rate: 0.9,
                onDone: () => {
                    if (!isCountdownActiveRef.current) return;

                    countRef.current--;
                    setCountdown(countRef.current);

                    if (countRef.current > 0) {
                        timeoutRef.current = setTimeout(speakAndCount, 800);
                    } else {
                        Speech.speak("Begin!", {
                            rate: 0.9,
                            onDone: () => {
                                if (!isCountdownActiveRef.current) return;

                                setCountdownFinished(true);
                                setBeginModal(false);
                                isCountdownActiveRef.current = false;

                                setTimeout(() => {
                                    setSessionActive(true);
                                    startMainTimer(time);
                                }, 500);
                            }
                        });
                    }
                },
            });
        };

        speakAndCount();
    };


    const stopMainTimer = () => {
        if (mainTimerRef.current) {
            clearTimeout(mainTimerRef.current);
            mainTimerRef.current = null;
        }
    };

    const startMainTimer = (duration: number) => {
        let remaining = duration;
        setMainTimer(remaining);
        setIsStartModalVisible(true);

        const tick = async () => {
            remaining--;
            setMainTimer(remaining);

            if (remaining > 0) {
                mainTimerRef.current = setTimeout(tick, 1000);
            } else {
                setSessionActive(false);
                setCountdownFinished(false);
                stopMainTimer();
                setIsStartModalVisible(false);

                setTimeout(() => {
                    if (autoDetect) {
                        setIsResultModalVisible(true);
                    } else {
                        setManualInputModal(true);
                    }
                }, 500);
            }
        };

        mainTimerRef.current = setTimeout(tick, 1000);
    };



    const stopCountdown = () => {
        setIsCountdownActive(false); // ✅ Mark countdown as inactive first

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        Speech.stop();

        setCountdown(null);
        countRef.current = 5;
    };

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
        startCountdown();

    };

    useEffect(() => {
        return () => {
            resetTimers();
        };
    }, []);

    const handleSubmitResult = async () => {
        const user = auth.currentUser;

        if (!user) {
            console.warn("No user signed in");
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
            navigation.goBack();
            setTime(60);
            setVideoUri(null);
        } catch (error) {
            console.error("Error saving push-up session data to Firestore:", error);
            Alert.alert('Error', 'Failed to submit result. Please try again.');
        } finally {
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

    return (
        <View
            style={[styles.container, {
                backgroundColor: "white"
            }]}
        >
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
                            d={createBottomCurvedPath()}
                            fill="url(#grad)"
                        />
                    </Svg>

                    {/* Content overlay - positioned absolutely to center over SVG */}
                    <View style={styles.contentOverlay}>
                        <View style={{
                            alignItems: "center",
                            flexDirection: "row",
                            justifyContent: "space-between",
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
                            }}>PUSH UPS</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    navigation.navigate("SitUpHistory")
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
                        <View style={{ alignItems: "center", padding: 10 }}>
                            <TourGuideZone
                                zone={1}
                                shape="rectangle"
                                text="📹 Camera View: Position your face in the center of the camera. The system will track your face movement to count push-ups automatically when auto-detect is enabled."
                            >
                                <View
                                    style={{
                                        width: 350,
                                        height: 200,
                                        borderRadius: 10,
                                        overflow: "hidden",
                                    }}
                                >
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
                            </TourGuideZone>
                        </View>
                    </View>
                </View>
            </View>
            <View style={{
                flex: 1,
                zIndex: 999
            }}>
                <View style={{
                    flex: 1,
                    paddingBottom: 20,
                    justifyContent: "space-between"
                }}>
                    <View style={{
                        gap: 20,
                        flex: 1,
                    }}>
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
                                        shadowColor: '#000',
                                        shadowOffset: {
                                            width: 0,
                                            height: 10,
                                        },
                                        shadowOpacity: 0.3,
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
                                        shadowOpacity: 0.3,
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
                                            <Image source={require("../../../assets/BackgroundImages/VectorRight.png")}
                                                style={{
                                                    height: 20,
                                                    width: 20
                                                }}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </TourGuideZone>
                            </SafeAreaView>
                        </View>
                    </View>
                </View>
                <Modal
                    visible={beginModal}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => {
                        setBeginModal(beginModal);
                    }}
                >
                    <View style={{
                        flex: 1,
                        justifyContent: "flex-end",
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
                                <View style={styles.contentOverlay}>
                                    <View
                                        style={{
                                            height: 300,
                                            width: "100%",
                                            alignSelf: "center",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            borderRadius: 15
                                        }}>
                                        <View style={{
                                            position: "absolute",
                                            top: 0,
                                            right: 0,
                                            paddingHorizontal: 20
                                        }}>
                                            <TouchableOpacity style={{
                                            }}
                                                onPress={() => {
                                                    stopCountdown();
                                                    setBeginModal(false);
                                                    setCountdown(null);
                                                    setCountdownFinished(false);
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
                                    </View>
                                </View>
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
                                <View style={styles.contentOverlay}>
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
                                            alignItems: "center",
                                            opacity: isUploading ? 0.6 : 1
                                        }}
                                            onPress={() => {
                                                handleSubmitResult();
                                            }}
                                            disabled={isUploading}
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
                                    </View>
                                </View>
                            </View>
                        </View>
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
                            <TouchableOpacity style={[styles.getStartedBtn, {
                                backgroundColor: "#FA812890",
                                opacity: isUploading ? 0.6 : 1
                            }]}
                                onPress={() => {
                                    handleSubmitResult();
                                }}
                            >
                                <Text style={{
                                    color: "white"
                                }}>{isUploading ? 'UPLOADING...' : 'SUBMIT'}</Text>
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
    headerContainer: {
        position: 'relative',
        justifyContent: "center",
        backgroundColor: 'transparent'
    },
    contentOverlay: {
        position: 'absolute',
        top: 30,
        left: 0,
        right: 0,
        padding: 20,
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
    shadowTopWrapper: {
        flex: 1,
        justifyContent: "flex-end",

    },
});
