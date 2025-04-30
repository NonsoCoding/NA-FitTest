import { Image, ImageBackground, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Theme } from "../Branding/Theme";
import LottieView from "lottie-react-native";
import { useState } from "react";


interface IHomePageProps {
    navigation: any;
}

const pushUpsVideoSource = require('../../assets/ExerciseGifs/pushUps.mp4');
const pullUpVideoSource = require('../../assets/ExerciseGifs/pullUps.mp4');
const sprintVideoSource = require('../../assets/ExerciseGifs/sprint.mp4');
const sitUpVideoSource = require('../../assets/ExerciseGifs/situps.mp4');
const runningVideoSource = require('../../assets/ExerciseGifs/running.mp4');


const HomePage = ({
    navigation
}: IHomePageProps) => {

    // const { signOut } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const signingOut = async (sessionId: string) => {
        navigation.reset({
            index: 0,
            routes: [{ name: "Intro" }],
        });
    };


    // const pushUpsPlayer = useVideoPlayer(pushUpsVideoSource, (player) => {
    //     player.loop = true;
    //     player.play();
    // });
    // const pullUpsPlayer = useVideoPlayer(pullUpVideoSource, (player) => {
    //     player.loop = true;
    //     player.play();
    // });
    // const sprintPlayer = useVideoPlayer(sprintVideoSource, (player) => {
    //     player.loop = true;
    //     player.play();
    // });
    // const sitUpPlayer = useVideoPlayer(sitUpVideoSource, (player) => {
    //     player.loop = true;
    //     player.play();
    // });
    // const runningPlayer = useVideoPlayer(runningVideoSource, (player) => {
    //     player.loop = true;
    //     player.play();
    // });

    return (
        <View style={{
            flex: 1
        }}>
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
                    <Text style={{ color: "#fff", marginTop: 10, fontFamily: Theme.Montserrat_Font.Mont400 }}>Signing you in...</Text>
                </View>
            )}
            <View style={styles.top_container}>
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between"
                }}>
                    <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10
                    }}>
                        <Image source={require("../../assets/downloadedIcons/Frame.png")}
                            style={{
                                width: 20,
                                height: 20,
                                resizeMode: "contain"
                            }}
                        />
                        <Text style={{
                            color: "white"
                        }}>April, 17, 2025</Text>
                    </View>
                    <TouchableOpacity style={{
                        backgroundColor: "white",
                        borderRadius: 10
                    }}
                        // onPress={() => {
                        //     setIsLogOutModalVisible(true);
                        // }}
                        onPress={() => navigation.openDrawer()}
                    >
                        <Image source={require("../../assets/downloadedIcons/notification.png")}
                            style={{
                                width: 30,
                                height: 30
                            }}
                        />
                    </TouchableOpacity>
                </View>
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10
                }}>
                    <View>
                        <Image source={require("../../assets/downloadedIcons/profile.png")}
                            style={{
                                width: 60,
                                height: 60,
                                resizeMode: "contain"
                            }}
                        />
                    </View>
                    <View style={{
                    }}>
                        <Text style={{
                            color: "white",
                            fontSize: 24,
                            fontWeight: 600
                        }}>Timothy Obi</Text>
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
                                color: 'white'
                            }}>109</Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={{
                flex: 3
            }}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={{

                    }}
                >
                    <View style={{
                        padding: 10,
                        gap: 10,

                    }}>
                        <View style={{
                            padding: 15,
                            borderRadius: 5,
                            backgroundColor: "rgba(0, 0, 0, 0.3)"
                        }}>
                            <TouchableOpacity style={styles.exercise_btn}
                                onPress={() => {
                                    navigation.navigate("PushUpsScreen")
                                }}
                            >
                                {/* <VideoView
                                    style={{
                                        height: 100,
                                        width: 100,
                                        borderRadius: 5
                                    }}
                                    player={pushUpsPlayer}
                                /> */}
                                <View style={{
                                    gap: 4
                                }}>
                                    <Text style={{
                                        fontSize: 24,
                                        fontWeight: 600,
                                        color: "white"
                                    }}>Push-Ups</Text>
                                    <Text style={{
                                        color: "white"
                                    }}>Minimum Requirement: 50</Text>
                                    <View style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 7,
                                    }}>
                                        <Image source={require("../../assets/downloadedIcons/medalIcon.png")}
                                            style={{
                                                width: 15,
                                                height: 15
                                            }}
                                        />
                                        <Text style={{
                                            color: "white",

                                        }}>Person Best: 100</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{
                            padding: 15,
                            borderRadius: 5,
                            backgroundColor: "rgba(0, 0, 0, 0.3)"
                        }}>
                            <TouchableOpacity style={styles.exercise_btn}
                                onPress={() => {
                                    navigation.navigate("SprintScreen")
                                }}
                            >
                                {/* <VideoView
                                    style={{
                                        height: 100,
                                        width: 100,
                                        borderRadius: 5
                                    }}
                                    player={sprintPlayer}
                                /> */}
                                <View style={{
                                    gap: 4
                                }}>
                                    <Text style={{
                                        fontSize: 24,
                                        fontWeight: 600,
                                        color: "white"
                                    }}>300 Meter Sprint</Text>
                                    <Text style={{
                                        color: "white"
                                    }}>Minimum Requirement: 50</Text>
                                    <View style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 7,
                                    }}>
                                        <Image source={require("../../assets/downloadedIcons/medalIcon.png")}
                                            style={{
                                                width: 15,
                                                height: 15
                                            }}
                                        />
                                        <Text style={{
                                            color: "white",

                                        }}>Person Best: 100</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{
                            padding: 15,
                            borderRadius: 5,
                            backgroundColor: "rgba(0, 0, 0, 0.3)"
                        }}>
                            <TouchableOpacity style={styles.exercise_btn}
                                onPress={() => {
                                    navigation.navigate("SitUpScreen")
                                }}
                            >
                                {/* <VideoView
                                    style={{
                                        height: 82,
                                        width: 97,
                                        borderRadius: 5
                                    }}
                                    player={sitUpPlayer}
                                /> */}
                                <View style={{
                                    gap: 4
                                }}>
                                    <Text style={{
                                        fontSize: 24,
                                        fontWeight: 600,
                                        color: "white"
                                    }}>Sit-Ups</Text>
                                    <Text style={{
                                        color: "white"
                                    }}>Minimum Requirement: 50</Text>
                                    <View style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 7,
                                    }}>
                                        <Image source={require("../../assets/downloadedIcons/medalIcon.png")}
                                            style={{
                                                width: 15,
                                                height: 15
                                            }}
                                        />
                                        <Text style={{
                                            color: "white",

                                        }}>Person Best: 100</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{
                            padding: 15,
                            borderRadius: 5,
                            backgroundColor: "rgba(0, 0, 0, 0.3)"
                        }}>
                            <TouchableOpacity style={styles.exercise_btn}
                                onPress={() => {
                                    navigation.navigate("RunningScreen")
                                }}
                            >
                                {/* <VideoView
                                    style={{
                                        height: 100,
                                        width: 100,
                                        borderRadius: 5
                                    }}
                                    player={runningPlayer}
                                /> */}
                                <View style={{
                                    gap: 4
                                }}>
                                    <Text style={{
                                        fontSize: 24,
                                        fontWeight: 600,
                                        color: "white"
                                    }}>1.5 Mile Run</Text>
                                    <Text style={{
                                        color: "white"
                                    }}>Minimum Requirement: 50</Text>
                                    <View style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 7,
                                    }}>
                                        <Image source={require("../../assets/downloadedIcons/medalIcon.png")}
                                            style={{
                                                width: 15,
                                                height: 15
                                            }}
                                        />
                                        <Text style={{
                                            color: "white",

                                        }}>Person Best: 100</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{
                            padding: 15,
                            borderRadius: 5,
                            backgroundColor: "rgba(0, 0, 0, 0.3)"
                        }}>
                            <TouchableOpacity style={styles.exercise_btn}
                                onPress={() => {
                                    navigation.navigate("PullUpScreen")
                                }}
                            >
                                {/* <VideoView
                                    style={{
                                        height: 100,
                                        width: 100,
                                        borderRadius: 5
                                    }}
                                    player={pullUpsPlayer}
                                /> */}
                                <View style={{
                                    gap: 4
                                }}>
                                    <Text style={{
                                        fontSize: 24,
                                        fontWeight: 600,
                                        color: "white"
                                    }}>Pull-Ups</Text>
                                    <Text style={{
                                        color: "white"
                                    }}>Minimum Requirement: 50</Text>
                                    <View style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 7,
                                    }}>
                                        <Image source={require("../../assets/downloadedIcons/medalIcon.png")}
                                            style={{
                                                width: 15,
                                                height: 15
                                            }}
                                        />
                                        <Text style={{
                                            color: "white",

                                        }}>Person Best: 100</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </View>

        </View>
    )
}

export default HomePage;

const styles = StyleSheet.create({
    container: {
    },
    top_container: {
        flex: 1,
        backgroundColor: Theme.colos.primaryColor,
        padding: 20,
        justifyContent: "center",
        gap: 20,
    },
    exercise_btn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 20
    },
    logout_btn: {
        backgroundColor: Theme.colos.primaryColor,
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
    }
})
