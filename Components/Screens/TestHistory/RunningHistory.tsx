import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { FlatList } from "react-native-gesture-handler";
import { DrawerParamList } from "../../nav/type";
import { auth, db } from "../../../Firebase/Settings";
import { Theme } from "../../Branding/Theme";

interface IHistoryProps {

}

const RunningHistory = ({

}: IHistoryProps) => {

    const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();

    const [history, setHistory] = useState<any[]>([]);

    const fetchHistory = async () => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const querySnapshot = await getDocs(collection(db, `UserDetails/${user.uid}/Runs`));
            const results: any[] = [];
            querySnapshot.forEach((doc) => {
                results.push({ id: doc.id, ...doc.data() });
            });
            // Sort by timestamp (optional)
            results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setHistory(results);
        } catch (error) {
            console.error("Failed to fetch history:", error);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const renderHistoryItem = ({ item }: { item: any }) => (
        <View style={{
            flexDirection: "row",
            gap: 30,
            borderWidth: 1,
            padding: 20,
            marginBottom: 20,
            alignItems: "center",
            justifyContent: "space-between"
        }}>
            <View style={{
                flexDirection: "row",
                gap: 30,
            }}>
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
                    <Text>{item.distance || 0}(m)</Text>
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
                    <Text>{item.elapsedTime}s</Text>
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
                    fontSize: 12,
                }}>{new Date(item.timestamp).toLocaleString()}</Text>
            </View>
        </View>
    );

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
                    }}>1.5 MILE RUN HISTORY</Text>
                </View>
            </View>
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
        </View>
    )
}

export default RunningHistory;

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
})