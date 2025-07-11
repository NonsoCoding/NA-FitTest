import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Theme } from "../Branding/Theme";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { DrawerParamList } from "../nav/type";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../../Firebase/Settings";
import { FlatList } from "react-native-gesture-handler";
import { Feather } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

interface IHistoryProps {

}

const { width: screenWidth } = Dimensions.get('window');

const History = ({

}: IHistoryProps) => {

    const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
    const [history, setHistory] = useState<{ type: string, data: any[] }[]>([]);
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


    const categoryLabels: { [key: string]: string } = {
        SitUps: "Sit Ups",
        PushUps: "Push Ups",
        PullUps: "Pull Ups",
        Sprint: "300 Meter Sprint",
        Runs: "1.5 Meter run"
    };

    const fetchHistory = async () => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const categories = ["SitUps", "PushUps", "PullUps", "Sprint", "Runs"];
            const allHistory: any[] = [];

            for (const category of categories) {
                const querySnapshot = await getDocs(collection(db, `UserDetails/${user.uid}/${category}`));
                const results: any[] = [];

                querySnapshot.forEach((doc) => {
                    results.push({
                        id: doc.id,
                        type: categories,
                        ...doc.data()
                    });
                });

                if (results.length > 0) {
                    results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    allHistory.push({ type: category, data: results });
                }
            }

            setHistory(allHistory);
        } catch (error) {
            console.error("Failed to fetch history:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);


    return (
        <View style={styles.container}>
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
                                <Image source={require("../../assets/downloadedIcons/notification.png")}
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
                            source={require("../../assets/ExerciseGifs/Animation - 1747754050109.json")}
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
                        source={require("../../assets/ExerciseGifs/Animation - 1747754050109.json")}
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
                <ScrollView>
                    <View style={{
                        flex: 3,
                        padding: 20,
                        gap: 15
                    }}>
                        {history.map((section) => (
                            <View key={section.type} style={{ marginBottom: 0 }}>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
                                    {categoryLabels[section.type] || section.type}
                                </Text>
                                {section.data.map((item: any, index: number) => (
                                    <View
                                        key={item.id || `${section.type}-${index}`}
                                        style={{
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
                                        }}>
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                gap: 30,
                                            }}
                                        >
                                            <View style={{
                                                gap: 10,
                                                justifyContent: "center",
                                                alignItems: "center"
                                            }}>
                                                <Image source={require("../../assets/downloadedIcons/shield-line.png")}
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
                                                <Image source={require("../../assets/downloadedIcons/timer-line.png")}
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
                                                <Image source={require("../../assets/downloadedIcons/medalIcon.png")}
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
                                                fontWeight: '200',
                                                fontSize: 12
                                            }}>{new Date(item.timestamp).toLocaleString()}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>
                </ScrollView>
            )}
        </View>
    )
}

export default History;

const styles = StyleSheet.create({
    container: {
        flex: 1
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