import { Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Theme } from "../Branding/Theme";
import LottieView from "lottie-react-native";
import { useVideoPlayer, VideoView } from "expo-video";


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

    const pushUpsPlayer = useVideoPlayer(pushUpsVideoSource, (player) => {
        player.loop = true;
        player.play();
    });
    const pullUpsPlayer = useVideoPlayer(pullUpVideoSource, (player) => {
        player.loop = true;
        player.play();
    });
    const sprintPlayer = useVideoPlayer(sprintVideoSource, (player) => {
        player.loop = true;
        player.play();
    });
    const sitUpPlayer = useVideoPlayer(sitUpVideoSource, (player) => {
        player.loop = true;
        player.play();
    });
    const runningPlayer = useVideoPlayer(runningVideoSource, (player) => {
        player.loop = true;
        player.play();
    });

    return (
        <View style={{
            flex: 1
        }}>
            <ImageBackground
                source={require('../../assets/downloadedIcons/homeBg.png')}
                style={{
                    flex: 1
                }}
                resizeMode="cover"
            >
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
                        <View>
                            <Image source={require("../../assets/downloadedIcons/notification.png")}
                                style={{
                                    width: 40,
                                    height: 40,
                                    resizeMode: "contain"
                                }}
                            />
                        </View>
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
                                fontFamily: Theme.MuseoModerno_Font.Muse900
                            }}>Timothy Obi</Text>
                            <View style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 5
                            }}>
                                <Image source={require("../../assets/downloadedIcons/sparkle.png")}
                                    style={{
                                        height: 14,
                                        width: 14,
                                        resizeMode: "contain"
                                    }}
                                />
                                <Text style={{
                                    color: "white"
                                }}>99%</Text>
                                <Text style={{
                                    color: "white",
                                }}>Healthy</Text>
                                <Image source={require("../../assets/downloadedIcons/dotIcon.png")}
                                    style={{
                                        height: 5,
                                        width: 5,
                                        resizeMode: "contain"
                                    }}
                                />
                                <Image source={require("../../assets/downloadedIcons/sparkle.png")}
                                    style={{
                                        height: 14,
                                        width: 14,
                                        resizeMode: "contain"
                                    }}
                                />
                                <Text style={{
                                    color: "white",
                                }}>99%</Text>
                                <Text style={{
                                    color: "white"
                                }}>Healthy</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={{

                    }}
                >
                    <View style={{
                        padding: 10,
                        gap: 10
                    }}>
                        <View style={{
                            padding: 15,
                            borderRadius: 25,
                            backgroundColor: "rgba(0, 0, 0, 0.3)"
                        }}>
                            <TouchableOpacity style={styles.exercise_btn}
                                onPress={() => {
                                    navigation.navigate("PushUpsScreen")
                                }}
                            >
                                <VideoView
                                    style={{
                                        height: 100,
                                        width: 100,
                                        borderRadius: 20
                                    }}
                                    player={pushUpsPlayer}
                                />
                                <View style={{
                                    gap: 4
                                }}>
                                    <Text style={{
                                        fontSize: 24,
                                        fontFamily: Theme.MuseoModerno_Font.Muse900,
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
                            borderRadius: 25,
                            backgroundColor: "rgba(0, 0, 0, 0.3)"
                        }}>
                            <TouchableOpacity style={styles.exercise_btn}
                                onPress={() => {
                                    navigation.navigate("SprintScreen")
                                }}
                            >
                                <VideoView
                                    style={{
                                        height: 100,
                                        width: 100,
                                        borderRadius: 20
                                    }}
                                    player={sprintPlayer}
                                />
                                <View style={{
                                    gap: 4
                                }}>
                                    <Text style={{
                                        fontSize: 24,
                                        fontFamily: Theme.MuseoModerno_Font.Muse900,
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
                            borderRadius: 25,
                            backgroundColor: "rgba(0, 0, 0, 0.3)"
                        }}>
                            <TouchableOpacity style={styles.exercise_btn}
                                onPress={() => {
                                    navigation.navigate("SitUpScreen")
                                }}
                            >
                                <VideoView
                                    style={{
                                        height: 82,
                                        width: 97,
                                        borderRadius: 20
                                    }}
                                    player={sitUpPlayer}
                                />
                                <View style={{
                                    gap: 4
                                }}>
                                    <Text style={{
                                        fontSize: 24,
                                        fontFamily: Theme.MuseoModerno_Font.Muse900,
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
                            borderRadius: 25,
                            backgroundColor: "rgba(0, 0, 0, 0.3)"
                        }}>
                            <TouchableOpacity style={styles.exercise_btn}
                                onPress={() => {
                                    navigation.navigate("RunningScreen")
                                }}
                            >
                                <VideoView
                                    style={{
                                        height: 100,
                                        width: 100,
                                        borderRadius: 20
                                    }}
                                    player={runningPlayer}
                                />
                                <View style={{
                                    gap: 4
                                }}>
                                    <Text style={{
                                        fontSize: 24,
                                        fontFamily: Theme.MuseoModerno_Font.Muse900,
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
                            borderRadius: 25,
                            backgroundColor: "rgba(0, 0, 0, 0.3)"
                        }}>
                            <TouchableOpacity style={styles.exercise_btn}
                                onPress={() => {
                                    navigation.navigate("PullUpsScreen")
                                }}
                            >
                                <VideoView
                                    style={{
                                        height: 100,
                                        width: 100,
                                        borderRadius: 20
                                    }}
                                    player={pullUpsPlayer}
                                />
                                <View style={{
                                    gap: 4
                                }}>
                                    <Text style={{
                                        fontSize: 24,
                                        fontFamily: Theme.MuseoModerno_Font.Muse900,
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
            </ImageBackground>
        </View>
    )
}

export default HomePage;

const styles = StyleSheet.create({
    container: {

    },
    top_container: {
        height: "25%",
        backgroundColor: "black",
        borderBottomRightRadius: 30,
        borderBottomLeftRadius: 30,
        padding: 20,
        justifyContent: "center",
        gap: 20,
    },
    exercise_btn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 20
    }
})
