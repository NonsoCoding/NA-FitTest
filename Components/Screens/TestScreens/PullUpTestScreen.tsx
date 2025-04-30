import { Image, ImageBackground, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Theme } from "../../Branding/Theme";
import { useEffect, useRef, useState } from "react";
import { Accelerometer } from "expo-sensors";
import { Switch } from "react-native-paper";


interface ITestProps {
    navigation?: any;
}

enum PullupState {
    READY,       // Starting position, waiting for movement
    GOING_DOWN,  // User is moving downward
    DOWN,        // User is in the down position
    GOING_UP,    // User is moving upward
    UP           // User has completed a rep
}

interface SensorData {
    z?: number;
    x?: number;
    y?: number;
}

const VideoSource = require("../../../assets/ExerciseGifs/pullUps.mp4")

const PullUpTestScreen = ({
    navigation
}: ITestProps) => {

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isPrepModalVisible, setIsPrepModalVisible] = useState(false);
    const [isStartModalVisible, setIsStartModalVisible] = useState(false);
    const [isResultModalVisible, setIsResultModalVisible] = useState(false);
    const [prepTime, setPrepTime] = useState(5);
    const [isStartRunning, setIsStartRunning] = useState(false);
    const [startTime, setStartTime] = useState(60);
    const [isAutoDetectEnabled, setIsAutoDetectEnabled] = useState(true);
    const [showManualInputModal, setShowManualInputModal] = useState(false);
    const [sensorData, setSensorData] = useState<SensorData>({});
    const [pullUpCount, setPullUpCount] = useState(0);
    const [pullupState, setPullupState] = useState<PullupState>(PullupState.READY);
    const [isFirstCalibration, setIsFirstCalibration] = useState(true);
    const [calibrationValues, setCalibrationValues] = useState({
        downThreshold: -0.3,
        upThreshold: 0.3,
        midThreshold: 0.0
    });
    const [lastCountTime, setLastCountTime] = useState<number>(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isGoingDown, setIsGoingDown] = useState(false);
    const [isCountingActive, setIsCountingActive] = useState(false);

    // const startIntervalRef = useRef<NodeJS.Timeout | null>(null);
    // const intervalRef = useRef<NodeJS.Timeout | null>(null);


    const MIN_PUSHUP_TIME = 500; // Minimum time for a valid push-up (ms)
    const MAX_PUSHUP_TIME = 5000; // Maximum time for a valid push-up (ms)
    const COOLDOWN_MS = 200; // Reduced cooldown for better responsiveness

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
    const MAX_HISTORY = 5;

    // const sitUpsPlayer = useVideoPlayer(VideoSource, (player) => {
    //     player.loop = true;
    //     player.play();
    // });

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
            // Reset push-up counter when starting the test
            setPullUpCount(0);
            setPullupState(PullupState.READY);
            setIsFirstCalibration(true);
        }
    }, [isStartModalVisible]);

    const startMainCountdown = () => {
        if (startTime > 0 && !isStartRunning) {
            setIsStartRunning(true);
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
            intervalRef.current = setInterval(() => {
                setPrepTime(prev => {
                    if (prev === 1) {
                        clearInterval(intervalRef.current as NodeJS.Timeout);
                        setIsRunning(false);
                        setIsPrepModalVisible(false);
                        setTimeout(() => {
                            setIsStartModalVisible(true);
                        }, 700);
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning]);

    // Main timer logic
    useEffect(() => {
        if (isStartRunning && startTime > 0) {
            // Enable push-up counting when the timer starts
            if (isAutoDetectEnabled) {
                setIsAutoDetectEnabled(true);
            }

            startIntervalRef.current = setInterval(() => {
                setStartTime(prev => {
                    if (prev === 1) {
                        clearInterval(startIntervalRef.current as NodeJS.Timeout);
                        setIsStartRunning(false);
                        setIsStartModalVisible(false);

                        // Disable push-up counting when the timer ends
                        setIsCountingActive(false);

                        setTimeout(() => {
                            if (isAutoDetectEnabled) {
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


    useEffect(() => {
        if (!isCountingActive || sensorData.z === undefined || !isAutoDetectEnabled) return;

        const now = Date.now();
        const z = sensorData.z;

        addZValue(z);
        const smoothedZ = getSmoothedZ();

        switch (pullupState) {
            case PullupState.READY:
                if (smoothedZ < calibrationValues.midThreshold) {
                    setPullupState(PullupState.GOING_DOWN); // Pulling down
                    setStateTimestamps(prev => ({ ...prev, downStart: now }));
                    console.log("Pulling down");
                }
                break;

            case PullupState.GOING_DOWN:
                if (smoothedZ < calibrationValues.downThreshold) {
                    setPullupState(PullupState.DOWN);
                    setStateTimestamps(prev => ({ ...prev, downEnd: now }));
                    console.log("Reached bottom");
                }
                break;

            case PullupState.DOWN:
                if (smoothedZ > calibrationValues.midThreshold) {
                    setPullupState(PullupState.GOING_UP);
                    setStateTimestamps(prev => ({ ...prev, upStart: now }));
                    console.log("Pulling up");
                }
                break;

            case PullupState.GOING_UP:
                if (smoothedZ > calibrationValues.upThreshold) {
                    const duration = now - stateTimestamps.downEnd;

                    if (duration >= MIN_PUSHUP_TIME &&
                        duration <= MAX_PUSHUP_TIME &&
                        now - lastCountTime > COOLDOWN_MS) {

                        setPullUpCount(prev => prev + 1);
                        setLastCountTime(now);
                        console.log("Pull-up counted!", duration);
                    }

                    setPullupState(PullupState.UP);
                    setStateTimestamps(prev => ({ ...prev, upEnd: now }));
                }
                break;

            case PullupState.UP:
                if (now - stateTimestamps.upEnd > 300) {
                    setPullupState(PullupState.READY);
                }
                break;
        }
    }, [sensorData, isCountingActive, isAutoDetectEnabled]);


    // const pullUpsPlayer = useVideoPlayer(VideoSource, (player) => {
    //     player.loop = true;
    //     player.play();
    // });

    // const startPrepCountdown = () => {
    //     if (prepTime > 0 && !isRunning) {
    //         setIsRunning(true);
    //     }
    // };

    useEffect(() => {
        if (isStartModalVisible) {
            startMainCountdown();
        }
    }, [isStartModalVisible])

    // const startMainCountdown = () => {
    //     if (startTime > 0 && !isStartRunning) {
    //         setIsStartRunning(true);
    //     }
    // };

    // const modalToPrepModal = () => {
    //     setIsModalVisible(false);
    //     setTimeout(() => {
    //         setIsPrepModalVisible(true);
    //         startPrepCountdown();
    //     }, 700);
    // }


    useEffect(() => {
        const subscription = Accelerometer.addListener(accelerometerData => {
            setSensorData(accelerometerData);
        });

        Accelerometer.setUpdateInterval(100);

        return () => subscription.remove();
    }, []);




    return (
        <View style={{
            flex: 1,
        }}>
            <View style={{
                backgroundColor: Theme.colos.primaryColor,
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
                        <Image source={require("../../../assets/downloadedIcons/back 1.png")}
                            style={{
                                width: 20,
                                height: 20
                            }}
                        />
                    </TouchableOpacity>
                    <Text style={{
                        color: "white"
                    }}>PULL-UPS (TEST MODE)</Text>
                    <Image source={require("../../../assets/downloadedIcons/notification.png")}
                        style={{
                            height: 30,
                            width: 30,
                            resizeMode: "contain"
                        }}
                    />
                </View>
            </View>
            <View style={{
                flex: 1,
                padding: 20,
                paddingBottom: 50,
                justifyContent: "space-between"
            }}>
                <View style={{
                    gap: 20
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
                        color: "black",
                        alignSelf: "center",
                        fontWeight: 200
                    }}>
                        Maximum number of pull-ups in one minute
                    </Text>
                    <View style={{
                        paddingHorizontal: 30,
                        alignItems: "center",
                        borderRadius: 25,
                        flexDirection: "row",
                        justifyContent: "space-between",
                    }}>
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
                                fontWeight: 200
                            }}>MINIMUM</Text>
                        </View>
                        <View style={{
                            alignItems: "center",
                            left: 10,
                        }}>
                            <Text style={{
                                fontSize: 25,
                            }}>
                                01:00
                            </Text>
                            <Text style={{
                                fontSize: 10
                            }}>MINUTE</Text>
                        </View>
                        <View style={{
                            alignItems: "center"
                        }}>
                            <Switch
                                color={Theme.colos.primaryColor}
                                value={isAutoDetectEnabled}
                                onValueChange={(value) => setIsAutoDetectEnabled(value)}
                            />
                            <Text style={{
                                fontSize: 10,
                                fontWeight: 200
                            }}>AUTO DETECT</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity style={styles.getStartedBtn}
                    onPress={() => {
                        setIsModalVisible(true);
                    }}
                >
                    <Text style={{
                        fontFamily: Theme.Montserrat_Font.Mont400,
                        color: "white"
                    }}>GET STARTED</Text>
                    <Image source={require("../../../assets/downloadedIcons/fast.png")}
                        style={{
                            width: 25,
                            height: 25,
                            resizeMode: "contain"
                        }}
                    />
                </TouchableOpacity>
            </View>
            <Modal
                visible={isModalVisible}
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
                    <View style={{
                        height: 300,
                        backgroundColor: Theme.colos.primaryColor,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 5
                    }}>
                        <View style={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            padding: 20
                        }}>
                            <TouchableOpacity style={{

                            }}
                                onPress={() => {
                                    setIsModalVisible(false)
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
                            backgroundColor: "rgba(0, 0, 0, 0.3)"
                        }}>
                            <View style={{
                                flexDirection: "row",
                                alignItems: "flex-end",
                            }}>
                                <Text style={{
                                    fontSize: 60,
                                    color: "white",
                                }}>01:00</Text>
                                <Text style={{
                                    fontSize: 17,
                                    bottom: 10,
                                    color: "white",
                                }}>min</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    modalToPrepModal();
                                }}
                            >
                                <Text style={{
                                    color: "white"
                                }}>Start</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
                    justifyContent: "center",
                    backgroundColor: "rgba(0, 0, 0, 0.6)"
                }}>
                    <View style={{
                        height: 200,
                        alignSelf: "center",
                        width: "60%",
                        backgroundColor: Theme.colos.primaryColor,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 5
                    }}>
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
                                    fontFamily: Theme.Montserrat_Font.Mont500
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
                    <View style={{
                        height: 300,
                        backgroundColor: Theme.colos.primaryColor,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 5
                    }}>
                        {/* <View style={{
                                position: "absolute",
                                top: 0,
                                right: 0,
                                padding: 20
                            }}>
                                <TouchableOpacity style={{

                                }}
                                    onPress={() => {
                                        setIsStartModalVisible(false)
                                    }}
                                >
                                    <Text style={{
                                        fontSize: 17,
                                        color: "white",
                                        fontFamily: Theme.Montserrat_Font.Mont500
                                    }}>close</Text>
                                </TouchableOpacity>
                            </View> */}
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
                                    fontSize: 60,
                                    color: "white",
                                }}>{startTime}</Text>
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
                                }}>G000000!!!</Text>
                            </TouchableOpacity>
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
                    <View style={{
                        height: 360,
                        backgroundColor: Theme.colos.primaryColor,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 5
                    }}>
                        <View style={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            padding: 20
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
                                    setStartTime(60);
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
                                    fontFamily: Theme.Montserrat_Font.Mont500
                                }}>close</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{
                            height: 200,
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
                                    fontSize: 60,
                                    color: "white",
                                }}>{pullUpCount}</Text>
                                {/* <Text style={{
                                        fontSize: 17,
                                        bottom: 10,
                                        color: "white",
                                        fontFamily: Theme.Montserrat_Font.Mont500
                                    }}>min</Text> */}
                            </View>
                            <View
                            >
                                <Text style={{
                                    fontFamily: Theme.MuseoModerno_Font.Muse600,
                                    color: "white"
                                }}>Correct Push Ups</Text>
                            </View>
                            <TouchableOpacity style={[styles.getStartedBtn, {
                                width: "70%"
                            }]}
                                onPress={() => {
                                    setIsResultModalVisible(false);
                                    navigation.goBack();
                                }}
                            >
                                <Text style={{
                                    fontFamily: Theme.Montserrat_Font.Mont400,
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
                        height: "30%",
                        padding: 20,
                        justifyContent: "center",
                        backgroundColor: Theme.colos.backgroundColor,
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
                                    fontWeight: 200,
                                    fontSize: 16,
                                    textAlign: "center"
                                }}>Input your sit-up count</Text>
                            </View>
                        </View>
                        <TextInput
                            // value={pushUpCount}
                            // onChangeText={setPushUpCount}
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
        padding: 15,
        backgroundColor: Theme.colos.primaryColor,
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        alignSelf: "center",
        borderRadius: 5,
        gap: 10,
        flexDirection: "row"
    }
})