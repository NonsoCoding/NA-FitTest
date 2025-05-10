import { Image, ImageBackground, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Theme } from "../Branding/Theme";
import LottieView from "lottie-react-native";
import { useEffect, useState } from "react";
import { auth, db } from "../../Firebase/Settings";
import { doc, getDoc, onSnapshot } from "firebase/firestore";


interface IHomePageProps {
    navigation: any;
}

const HomePage = ({
    navigation
}: IHomePageProps) => {

    const [isLoading, setIsLoading] = useState(false);
    const [userInfo, setUserInfo] = useState<{ firstName: string; lastName: string; serviceNumber: string; TacticalPoints: string; } | null>(null);
    const [personalBests, setPersonalBests] = useState({
        pushUps: 0,
        sitUps: 0,
        pullUps: 0,
        runTime: 0,
        sprintTime: 0
    })
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });


    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const docRef = doc(db, "UserDetails", user.uid);

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                console.log("Real-time User Data: ", data);

                setUserInfo({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    serviceNumber: data.serviceNumber,
                    TacticalPoints: data.TacticalPoints
                });
            } else {
                console.log("No such document");
            }
        }, (error) => {
            console.log("Error fetching user data in real-time: ", error);
        });

        return () => unsubscribe(); // Clean up the listener when the component unmounts
    }, []);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const userDetailsRef = doc(db, "UserDetails", user.uid);

        const unsubscribe = onSnapshot(userDetailsRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data().personalBests || {};
                console.log("Real-time personalBests: ", data);

                setPersonalBests({
                    pushUps: data.pushUps || 0,
                    sitUps: data.sitUps || 0,
                    pullUps: data.pullUps || 0,
                    runTime: data.runTime || "none",
                    sprintTime: data.sprintTime || "none"
                });
            }
        }, (error) => {
            console.error("Error fetching personalBests in real-time:", error);
        });

        return () => unsubscribe(); // Cleanup listener on unmount
    }, []);

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
                    <Text style={{ color: "#fff", marginTop: 10 }}>Signing you in...</Text>
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
                        }}>{formattedDate}</Text>
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
                            fontSize: 20,
                            fontWeight: "600"
                        }}>{userInfo?.firstName} {userInfo?.lastName}</Text>
                        <Text style={{
                            color: "white",
                            fontSize: 12
                        }}>SN: {userInfo?.serviceNumber}</Text>
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
                            }}>{userInfo?.TacticalPoints ?? 0}</Text>
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
                            padding: 20,
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
                                        fontWeight: "600",
                                        color: "white"
                                    }}>Push-Ups</Text>
                                    <Text style={{
                                        color: "white"
                                    }}>Minimum Requirement: 38</Text>
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

                                        }}>Personal Best: {personalBests.pushUps}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{
                            padding: 20,
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
                                        fontWeight: "600",
                                        color: "white"
                                    }}>300 Meter Sprint</Text>
                                    <Text style={{
                                        color: "white"
                                    }}>Minimum Requirement: 60s</Text>
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
                                        }}>Personal Best: {formatTime(personalBests.sprintTime)}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{
                            padding: 20,
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
                                        fontWeight: "600",
                                        color: "white"
                                    }}>Sit-Ups</Text>
                                    <Text style={{
                                        color: "white"
                                    }}>Minimum Requirement: 38</Text>
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

                                        }}>Personal Best: {personalBests.sitUps}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{
                            padding: 20,
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
                                        fontWeight: "600",
                                        color: "white"
                                    }}>1.5 Mile Run</Text>
                                    <Text style={{
                                        color: "white"
                                    }}>Minimum Requirement: 10:00 min</Text>
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

                                        }}>Personal Best: {formatTime(personalBests.runTime)}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{
                            padding: 20,
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
                                        fontWeight: "600",
                                        color: "white"
                                    }}>Pull-Ups</Text>
                                    <Text style={{
                                        color: "white"
                                    }}>Minimum Requirement: 38</Text>
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

                                        }}>Personal Best: {personalBests.pullUps}</Text>
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
        height: "25%",
        backgroundColor: Theme.colors.primaryColor,
        padding: 20,
        paddingTop: 60,
        justifyContent: "space-between",
        gap: 20,
    },
    exercise_btn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 20
    },
    logout_btn: {
        backgroundColor: Theme.colors.primaryColor,
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
