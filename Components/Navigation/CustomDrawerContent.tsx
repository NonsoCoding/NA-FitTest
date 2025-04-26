import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform, StatusBar, Modal } from 'react-native';
import { DrawerContentComponentProps, DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { Theme } from '../Branding/Theme';


type CustomDrawerContentProps = DrawerContentComponentProps & {
    navigation: DrawerNavigationProp<any, any>;
};

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
    const navigation = props.navigation;

    const [isLogOutModalVisible, setIsLogOutModalVisible] = useState(false);


    const signingOut = async (sessionId: string) => {
        navigation.reset({
            index: 0,
            routes: [{ name: "Intro" }],
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.profileSection}>
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10
                }}>
                    <Image
                        source={require("../../assets/downloadedIcons/profile.png")}
                        style={{
                            height: 50,
                            width: 50,
                            resizeMode: "contain"
                        }}
                    />
                    <View>
                        <Text style={{
                            fontSize: 22,
                            fontWeight: 600
                        }}>Timothy Obi</Text>
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
                            <Text>109</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={() => navigation.closeDrawer()}
                >
                    <Image source={require("../../assets/downloadedIcons/close.png")}
                        style={{
                            width: 30,
                            height: 30,
                            resizeMode: "contain"
                        }}
                    />
                </TouchableOpacity>
            </View>
            <View style={{
                padding: 20,
                gap: 10
            }}>
                <TouchableOpacity
                    onPress={() => props.navigation.navigate('')}
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 15,
                        paddingVertical: 10,
                        justifyContent: "space-between"
                    }}
                >
                    <Text style={{}}>Admin Dashbaord</Text>
                    <Image source={require("../../assets/downloadedIcons/user-settings-line.png")}
                        style={{
                            width: 20,
                            height: 20,
                            resizeMode: "contain"
                        }}
                    />
                </TouchableOpacity>
                <View style={{
                    borderWidth: 0.5,
                    borderColor: Theme.colos.second_primary
                }}></View>
                <TouchableOpacity
                    onPress={() => props.navigation.navigate('Profile')}
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 15,
                        paddingVertical: 10,
                        justifyContent: "space-between"
                    }}
                >
                    <Text style={{}}>My Profile</Text>
                    <Image source={require("../../assets/downloadedIcons/user-shared-fill.png")}
                        style={{
                            width: 20,
                            height: 20,
                            resizeMode: "contain"
                        }}
                    />
                </TouchableOpacity>
                <View style={{
                    borderWidth: 0.5,
                    borderColor: Theme.colos.second_primary
                }}></View>
                <TouchableOpacity
                    onPress={() => props.navigation.navigate('HomePage')}
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 15,
                        paddingVertical: 10,
                        justifyContent: "space-between"
                    }}
                >
                    <Text style={{}}>Home</Text>
                    <Image source={require("../../assets/downloadedIcons/home-9-fill.png")}
                        style={{
                            width: 20,
                            height: 20,
                            resizeMode: "contain"
                        }}
                    />
                </TouchableOpacity>
                <View style={{
                    borderWidth: 0.5,
                    borderColor: Theme.colos.second_primary
                }}></View>
                <TouchableOpacity
                    onPress={() => props.navigation.navigate('History')}
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 10,
                        paddingHorizontal: 15,
                        justifyContent: "space-between"
                    }}
                >
                    <Text style={{}}>History</Text>
                    <Image source={require("../../assets/downloadedIcons/history-line (1).png")}
                        style={{
                            width: 20,
                            height: 20,
                            resizeMode: "contain"
                        }}
                    />
                </TouchableOpacity>
                <View style={{
                    borderWidth: 0.5,
                    borderColor: Theme.colos.second_primary
                }}></View>
                <TouchableOpacity
                    onPress={() => {
                        setIsLogOutModalVisible(true);
                    }}
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 15,
                        paddingVertical: 10,
                        justifyContent: "space-between"
                    }}
                >
                    <Text style={{}}>Logout</Text>
                    <Image source={require("../../assets/downloadedIcons/logout-box-r-line.png")}
                        style={{
                            width: 20,
                            height: 20,
                            resizeMode: "contain"
                        }}
                    />
                </TouchableOpacity>
                <View style={{
                    borderWidth: 0.5,
                    borderColor: Theme.colos.second_primary
                }}></View>
            </View>
            <Modal
                visible={isLogOutModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => {

                }}
            >
                <View style={{
                    justifyContent: "flex-end",
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    flex: 1,
                }}>
                    <View style={{
                        backgroundColor: "white",
                        height: 250,
                        borderRadius: 20,
                        padding: 20,
                        gap: 30,
                        justifyContent: "center"
                    }}>
                        <TouchableOpacity style={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            padding: 13,
                        }}
                            onPress={() => {
                                setIsLogOutModalVisible(false);
                            }}
                        >
                            <Text style={{
                                color: Theme.colos.primaryColor,
                                fontSize: 18
                            }}>cancel</Text>
                        </TouchableOpacity>
                        <View style={{
                            alignItems: 'center'
                        }}>
                            <Text style={{
                                fontFamily: Theme.Montserrat_Font.Mont600,
                                fontSize: 18
                            }}>Are you sure you want to logout</Text>
                            <Text style={{
                                fontFamily: Theme.Montserrat_Font.Mont600,
                                fontSize: 18
                            }}>from your account?</Text>
                        </View>
                        <TouchableOpacity style={styles.logout_btn}
                            onPress={() => {
                                signingOut("SignedOut");
                            }}
                        >
                            <Text style={styles.logout_text}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colos.backgroundColor,
        marginTop: Platform.OS === "android" ? StatusBar.currentHeight : null,
    },
    profileSection: {
        alignItems: 'center',
        padding: 20,
        gap: 10,
        paddingTop: 60,
        justifyContent: "space-between",
        flexDirection: "row",
    },
    logout_btn: {
        backgroundColor: Theme.colos.primaryColor,
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
});

export default CustomDrawerContent;
