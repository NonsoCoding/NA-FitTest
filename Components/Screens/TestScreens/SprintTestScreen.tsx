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
    const [startTime, setStartTime] = useState(60);
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
            startMainCountdown();
        }
    }, [isStartModalVisible])

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
        if (isStartRunning && startTime > 0) {
            startIntervalRef.current = setInterval(() => {
                setStartTime(prev => {
                    if (prev === 1) {
                        clearInterval(startIntervalRef.current as NodeJS.Timeout);
                        setIsStartRunning(false);
                        setIsStartModalVisible(false);
                        setTimeout(() => {
                            setIsResultModalVisible(true);
                        }, 700)
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (startIntervalRef.current) clearInterval(startIntervalRef.current);
        };
    }, [isStartRunning]);

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
                            <View style={{
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
                                    }}>58</Text>
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
                                    }}>INPUT SCORE</Text>
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