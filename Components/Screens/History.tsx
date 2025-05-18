import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Theme } from "../Branding/Theme";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { DrawerParamList } from "../nav/type";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../../Firebase/Settings";
import { FlatList } from "react-native-gesture-handler";

interface IHistoryProps {

}


const History = ({

}: IHistoryProps) => {

    const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
    const [history, setHistory] = useState<{ type: string, data: any[] }[]>([]);

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
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);


    return (
        <View style={styles.container}>
            <View style={{
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
                    top: 20,
                    justifyContent: "flex-end",
                }}>
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
                        fontWeight: "700",
                        fontSize: 40,
                        color: "white"
                    }}>HISTORY</Text>
                </View>
            </View>
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
                                        borderWidth: 1,
                                        padding: 20,
                                        marginBottom: 20
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
        </View>
    )
}

export default History;

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
})