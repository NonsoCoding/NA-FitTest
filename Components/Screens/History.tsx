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
import { LinearGradient } from "expo-linear-gradient";

interface IHistoryProps {

}

const { width: screenWidth } = Dimensions.get('window');

const History = ({

}: IHistoryProps) => {

    const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
    const [history, setHistory] = useState<{ type: string, data: any[] }[]>([]);
    const [loading, setLoading] = useState(true);

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
            <LinearGradient
                colors={['#FFD700', '#FFA500']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                    height: "20%",
                    paddingTop: 50,
                    paddingBottom: 15,
                    borderBottomRightRadius: 10,
                    borderBottomLeftRadius: 10,
                    paddingHorizontal: 20,
                    justifyContent: "space-between"
                }}
            >
                <TouchableOpacity
                    onPress={() => {
                        navigation.openDrawer();
                    }}
                    style={{
                        alignSelf: "flex-end"
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
                <View style={{
                }}>
                    <Text style={{
                        color: "white",
                        fontSize: 30,
                        fontWeight: "700"
                    }}>History</Text>
                </View>
            </LinearGradient>
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
                                            shadowOpacity: 0.1,
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
    }
})