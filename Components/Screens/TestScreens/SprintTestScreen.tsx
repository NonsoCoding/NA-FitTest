import { Image, ImageBackground, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Theme } from "../../Branding/Theme";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useRef, useState } from "react";


interface ITestProps {
    navigation?: any;
}

const VideoSource = require("../../../assets/ExerciseGifs/sprint.mp4")

const SprintTestScreen = ({
    navigation
}: ITestProps) => {

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isPrepModalVisible, setIsPrepModalVisible] = useState(false);
    const [isStartModalVisible, setIsStartModalVisible] = useState(false);
    const [isResultModalVisible, setIsResultModalVisible] = useState(false);
    const [prepTime, setPrepTime] = useState(5);
    const [isStartRunning, setIsStartRunning] = useState(false);
    const [timerCount, setTimerCount] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [finalTime, setFinalTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const startIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const pullUpsPlayer = useVideoPlayer(VideoSource, (player) => {
        player.loop = true;
        player.play();
    });

    const startPrepCountdown = () => {
        if (prepTime > 0 && !isRunning) {
            setIsRunning(true);
        }
    };

    useEffect(() => {
        if (isStartModalVisible) {
            startMainTimer();
        }
    }, [isStartModalVisible])

    const startMainTimer = () => {
        if (!isStartRunning) {
            setTimerCount(0);
            setIsStartRunning(true);
        }
    };

    const pauseTimer = () => {
        setIsPaused(true);
        if (startIntervalRef.current) {
            clearInterval(startIntervalRef.current);
            startIntervalRef.current = null;
        }
    };

    const continueTimer = () => {
        setIsPaused(false);
        if (!startIntervalRef.current) {
            startTimerCount();
        }
    };

    const stopTimer = () => {
        setFinalTime(timerCount);
        setIsStartRunning(false);
        setIsStartModalVisible(false);
        if (startIntervalRef.current) {
            clearInterval(startIntervalRef.current);
            startIntervalRef.current = null;
        }
        setTimeout(() => {
            setIsResultModalVisible(true);
        }, 700);
    };

    const startTimerCount = () => {
        startIntervalRef.current = setInterval(() => {
            setTimerCount(prev => prev + 1);
        }, 1000);
    };

    const modalToPrepModal = () => {
        setIsModalVisible(false);
        setTimeout(() => {
            setIsPrepModalVisible(true);
            startPrepCountdown();
        }, 700);
    }

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
                        }, 700)
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning]);

    useEffect(() => {
        if (isStartRunning && !isPaused) {
            startTimerCount();
        }

        return () => {
            if (startIntervalRef.current) clearInterval(startIntervalRef.current);
        };
    }, [isStartRunning, isPaused]);

    // Helper function to format time as MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

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
                        }}>1.5 MILE RUN (TEST MODE)</Text>
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
                        player={pullUpsPlayer}
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
                        Quickest 300 meter run in your best time
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
                                10
                            </Text>
                            <Text style={{
                                color: "white",
                                fontWeight: 200
                            }}>Points</Text>
                        </View>
                        <View style={{
                            alignItems: "center"
                        }}>
                            <Text style={{
                                color: "white",
                                fontSize: 25,
                                fontFamily: Theme.Montserrat_Font.Mont700
                            }}>
                                00:00
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
                            }}>Best Time</Text>
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
                                    }}>00:00</Text>
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
                        setIsStartModalVisible(false);
                        if (startIntervalRef.current) {
                            clearInterval(startIntervalRef.current);
                            startIntervalRef.current = null;
                        }
                    }}
                >
                    <View style={{
                        flex: 1,
                        justifyContent: "flex-end"
                    }}>
                        <View style={{
                            height: 350,
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
                                <TouchableOpacity
                                    onPress={() => {
                                        setIsStartModalVisible(false);
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
                            </View> */}
                            <View style={{
                                height: 250,
                                width: '70%',
                                borderRadius: 20,
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 20,
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
                                    }}>{formatTime(timerCount)}</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => {
                                        // No action needed here
                                    }}
                                >
                                    <Text style={{
                                        fontFamily: Theme.MuseoModerno_Font.Muse600,
                                        color: "white"
                                    }}>{isPaused ? "PAUSED" : "GO!GO!GO!"}</Text>
                                </TouchableOpacity>

                                <View style={{
                                    flexDirection: "row",
                                    justifyContent: "space-around",
                                    width: "100%",
                                    paddingHorizontal: 20
                                }}>
                                    {isPaused ? (
                                        <TouchableOpacity
                                            style={{
                                                backgroundColor: "#4CAF50",
                                                paddingVertical: 10,
                                                paddingHorizontal: 20,
                                                borderRadius: 10
                                            }}
                                            onPress={continueTimer}
                                        >
                                            <Text style={{
                                                color: "white",
                                                fontFamily: Theme.Montserrat_Font.Mont500
                                            }}>Continue</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity
                                            style={{
                                                backgroundColor: "#FFC107",
                                                paddingVertical: 10,
                                                paddingHorizontal: 20,
                                                borderRadius: 10
                                            }}
                                            onPress={pauseTimer}
                                        >
                                            <Text style={{
                                                color: "white",
                                                fontFamily: Theme.Montserrat_Font.Mont500
                                            }}>Pause</Text>
                                        </TouchableOpacity>
                                    )}

                                    <TouchableOpacity
                                        style={{
                                            backgroundColor: "#F44336",
                                            paddingVertical: 10,
                                            paddingHorizontal: 20,
                                            borderRadius: 10
                                        }}
                                        onPress={stopTimer}
                                    >
                                        <Text style={{
                                            color: "white",
                                            fontFamily: Theme.Montserrat_Font.Mont500
                                        }}>Stop</Text>
                                    </TouchableOpacity>
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
                        setIsResultModalVisible(false);
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
                                <TouchableOpacity
                                    onPress={() => {
                                        setIsResultModalVisible(false)
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
                                gap: 20,
                                backgroundColor: "rgba(0, 0, 0, 0.3)"
                            }}>
                                <Text style={{
                                    color: "white",
                                    fontFamily: Theme.MuseoModerno_Font.Muse600,
                                    fontSize: 16
                                }}>YOUR TIME</Text>
                                <View style={{
                                    flexDirection: "row",
                                    alignItems: "flex-end",
                                }}>
                                    <Text style={{
                                        fontSize: 60,
                                        color: "white",
                                        fontFamily: Theme.Montserrat_Font.Mont700
                                    }}>{formatTime(finalTime)}</Text>
                                </View>
                                <TouchableOpacity style={styles.getStartedBtn}
                                    onPress={() => {
                                        setIsResultModalVisible(false);
                                        // Reset all states to their initial values
                                        setTimerCount(0);
                                        setFinalTime(0);
                                        setIsPaused(false);
                                        setIsStartRunning(false);
                                        setPrepTime(5);
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
            </ImageBackground>
        </View>
    )
}


export default SprintTestScreen;

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