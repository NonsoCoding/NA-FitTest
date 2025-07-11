import { ActivityIndicator, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { FlatList } from "react-native-gesture-handler";
import { DrawerParamList } from "../../nav/type";
import { auth, db } from "../../../Firebase/Settings";
import { Theme } from "../../Branding/Theme";
import LottieView from "lottie-react-native";
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';


const { width: screenWidth } = Dimensions.get('window');


interface IHistoryProps {

}

const SitUpHistory = ({

}: IHistoryProps) => {

    const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();

    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);



    const createCurvedPath = () => {
        const height = 160;
        const waveHeight = 45;

        return `M 0 0 
        L 0 ${height} 
        Q ${screenWidth * 0.25} ${height + waveHeight} ${screenWidth * 0.5} ${height}
        Q ${screenWidth * 0.75} ${height - waveHeight} ${screenWidth} ${height}
        L ${screenWidth} 0 
        Z`;
    };


    const fetchHistory = async () => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const querySnapshot = await getDocs(collection(db, `UserDetails/${user.uid}/SitUps`));
            const results: any[] = [];
            querySnapshot.forEach((doc) => {
                results.push({ id: doc.id, ...doc.data() });
            });
            // Sort by timestamp (optional)
            results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setHistory(results);
        } catch (error) {
            console.error("Failed to fetch history:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);
    // const pushUpsPlayer = useVideoPlayer(pushUpsVideoSource, (player) => {
    //     player.loop = true;
    //     player.play();
    // });

    const renderHistoryItem = ({ item }: { item: any }) => (
        <View style={[, {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 30,

            padding: 20,
            marginBottom: 20,
            backgroundColor: 'white',
            borderRadius: 10,

            // iOS shadow
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 5,
            },
            shadowOpacity: 0.2,
            shadowRadius: 8,
        }]}>
            <View style={[{
                flexDirection: "row",
                gap: 30,
            }]}>
                <View style={{
                    gap: 10,
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                    <Image source={require("../../../assets/downloadedIcons/shield-line.png")}
                        style={{
                            height: 20,
                            width: 20,
                        }}
                    />
                    <Text>{item.pushUpCount || 0}</Text>
                </View>
                <View style={{
                    gap: 10,
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                    <Image source={require("../../../assets/downloadedIcons/timer-line.png")}
                        style={{
                            height: 20,
                            width: 20,
                        }}
                    />
                    <Text>60s</Text>
                </View>
                <View style={{
                    gap: 10,
                    alignItems: 'center'
                }}>
                    <Image source={require("../../../assets/downloadedIcons/medalIcon.png")}
                        style={{
                            height: 20,
                            width: 20,
                        }}
                    />
                    <Text>{item.TacticalPoints}</Text>
                </View>
            </View>
            <View>
                <Text style={{
                    fontWeight: "200",
                    fontSize: 12
                }}>{new Date(item.timestamp).toLocaleString()}</Text>
            </View>
        </View>
    );


    return (
        <View style={styles.container}>
            {/* <View style={{
                height: "22%",
                backgroundColor: Theme.colors.primaryColor,
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
                        <Image source={require("../../../assets/downloadedIcons/fast.png")}
                            style={{
                                width: 20,
                                height: 20
                            }}
                        />
                        <Text style={{
                            color: "white"
                        }}>Back</Text>
                    </TouchableOpacity>
                </View>
                <View>
                    <Text style={{
                        fontWeight: "700",
                        fontSize: 25,
                        color: "white"
                    }}>SIT UP HISTORY</Text>
                </View>
            </View> */}
            <View>
                <View style={styles.headerContainer}>
                    <Svg height="200" width={screenWidth} style={styles.svg}>
                        <Defs>
                            <SvgLinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <Stop offset="0%" stopColor="#FFD700" stopOpacity="1" />
                                <Stop offset="100%" stopColor="#FFA500" stopOpacity="1" />
                            </SvgLinearGradient>
                        </Defs>
                        <Path
                            d={createCurvedPath()}
                            fill="url(#grad)"
                        />
                    </Svg>

                    {/* Content overlay - positioned absolutely to center over SVG */}
                    <View style={styles.contentOverlay}>
                        <View style={{
                            alignItems: "center",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            paddingHorizontal: 20,
                        }}>
                            <View>
                                <Text></Text>
                            </View>
                            <Text style={{
                                color: "white",
                                left: 17,
                                fontSize: 18,
                                fontWeight: "700"
                            }}>History</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    navigation.openDrawer();
                                }}
                            >
                                <Image source={require("../../../assets/downloadedIcons/notification.png")}
                                    style={{
                                        height: 30,
                                        width: 30,
                                        resizeMode: "contain"
                                    }}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
            {loading ? (
                <View style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    bottom: 60
                }}>
                    <ActivityIndicator size={"large"} color={Theme.colors.primaryColor} />
                    <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 5
                    }}>
                        <Text>Loading history</Text>
                        <LottieView
                            source={require("../../../assets/ExerciseGifs/Animation - 1747754050109.json")}
                            style={{
                                height: 40,
                                width: 40
                            }}
                            resizeMode="contain"
                            loop={true}
                            autoPlay={true}
                        />
                    </View>
                </View>
            ) : history.length === 0 ? (
                <View style={{
                    flexDirection: "row",
                    gap: 5,
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    bottom: 60,
                }}>
                    <Text style={{
                        fontSize: 17,
                    }}>No history yet</Text>
                    <LottieView
                        source={require("../../../assets/ExerciseGifs/Animation - 1747754050109.json")}
                        style={{
                            height: 40,
                            width: 40,
                        }}
                        resizeMode="contain"
                        loop={true}
                        autoPlay={true}
                    />
                </View>
            ) : (
                <View style={{
                    flex: 3,
                    padding: 20,
                    gap: 15
                }}>
                    <FlatList
                        data={history}
                        keyExtractor={(item) => item.id}
                        renderItem={renderHistoryItem}
                    />
                </View>
            )}
        </View>
    )
}

export default SitUpHistory;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        position: 'relative',
        justifyContent: "center",
        backgroundColor: 'transparent'
    },
    contentOverlay: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        bottom: 0,
        flex: 1,
        justifyContent: 'flex-start',
        gap: 20,
    },
    svg: {
        padding: 20,
    },
    shadowWrapper: {
        justifyContent: "center",
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.8,
        shadowRadius: 15,
        elevation: 12,
        zIndex: 1,
    },
})