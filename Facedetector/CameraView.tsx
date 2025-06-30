import React, { useEffect, useRef, useState } from "react";
import { Text, View, StyleSheet, Button, TouchableOpacity, Image, ImageBackground, Switch, Modal, SafeAreaView, TextInput } from "react-native";
import { Camera, CameraType } from "expo-camera";
import * as FaceDetector from "expo-face-detector";
import { TourGuideZone, useTourGuideController } from "rn-tourguide";
import * as Speech from "expo-speech";
import { Theme } from "../Components/Branding/Theme";

interface PushUpTrackerIProps {
    navigation: any;
}

const PushUpsScreen = ({
    navigation
}: PushUpTrackerIProps
) => {
    const [hasPermission, setHasPermission] = useState<Boolean | null>(null);
    const [faceData, setFaceData] = useState<any[]>([]);
    const [time, setTime] = useState(60);
    const [prepTime, setPrepTime] = useState(5);
    const [pushUpCount, setPushUpCount] = useState(0);
    const [faceClose, setFaceClose] = useState(false);
    const cameraRef = useRef<Camera>(null);
    const [recordingStarted, setRecordingStarted] = useState<boolean | null>(null);
    const previousY = useRef<number | null>(null);
    const [beginModal, setBeginModal] = useState(false);
    const [showDemoModal, setShowDemoModal] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const countRef = useRef(10);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [countdownFinished, setCountdownFinished] = useState(false);
    const [manualInputModal, setManualInputModal] = useState(false);
    const [mainTimer, setMainTimer] = useState<number | null>(null);
    const mainTimerRef = useRef<NodeJS.Timeout | null>(null);
    const [timerModal, setTimerModal] = useState(false);
    const [autoDetect, setAutoDetect] = useState(false);
    const [sessionActive, setSessionActive] = useState(false);

    const {
        canStart,
        start,
        stop,
        eventEmitter,
    }: any = useTourGuideController();

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

    const resetTimers = () => {
        stopCountdown();
        setSessionActive(false);
        setCountdownFinished(false);
        setPushUpCount(0);
        setMainTimer(null);
        setFaceData([]);
        setCountdown(null);
        setCountdownFinished(false);
        setMainTimer(null);
        if (mainTimerRef.current) {
            clearTimeout(mainTimerRef.current);
            mainTimerRef.current = null;
        }
    };

    const startCountdown = () => {
        countRef.current = 10;
        setCountdown(10);
        setCountdownFinished(false);

        const speakAndCount = () => {
            Speech.speak(String(countRef.current), {
                rate: 0.9,
                onDone: () => {
                    countRef.current--;
                    setCountdown(countRef.current);

                    if (countRef.current > 0) {
                        timeoutRef.current = setTimeout(speakAndCount, 800);
                    } else {
                        Speech.speak("Begin!", {
                            rate: 0.9,
                            onDone: () => {
                                setCountdownFinished(true);
                                setBeginModal(false);

                                setTimeout(() => {
                                    setSessionActive(true);
                                    startMainTimer(time);
                                }, 100);
                            }
                        });
                    }

                },
            });
        };

        speakAndCount();
    }

    const stopMainTimer = () => {
        if (mainTimerRef.current) {
            clearTimeout(mainTimerRef.current);
            mainTimerRef.current = null;
        }
    };

    const endSession = () => {
        setSessionActive(false);
        stopMainTimer();
        resetTimers();
        if (!autoDetect) {
            setManualInputModal(true);
        }
    }

    const startMainTimer = (duration: number) => {
        let remaining = duration;
        setMainTimer(remaining);

        const tick = () => {
            remaining--;
            setMainTimer(remaining);
            if (remaining > 0) {
                mainTimerRef.current = setTimeout(tick, 1000);
            } else {
                if (!autoDetect) {
                    setManualInputModal(true);
                }
            }
        };

        tick();
    };

    const stopCountdown = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        Speech.stop();
    }

    const startRecording = async () => {
        if (cameraRef.current) {
            try {
                setRecordingStarted(true);
                const video = await cameraRef.current.recordAsync();
                console.log("Recording Saved at: ", video.uri);

            } catch (error: any) {
                console.error("Recording failed: ", error)
            } finally {
                setRecordingStarted(false);
            }
        }
    }

    const stopRecording = async () => {
        if (cameraRef.current) {
            try {
                await cameraRef.current.stopRecording();
            } catch (error: any) {
                console.error("Error stopping recording: ", error)
            }
        }
    }

    const handleFaceDetected = ({ faces }: any) => {
        if (!countdownFinished) return;

        setFaceData(faces); // ✅ Always update face data for UI

        if (faces.length === 0) return;

        const face = faces[0];
        const faceSize = face.bounds.size.height;

        if (!recordingStarted) {
            setRecordingStarted(true);
            startRecording();
        }

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
        <ImageBackground
            style={styles.container}
            source={require("../assets/BackgroundImages/Background.png")}
        >
            <SafeAreaView style={{
                flex: 1
            }}>
                <View style={styles.topBar}>
                    <TouchableOpacity
                        onPress={() => {
                            navigation.goBack();
                            resetTimers();
                        }}
                    >
                        <Image source={require("../assets/downloadedIcons/back1.png")}
                            style={{
                                width: 20,
                                height: 20
                            }}
                        />
                    </TouchableOpacity>
                    <Text style={{

                    }}>PULL-UPS (TEST MODE)</Text>
                    <TouchableOpacity style={{

                    }}
                        onPress={() => {
                            navigation.navigate("PullUpsHistory")
                        }}
                    >
                        <Image source={require("../assets/downloadedIcons/notification.png")}
                            style={{
                                height: 30,
                                width: 30,
                                resizeMode: "contain"
                            }}
                        />
                    </TouchableOpacity>
                </View>
                <Camera
                    type={CameraType.front}
                    style={styles.camera}
                    onFacesDetected={handleFaceDetected}
                    faceDetectorSettings={{
                        mode: FaceDetector.FaceDetectorMode.fast,
                        detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
                        runClassification: FaceDetector.FaceDetectorClassifications.none,
                        minDetectionInterval: 100,
                        tracking: true
                    }}
                >
                    {faceData.length === 0 && (
                        <Text style={styles.statusText}>No face detected!</Text>
                    )}
                    {recordingStarted && (
                        <View style={styles.recordingIndicator}>
                            <Text style={styles.recordingText}>●</Text>
                        </View>
                    )}
                </Camera>
                <View style={{
                    flex: 1,
                }}>
                    <View style={{
                        top: "10%",
                        flex: 1,
                        paddingBottom: 50,
                        justifyContent: "space-between"
                    }}>
                        <View style={{
                            gap: 20
                        }}>

                            <TourGuideZone
                                zone={1}
                                shape="circle"
                                text="Here is a quick tour guide of how the push up procedure works."
                            >
                                <Text style={{
                                    alignSelf: "center",
                                    fontWeight: "200"
                                }}>
                                    Maximum number of sit-ups in one minute
                                </Text>
                            </TourGuideZone>
                            <View style={{
                                paddingHorizontal: 0,
                                alignItems: "center",
                                borderRadius: 25,
                                flexDirection: "row",
                                justifyContent: "space-between",
                            }}>
                                <TourGuideZone
                                    zone={4}
                                    shape="rectangle"
                                    text="You have a minimum push-ups of 38 reps to pass."
                                >
                                    <View style={{
                                        alignItems: "center"
                                    }}>
                                        <Text style={{
                                            fontSize: 25,
                                        }}>
                                            38
                                        </Text>
                                        <Text style={{
                                            fontSize: 10,
                                            fontWeight: "200"
                                        }}>MINIMUM</Text>
                                    </View>
                                </TourGuideZone>
                                <TourGuideZone
                                    zone={3}
                                    shape="rectangle"
                                    text="You have a start timer of 1 minute to finish the minimum reps."
                                    tooltipBottomOffset={70}
                                >
                                    <View style={{
                                        backgroundColor: "white",
                                        alignItems: "center",
                                        padding: 5,
                                        gap: 5,
                                        justifyContent: "center",
                                        flexDirection: "row"
                                    }}>
                                        <TourGuideZone
                                            zone={5}
                                            text="click here to decrease the push-up time."
                                            shape="rectangle"
                                        >
                                            <TouchableOpacity style={{
                                                height: 30,
                                                width: 30,
                                                justifyContent: "center",
                                                alignItems: "center",
                                                backgroundColor: "black"
                                            }}
                                                onPress={() => {
                                                    decreaseTime();
                                                }}>
                                                <Text style={{
                                                    color: "white",
                                                    fontSize: 20
                                                }}>-</Text>
                                            </TouchableOpacity>
                                        </TourGuideZone>
                                        <Text style={{
                                            fontSize: 17
                                        }}>{formatTime(time)}</Text>
                                        <TourGuideZone
                                            zone={6}
                                            shape="rectangle"
                                            text="click here to increase the push-up time."
                                        >
                                            <TouchableOpacity
                                                style={{
                                                    height: 30,
                                                    width: 30,
                                                    alignItems: "center",
                                                    backgroundColor: "black"
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
                                </TourGuideZone>
                                <TourGuideZone
                                    zone={2}
                                    shape="rectangle"
                                    text="Toggle switch to auto-detect push-ups reps."
                                >
                                    <View style={{
                                        alignItems: "center"
                                    }}>
                                        <Switch
                                            value={autoDetect}
                                            onValueChange={(value) => setAutoDetect(value)}
                                        />
                                        <Text style={{
                                            fontSize: 10,
                                            fontWeight: "200"
                                        }}>AUTO DETECT</Text>
                                    </View>
                                </TourGuideZone>
                            </View>
                            <View style={styles.overlay}>
                                <View style={{
                                    alignItems: "center",
                                    gap: 0
                                }}>
                                    <TouchableOpacity onPress={() => {
                                        setShowDemoModal(true)
                                    }}
                                        style={{
                                            justifyContent: "center",
                                            alignItems: "center"
                                        }}
                                    >
                                        <Image
                                            style={{
                                                height: 30,
                                                width: 40,
                                                resizeMode: "contain"
                                            }}
                                            source={require("../assets/Icons/sit-up.png")}
                                        />
                                        <Text style={{
                                            fontSize: 15
                                        }}>View Demo</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.countText}>{pushUpCount}</Text>
                                    {countdownFinished && mainTimer !== null && (
                                        <View style={{
                                            alignItems: "center"
                                        }}>
                                            <Text style={{
                                                fontSize: 13,
                                                color: "black"
                                            }}>Time left</Text>
                                            <Text style={{
                                                fontWeight: "700",
                                                color: "white",
                                                fontSize: 30
                                            }}>{mainTimer !== null ? formatTime(mainTimer) : formatTime(time)}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>
                    </View>
                    <TourGuideZone
                        zone={7}
                        shape="rectangle"
                        text="Begin push up count you'll be given a preparation time of 10 seconds get ready."
                        style={{
                            bottom: 10,
                        }}
                    >
                        <View style={{
                        }}>
                            <TouchableOpacity style={{
                                backgroundColor: sessionActive ? "red" : "white",
                                justifyContent: "space-between",
                                flexDirection: "row",
                                alignItems: "center",
                                padding: 20,
                                borderRadius: 5
                            }}
                                onPress={() => {
                                    if (!sessionActive) {
                                        startCountdown();
                                        setTimerModal(true);
                                        setBeginModal(true)
                                    } else {
                                        endSession();
                                    }
                                }}
                            >
                                <Text style={{
                                    color: sessionActive ? "white" : "black"
                                }}>{sessionActive ? "END" : "BEGIN"}</Text>
                                <Image source={require("../assets/BackgroundImages/VectorRight.png")}
                                    style={{
                                        height: 20,
                                        width: 20
                                    }}
                                />
                            </TouchableOpacity>
                        </View>
                    </TourGuideZone>
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
                            justifyContent: "center",
                            alignItems: "center"
                        }}>
                            <View
                                style={{
                                    height: "20%",
                                    width: "50%",
                                    backgroundColor: "white",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    borderRadius: 10,
                                    borderTopLeftRadius: 10,
                                    gap: 10,
                                    padding: 20
                                }}
                            >
                                <TouchableOpacity style={{
                                    position: "absolute",
                                    top: 10,
                                    right: 10,
                                    height: 30,
                                    width: 30,
                                    borderRadius: 15,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    backgroundColor: "black"
                                }}
                                    onPress={() => {
                                        stopCountdown();
                                        setBeginModal(false);
                                        setCountdownFinished(false);
                                        resetTimers();
                                    }}>
                                    <Text style={{
                                        color: "white"
                                    }}>X</Text>
                                </TouchableOpacity>
                                <View>
                                    {countdown !== null && (
                                        <Text style={styles.countdownText}>{countdown > 0 ? countdown : "Begin!"}</Text>
                                    )}
                                </View>
                            </View>
                        </View>
                    </Modal>
                    <Modal
                        visible={showDemoModal}
                        animationType="slide"
                        transparent={true}
                        onRequestClose={() => {
                            setShowDemoModal(showDemoModal);
                        }}
                    >
                        <View style={{
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center"
                        }}>
                            <View
                                style={{
                                    height: "40%",
                                    width: "90%",
                                    backgroundColor: "white",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    borderRadius: 10,
                                    borderTopLeftRadius: 10,
                                    gap: 10,
                                    padding: 20
                                }}
                            >
                                <TouchableOpacity style={{
                                    position: "absolute",
                                    top: 10,
                                    right: 10,
                                    height: 30,
                                    width: 30,
                                    borderRadius: 15,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    backgroundColor: "black"
                                }}
                                    onPress={() => {
                                        setShowDemoModal(false);
                                    }}>
                                    <Text style={{
                                        color: "white"
                                    }}>X</Text>
                                </TouchableOpacity>
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
                                    onPress={() => {
                                        setManualInputModal(false);
                                        setPrepTime(5);
                                        setTime(60);
                                        resetTimers();
                                    }}
                                >
                                    <Text style={{
                                        color: "white"
                                    }}>SUBMIT</Text>
                                    <Image source={require("../assets/downloadedIcons/fast.png")}
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
            </SafeAreaView>
        </ImageBackground>
    );
}

export default PushUpsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: Theme.colors.backgroundColor,
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
        color: "#333",
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
});
