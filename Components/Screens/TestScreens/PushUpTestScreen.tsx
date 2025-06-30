import { Alert, Image, ImageBackground, KeyboardAvoidingView, Linking, Modal, Platform, StyleSheet, Text, TextInput, Touchable, TouchableOpacity, View } from "react-native";
import { Theme } from "../../Branding/Theme";

interface ITestProps {
    navigation: any;
}

const PushUpsTestScreen = ({
    navigation
}: ITestProps) => {

    return (
        <View style={{
            flex: 1,
            backgroundColor: Theme.colors.backgroundColor
        }}>
            <View style={{
                backgroundColor: Theme.colors.primaryColor,
                justifyContent: "flex-end",
                gap: 20,
                padding: 20,
                height: "14%",
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
                        <Image source={require("../../../assets/downloadedIcons/back1.png")}
                            style={{
                                width: 20,
                                height: 20
                            }}
                        />
                    </TouchableOpacity>
                    <Text style={{
                        color: "white"
                    }}>PUSH-UPS (TEST MODE)</Text>
                    <TouchableOpacity
                        onPress={() => {
                            navigation.navigate("PushUpHistory")
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
    )
}

export default PushUpsTestScreen;

const styles = StyleSheet.create({

})