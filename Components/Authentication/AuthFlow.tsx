import { useEffect, useRef, useState } from "react";
import { Image, ImageBackground, ImageSourcePropType, Modal, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import LoginModal from "./Login";
import IntroModal from "./IntroScreen";
import SignUpModal from "./SignUp";
import { ProgressBar } from "react-native-paper";
import { Theme } from "../Branding/Theme";
import { Animated } from 'react-native';


interface ISignUpProps {
    navigation?: any;
}

const AuthFlow = ({
    navigation
}: ISignUpProps) => {

    const [isIntroModalVisible, setIsIntroModalVisible] = useState(true);
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
    const [isSignUpModalVisible, setIsSignUpModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const headerPosition = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const [bgImage, setBgImage] = useState<ImageSourcePropType>(require("../../assets/BackgroundImages/bg4.png"));

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 1) {
                    clearInterval(interval);
                    setIsLoading(false);
                }
                return prev + 0.05;
            });

        }, 150);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        Animated.timing(headerPosition, {
            toValue: (isLoginModalVisible || isSignUpModalVisible) ? -150 : 0,
            duration: 300,
            useNativeDriver: true
        }).start();
    }, [isLoginModalVisible, isSignUpModalVisible]);

    const changeBackground = () => {
        setBgImage(prev =>
            prev === require("../../assets/BackgroundImages/bg4.png")
                ? require("../../assets/BackgroundImages/bg3.png")
                : require('../../assets/BackgroundImages/bg4.png')
        );
    }

    const handleSwicthToSignUpFromLogin = () => {
        setIsLoginModalVisible(false);
        setTimeout(() => {
            setIsSignUpModalVisible(true);
        }, 500)
    }

    const handleSwicthToLoginFromSignUp = () => {
        setIsSignUpModalVisible(false);
        setTimeout(() => {
            setIsLoginModalVisible(true);
        }, 500)
    }

    const handleSwicthToSignUpFromIntro = () => {
        setIsIntroModalVisible(false);
        setTimeout(() => {
            setIsSignUpModalVisible(true);
        }, 500)
    }

    const handleSwicthToLoginFromIntro = () => {
        setIsIntroModalVisible(false);
        changeBackground();
        setTimeout(() => {
            setIsLoginModalVisible(true);
        }, 500)
    }

    return (
        <View style={{
            flex: 1,
        }}>
            {isLoading ? (
                <View style={styles.loaderContainer}>
                    <Text style={{ fontSize: 40, fontFamily: Theme.Montserrat_Font.Mont900, color: "white" }}>TacticalPT</Text>
                    <ProgressBar progress={progress} color="white" style={{
                        height: 7,
                        width: 140,
                        borderRadius: 20,
                        backgroundColor: "black"
                    }} />
                    <Text style={{
                        color: "white",
                        fontSize: 10,
                        fontFamily: Theme.Montserrat_Font.Mont300
                    }}>Loading...</Text>
                </View>
            ) : (
                <ImageBackground source={bgImage}
                    style={styles.container}
                    resizeMode="cover"
                >
                    <Animated.View
                        style={{
                            transform: [{ translateY: headerPosition }],
                            paddingHorizontal: 40,
                            marginBottom: 20,
                        }}
                    >
                        <Text style={styles.intro_header}>
                            Train your body elevate your spirit
                        </Text>
                    </Animated.View>
                    <IntroModal
                        onClose={() => {
                            setIsIntroModalVisible(false);
                        }}
                        isVisible={isIntroModalVisible}
                        onSwicthToSignUp={handleSwicthToSignUpFromIntro}
                        onSwitchToLogin={handleSwicthToLoginFromIntro}
                    />
                    <LoginModal
                        onClose={() => {
                            setIsLoginModalVisible(false)
                        }}
                        isVisible={isLoginModalVisible}
                        onSwitchToSignUp={handleSwicthToSignUpFromLogin}
                    />
                    <SignUpModal
                        onClose={() => {
                            setIsSignUpModalVisible(false);
                        }}
                        isVisible={isSignUpModalVisible}
                        onSwitchToLogin={handleSwicthToLoginFromSignUp}
                    />
                </ImageBackground>
            )}
        </View>
    )
}

export default AuthFlow;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        gap: 50
    },
    intro_header: {
        fontSize: 40,
        color: "white",
        fontWeight: "500",
        fontFamily: Theme.MuseoModerno_Font.Muse900,
        textAlign: "center",
        lineHeight: 60
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "black",
        gap: 8
    }
})