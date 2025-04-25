import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Theme } from "../Branding/Theme";
import { useState } from "react";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { DrawerParamList } from "../nav/type";
import { useNavigation } from "@react-navigation/native";

interface IProfileProps {

}


const EditDetails = ({

}: IProfileProps) => {

    const [isHeightEditing, setIsHeightEditing] = useState(false);
    const [isWeightEditing, setIsWeightEditing] = useState(false);
    const [isDateOfBirthEditing, setIsDateOfBirthEditing] = useState(false);
    const [isFullNameEditing, setIsFullNameEditing] = useState(false);
    const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();


    return (
        <View style={styles.container}>
            <View style={{
                height: "22%",
                backgroundColor: Theme.colos.primaryColor,
                padding: 20,
                paddingTop: 60,
                justifyContent: "space-between",
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
                    }}>EDIT DETAILS</Text>
                </View>
            </View>
            <View style={{
                flex: 3,
                padding: 20,
                gap: 20
            }}>
                <View style={{
                    gap: 10
                }}>
                    <View style={{
                        gap: 5
                    }}>
                        <Text style={{
                            color: Theme.colos.mediumPrimary
                        }}>Full name</Text>
                        <View style={styles.textinput_container}>
                            <TextInput
                                placeholder="Timothy Obi"
                                placeholderTextColor={Theme.colos.second_primary}
                                style={styles.textinput}
                                editable={isHeightEditing}
                            />
                            <TouchableOpacity onPress={() => setIsHeightEditing(prev => !prev)}>
                                <Image source={require("../../assets/downloadedIcons/edit-line.png")}
                                    style={{
                                        height: 25,
                                        width: 25
                                    }}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{
                        gap: 5
                    }}>
                        <Text style={{
                            color: Theme.colos.mediumPrimary
                        }}>email</Text>
                        <View style={styles.textinput_container}>
                            <TextInput
                                placeholder="timothyobi494@gmail.com"
                                placeholderTextColor={Theme.colos.second_primary}
                                style={styles.textinput}
                                editable={isWeightEditing}
                            />
                            <TouchableOpacity onPress={() => setIsWeightEditing(prev => !prev)}>
                                <Image source={require("../../assets/downloadedIcons/edit-line.png")}
                                    style={{
                                        height: 25,
                                        width: 25
                                    }}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{
                        gap: 5
                    }}>
                        <Text style={{
                            color: Theme.colos.mediumPrimary
                        }}>Password</Text>
                        <View style={styles.textinput_container}>
                            <TextInput
                                placeholder="************"
                                placeholderTextColor={Theme.colos.second_primary}
                                style={styles.textinput}
                                editable={isDateOfBirthEditing}
                            />
                            <TouchableOpacity onPress={() => setIsDateOfBirthEditing(prev => !prev)}>
                                <Image source={require("../../assets/downloadedIcons/edit-line.png")}
                                    style={{
                                        height: 25,
                                        width: 25
                                    }}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={() => {

                    }}
                    style={[styles.continue_email_button, {
                        padding: 20
                    }]}>
                    <Text style={styles.email_button_text}>Save changes</Text>
                    <Image source={require("../../assets/Icons/fast-forward.png")}
                        style={{
                            height: 20,
                            width: 20
                        }}
                    />
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default EditDetails;

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    textinput_container: {
        borderWidth: 1,
        padding: 10,
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 5,
        borderColor: Theme.colos.black
    },
    textinput: {
        flex: 1,
        paddingVertical: 10
    },
    continue_email_button: {
        backgroundColor: Theme.colos.primaryColor,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 15,
        borderRadius: 5,
        gap: 15
    },
    email_button_text: {
        fontSize: 15,
        fontFamily: Theme.Montserrat_Font.Mont500,
        color: "white"
    },
})