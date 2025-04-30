import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Theme } from "../Branding/Theme";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { DrawerParamList } from "../nav/type";

interface IHistoryProps {

}

const pushUpsVideoSource = require('../../assets/ExerciseGifs/pushUps.mp4');

const History = ({

}: IHistoryProps) => {

    const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();

    // const pushUpsPlayer = useVideoPlayer(pushUpsVideoSource, (player) => {
    //     player.loop = true;
    //     player.play();
    // });

    return (
        <View style={styles.container}>
            <View style={{
                height: "22%",
                backgroundColor: Theme.colos.primaryColor,
                padding: 20,
                paddingTop: 60,
                justifyContent: "center",
                gap: 40
            }}>
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}>
                    <TouchableOpacity style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10
                    }}
                        onPress={() => {
                            navigation.goBack();
                        }}
                    >
                        <Image source={require("../../assets/downloadedIcons/fast.png")}
                            style={{
                                width: 20,
                                height: 20
                            }}
                        />
                        <Text style={{
                            color: "white"
                        }}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => navigation.openDrawer()}
                    >
                        <Image source={require("../../assets/downloadedIcons/notification.png")}
                            style={{
                                height: 30,
                                width: 30
                            }}
                        />
                    </TouchableOpacity>
                </View>
                <View>
                    <Text style={{
                        fontWeight: 700,
                        fontSize: 40,
                        color: "white"
                    }}>HISTORY</Text>
                </View>
            </View>
            <View style={{
                flex: 3,
                padding: 20,
                gap: 15
            }}>
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderRadius: 5,
                    borderWidth: 1,
                    padding: 10,
                    justifyContent: "space-between"
                }}>
                    {/* <VideoView
                        style={{
                            height: 70,
                            width: 70,
                            borderRadius: 5
                        }}
                        player={pushUpsPlayer}
                    /> */}
                    <View style={{
                        flexDirection: "row",
                        gap: 30
                    }}>
                        <View style={{
                            gap: 10,
                            justifyContent: "center"
                        }}>
                            <Image source={require("../../assets/downloadedIcons/shield-line.png")}
                                style={{
                                    height: 20,
                                    width: 20,
                                }}
                            />
                            <Text>79</Text>
                        </View>
                        <View style={{
                            gap: 10,
                            justifyContent: "center"
                        }}>
                            <Image source={require("../../assets/downloadedIcons/timer-line.png")}
                                style={{
                                    height: 20,
                                    width: 20,
                                }}
                            />
                            <Text>79</Text>
                        </View>
                        <View style={{
                            gap: 10,
                            alignItems: 'center'
                        }}>
                            <Image source={require("../../assets/downloadedIcons/medalIcon.png")}
                                style={{
                                    height: 20,
                                    width: 20,
                                }}
                            />
                            <Text>125</Text>
                        </View>
                    </View>
                </View>
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderRadius: 5,
                    borderWidth: 1,
                    padding: 10,
                    justifyContent: "space-between"
                }}>
                    {/* <VideoView
                        style={{
                            height: 70,
                            width: 70,
                            borderRadius: 5
                        }}
                        player={pushUpsPlayer}
                    /> */}
                    <View style={{
                        flexDirection: "row",
                        gap: 30
                    }}>
                        <View style={{
                            gap: 10,
                            justifyContent: "center"
                        }}>
                            <Image source={require("../../assets/downloadedIcons/shield-line.png")}
                                style={{
                                    height: 20,
                                    width: 20,
                                }}
                            />
                            <Text>79</Text>
                        </View>
                        <View style={{
                            gap: 10,
                            justifyContent: "center"
                        }}>
                            <Image source={require("../../assets/downloadedIcons/timer-line.png")}
                                style={{
                                    height: 20,
                                    width: 20,
                                }}
                            />
                            <Text>79</Text>
                        </View>
                        <View style={{
                            gap: 10,
                            alignItems: 'center'
                        }}>
                            <Image source={require("../../assets/downloadedIcons/medalIcon.png")}
                                style={{
                                    height: 20,
                                    width: 20,
                                }}
                            />
                            <Text>125</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    )
}

export default History;

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
})