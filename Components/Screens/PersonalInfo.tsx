import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Theme } from "../Branding/Theme";
import LottieView from "lottie-react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";

interface IPersonalInfoProps {
    navigation?: any;
}

const PersonalInfo = ({
    navigation
}: IPersonalInfoProps) => {
    return (
        <View style={styles.container}>
            <View style={{
                flex: 1,
                backgroundColor: Theme.colos.primaryColor,
                padding: 20,
                justifyContent: "flex-end"
            }}>
                <View>
                    <Text style={{
                        fontWeight: '600',
                        color: "white",
                        fontSize: 40,
                    }}>Personal Info</Text>
                    <Text style={{
                        color: "white",
                        fontSize: 18,
                        fontWeight: "200"
                    }}>Fill in your infomation</Text>
                </View>
            </View>
            <View style={{
                flex: 3,
                padding: 20
            }}>
                <View style={{
                    paddingBottom: 30,
                    justifyContent: "space-between",
                    flex: 1
                }}>
                    <View style={{
                        gap: 10
                    }}>
                        <View style={{
                            gap: 5
                        }}>
                            <View style={[styles.textinput_container, {
                                marginBottom: 5
                            }]}>
                                <Feather name="user" size={20} />
                                <TextInput
                                    style={styles.textinput}
                                    placeholderTextColor={"#8c8c8e"}
                                    placeholder="FirstName"
                                />
                            </View>
                            <View style={[styles.textinput_container, {
                                marginBottom: 5
                            }]}>
                                <Feather name="user" size={20} />
                                <TextInput
                                    style={styles.textinput}
                                    placeholderTextColor={"#8c8c8e"}
                                    placeholder="LastName"
                                />
                            </View>
                            {/* {touched.email && errors.email && (
                                <Text style={{ color: "red" }}>{errors.email}</Text>
                            )} */}
                        </View>
                        <View style={{
                            gap: 5
                        }}>
                            <View style={styles.textinput_container}>
                                <MaterialIcons
                                    name="numbers"
                                    size={20}
                                />
                                <TextInput
                                    placeholderTextColor={"#8c8c8e"}
                                    style={styles.textinput}
                                    placeholder="Service Number"
                                />
                                <TouchableOpacity style={{
                                }}
                                // onPress={() => {
                                //     setTogglePasswordVisibility(!togglePasswordVisibility)
                                // }}
                                >
                                </TouchableOpacity>
                            </View>
                            {/* {touched.password && errors.password && (
                                <Text style={{ color: "red" }}>{errors.password}</Text>
                            )} */}
                        </View>
                    </View>
                    <View>
                        <TouchableOpacity style={styles.btn}>
                            <Text style={{
                                color: "white"
                            }}>Continue</Text>
                            <Image
                                source={require("../../assets/downloadedIcons/fast.png")}
                                style={{
                                    height: 24,
                                    width: 24
                                }}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    )
}

export default PersonalInfo;


const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    btn: {
        backgroundColor: Theme.colos.primaryColor,
        flexDirection: "row",
        justifyContent: "space-between",
        borderRadius: 5,
        alignItems: "center",
        padding: 20
    },
    textinput_container: {
        flexDirection: "row",
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: Theme.colos.lightPrimary,
        position: 'relative',
    },
    textinput: {
        flex: 1,
        paddingVertical: 20,
        paddingHorizontal: 10,
        fontFamily: Theme.Montserrat_Font.Mont500,
        fontSize: 14,
    },
})