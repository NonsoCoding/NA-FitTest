import { Image, ImageBackground, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Theme } from "../../Branding/Theme";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useRef, useState } from "react";
import { Accelerometer } from "expo-sensors";


interface ITestProps {
    navigation?: any;
}

enum SitupState {
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

const VideoSource = require("../../../assets/ExerciseGifs/situps.mp4")

const SitUpTestScreen = ({
    navigation
}: ITestProps) => {

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isPrepModalVisible, setIsPrepModalVisible] = useState(false);
    const [isStartModalVisible, setIsStartModalVisible] = useState(false);
    const [isResultModalVisible, setIsResultModalVisible] = useState(false);
    const [prepTime, setPrepTime] = useState(5);
    const [isStartRunning, setIsStartRunning] = useState(false);
    const [startTime, setStartTime] = useState(60);
    const [sensorData, setSensorData] = useState<SensorData>({});
    const [sitUpCount, setSitUpCount] = useState(0);
    const [situpState, setSitupState] = useState<SitupState>(SitupState.READY);
    const [isFirstCalibration, setIsFirstCalibration] = useState(true);
    const [calibrationValues, setCalibrationValues] = useState({
        downThreshold: -0.6,
        upThreshold: -0.18,
        midThreshold: -0.10
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

    const sitUpsPlayer = useVideoPlayer(VideoSource, (player) => {
        player.loop = true;
        player.play();
    });

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

    // Start main countdown when modal is visible
    useEffect(() => {
        if (isStartModalVisible) {
            startMainCountdown();
            // Reset push-up counter when starting the test
            setSitUpCount(0);
            setSitupState(SitupState.READY);
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
            setIsCountingActive(true);

            startIntervalRef.current = setInterval(() => {
                setStartTime(prev => {
                    if (prev === 1) {
                        clearInterval(startIntervalRef.current as NodeJS.Timeout);
                        setIsStartRunning(false);
                        setIsStartModalVisible(false);

                        // Disable push-up counting when the timer ends
                        setIsCountingActive(false);

                        setTimeout(() => {
                            setIsResultModalVisible(true);
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
        if (!isCountingActive || sensorData.z === undefined) return;

        const now = Date.now();
        const z = sensorData.z;

        addZValue(z);
        const smoothedZ = getSmoothedZ();
        // console.log("smoothedZ: ", smoothedZ);

        if (isFirstCalibration && sitUpCount === 3) {
            setIsFirstCalibration(false);
            console.log("Calibration complete");
        }

        switch (situpState) {
            case SitupState.READY:
                if (smoothedZ > calibrationValues.midThreshold) {
                    setSitupState(SitupState.GOING_UP);
                    setStateTimestamps(prev => ({ ...prev, upStart: now }));
                    console.log("Going up");
                }
                break;

            case SitupState.GOING_UP:
                if (smoothedZ > calibrationValues.upThreshold) {
                    setSitupState(SitupState.UP);
                    setStateTimestamps(prev => ({ ...prev, upEnd: now }));
                    console.log("Reached top");
                } else if (smoothedZ < calibrationValues.midThreshold) {
                    setSitupState(SitupState.READY);
                    console.log("False start - reset");
                }
                break;

            case SitupState.UP:
                if (smoothedZ < calibrationValues.midThreshold) {
                    setSitupState(SitupState.GOING_DOWN);
                    setStateTimestamps(prev => ({ ...prev, downStart: now }));
                    console.log("Going down");
                }
                break;

            case SitupState.GOING_DOWN:
                if (smoothedZ < calibrationValues.downThreshold) {
                    const duration = now - stateTimestamps.upStart;

                    if (duration >= MIN_PUSHUP_TIME &&
                        duration <= MAX_PUSHUP_TIME &&
                        now - lastCountTime > COOLDOWN_MS) {

                        setSitUpCount(prev => {
                            const newCount = prev + 1;

                            if (isFirstCalibration && newCount <= 3) {
                                setCalibrationValues(prev => ({
                                    upThreshold: (prev.upThreshold * 0.7) + (smoothedZ * 0.3),
                                    downThreshold: Math.min(prev.downThreshold, smoothedZ * 0.8),
                                    midThreshold: (prev.upThreshold + prev.downThreshold) / 2
                                }));
                            }

                            return newCount;
                        });

                        setLastCountTime(now);
                        console.log("Sit-up counted!", duration);
                    }

                    setSitupState(SitupState.DOWN);
                    setStateTimestamps(prev => ({ ...prev, downEnd: now }));
                }
                break;

            case SitupState.DOWN:
                if (now - stateTimestamps.downEnd > 300) {
                    setSitupState(SitupState.READY);
                }
                break;
        }
    }, [sensorData]);


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
            <ImageBackground source={require("../../../assets/downloadedIcons/homeBg.png")}
                style={{
                    flex: 1
                }}
            >
                <View style={{
                    backgroundColor: "black",
                    justifyContent: "center",
                    gap: 20,
                    padding: 20,
                    height: "50%",
                    borderBottomRightRadius: 20,
                    borderBottomLeftRadius: 20
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
                        }}>PUSH-UPS (TEST MODE)</Text>
                        <Image source={require("../../../assets/downloadedIcons/notification.png")}
                            style={{
                                height: 40,
                                width: 40,
                                resizeMode: "contain"
                            }}
                        />
                    </View>
                    <VideoView
                        style={{
                            alignSelf: "center",
                            width: 280,
                            height: 280,
                            borderRadius: 20
                        }}
                        player={sitUpsPlayer}
                    />
                </View>
                <View style={{
                    padding: 20,
                    gap: 20
                }}>
                    <Text style={{
                        color: "white",
                        alignSelf: "center",
                        fontWeight: 200
                    }}>
                        Maximum number of push-ups in one minute
                    </Text>
                    <View style={{
                        padding: 15,
                        paddingHorizontal: 45,
                        alignItems: "center",
                        borderRadius: 25,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        backgroundColor: "rgba(0, 0, 0, 0.3)"
                    }}>
                        <View style={{
                            alignItems: "center"
                        }}>
                            <Text style={{
                                color: "white",
                                fontSize: 25,
                                fontFamily: Theme.Montserrat_Font.Mont700
                            }}>
                                5
                            </Text>
                            <Text style={{
                                color: "white",
                                fontWeight: 200
                            }}>Min</Text>
                        </View>
                        <View style={{
                            alignItems: "center"
                        }}>
                            <Text style={{
                                color: "white",
                                fontSize: 25,
                                fontFamily: Theme.Montserrat_Font.Mont700
                            }}>
                                01:00
                            </Text>
                        </View>
                        <View style={{
                            alignItems: "center"
                        }}>
                            <Text style={{
                                color: "white",
                                fontSize: 25,
                                fontFamily: Theme.Montserrat_Font.Mont700
                            }}>
                                50
                            </Text>
                            <Text style={{
                                color: "white",
                                fontWeight: 200
                            }}>Max</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.getStartedBtn}
                        onPress={() => {
                            setIsModalVisible(true);
                        }}
                    >
                        <Image source={require("../../../assets/downloadedIcons/fast.png")}
                            style={{
                                width: 25,
                                height: 25,
                                resizeMode: "contain"
                            }}
                        />
                        <Text style={{
                            fontFamily: Theme.Montserrat_Font.Mont400,
                            color: "white"
                        }}>GET STARTED</Text>
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
                            borderRadius: 20
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
                                        fontFamily: Theme.Montserrat_Font.Mont500
                                    }}>close</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{
                                height: 150,
                                width: '70%',
                                borderRadius: 20,
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
                                        fontFamily: Theme.Montserrat_Font.Mont700
                                    }}>01:00</Text>
                                    <Text style={{
                                        fontSize: 17,
                                        bottom: 10,
                                        color: "white",
                                        fontFamily: Theme.Montserrat_Font.Mont500
                                    }}>min</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => {
                                        modalToPrepModal();
                                    }}
                                >
                                    <Text style={{
                                        fontFamily: Theme.MuseoModerno_Font.Muse600,
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
                        justifyContent: "flex-end"
                    }}>
                        <View style={{
                            height: 300,
                            backgroundColor: Theme.colos.primaryColor,
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 20
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
                                borderRadius: 20,
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
                                        fontFamily: Theme.Montserrat_Font.Mont700
                                    }}>{prepTime}</Text>
                                    <Text style={{
                                        fontSize: 17,
                                        bottom: 10,
                                        color: "white",
                                        fontFamily: Theme.Montserrat_Font.Mont500
                                    }}>sec</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => {

                                    }}
                                >
                                    <Text style={{
                                        fontFamily: Theme.MuseoModerno_Font.Muse600,
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
                            borderRadius: 20
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
                                borderRadius: 20,
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
                                        fontFamily: Theme.Montserrat_Font.Mont700
                                    }}>{startTime}</Text>
                                    <Text style={{
                                        fontSize: 17,
                                        bottom: 10,
                                        color: "white",
                                        fontFamily: Theme.Montserrat_Font.Mont500
                                    }}>sec</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => {

                                    }}
                                >
                                    <Text style={{
                                        fontFamily: Theme.MuseoModerno_Font.Muse600,
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
                            borderRadius: 20
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
                                borderRadius: 20,
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
                                        fontFamily: Theme.Montserrat_Font.Mont700
                                    }}>{sitUpCount}</Text>
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
                                <TouchableOpacity style={styles.getStartedBtn}
                                    onPress={() => {
                                        setIsResultModalVisible(false);
                                        navigation.goBack();
                                    }}
                                >
                                    <Image source={require("../../../assets/downloadedIcons/fast.png")}
                                        style={{
                                            width: 25,
                                            height: 25,
                                            resizeMode: "contain"
                                        }}
                                    />
                                    <Text style={{
                                        fontFamily: Theme.Montserrat_Font.Mont400,
                                        color: "white"
                                    }}>Continue</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
                <Text>Push-Up Count: {sitUpCount}</Text>
                <Text>Sensor Z: {sensorData.z?.toFixed(2)}</Text>

            </ImageBackground>
        </View>
    )
}

export default SitUpTestScreen;

const styles = StyleSheet.create({
    container: {
    },
    getStartedBtn: {
        padding: 10,
        backgroundColor: "black",
        alignItems: "center",
        justifyContent: "center",
        width: "70%",
        alignSelf: "center",
        borderRadius: 20,
        gap: 10,
        flexDirection: "row"
    }
})