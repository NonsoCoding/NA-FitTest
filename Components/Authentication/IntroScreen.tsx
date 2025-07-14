import React, { useState } from "react";
import {
    Image,
    ImageBackground,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions,
    SafeAreaView
} from "react-native";
import { Theme } from "../Branding/Theme";
import AppIntroSlider from "react-native-app-intro-slider";

interface IntroIprops {
    navigation?: any;
}

type Slide = {
    key: string;
    title: string;
    text: string;
};

const { width, height } = Dimensions.get('window');

const IntroScreen = ({ navigation }: IntroIprops) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const slides: Slide[] = [
        {
            key: "slide1",
            title: "Welcome to the Future of Fitness",
            text: "Meet your new fitness companion — powered by advanced sensors that accurately measure your push-ups, sit-ups, sprints, walks, and runs. No more guessing. Just real, reliable progress."
        },
        {
            key: "slide2",
            title: "Fitness That Adapts to You",
            text: "Our intelligent motion sensors track every rep and step, offering real-time feedback and form correction. Whether you're sprinting or doing core workouts, it's like having a coach in your pocket"
        },
        {
            key: "slide3",
            title: "Go Beyond the Basics",
            text: "Personalized fitness routines. Performance analytics. Progress history & goal tracking. Wristwatch integration for heart rate & vitals Get stronger, smarter, and stay motivated — every day."
        }
    ];

    const _renderItem = ({ item }: any) => {
        return (
            <View style={styles.slide}>
                <View style={styles.slideBox}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.text}>{item.text}</Text>
                </View>
                <View style={styles.customPagination}>
                    {slides.map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.dot,
                                i === activeIndex ? styles.activeDot : styles.inactiveDot,
                            ]}
                        />
                    ))}
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.safeArea]}>
            <ImageBackground
                source={require("../../assets/BackgroundImages/Background.png")}
                style={[styles.container, , {
                    paddingBottom: 20
                }]}
                resizeMode="cover"
            >
                <StatusBar
                    barStyle="light-content"
                    backgroundColor="transparent"
                    translucent={true}
                />

                <View style={styles.sliderWrapper}>
                    <AppIntroSlider
                        data={slides}
                        renderItem={_renderItem}
                        showNextButton={false}
                        showDoneButton={false}
                        showSkipButton={false}
                        onSlideChange={(index: number) => setActiveIndex(index)}
                        renderPagination={() => <View />} // disable default pagination
                        activeDotStyle={styles.sliderActiveDot}
                        dotStyle={styles.sliderDot}
                    />
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.btn}
                        onPress={() => navigation.navigate("LoginScreen")}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.btn_text}>Get started</Text>
                        <Image
                            source={require("../../assets/BackgroundImages/VectorRight.png")}
                            style={styles.icon}
                        />
                    </TouchableOpacity>
                    <Text style={styles.copy}>© 2025 404services. All rights reserved.</Text>
                </View>
            </ImageBackground>
        </View>
    );
};

export default IntroScreen;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    container: {
        flex: 1,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0,
    },
    sliderWrapper: {
        flex: 1,
        paddingTop: Platform.OS === 'ios' ? 60 : 80,
        paddingBottom: 20,
    },
    slide: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    slideBox: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        paddingHorizontal: 30,
        paddingVertical: 40,
        minHeight: height * 0.35,
        maxHeight: height * 0.45,
        width: width * 0.9,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 20,
    },
    customPagination: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 30,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginHorizontal: 8,
    },
    activeDot: {
        backgroundColor: "white",
    },
    inactiveDot: {
        backgroundColor: "rgba(255, 255, 255, 0.5)",
    },
    title: {
        fontSize: Platform.OS === 'ios' ? 24 : 22,
        fontWeight: "700",
        color: "#333",
        textAlign: "center",
        lineHeight: Platform.OS === 'ios' ? 32 : 30,
        marginBottom: 15,
    },
    text: {
        fontSize: Platform.OS === 'ios' ? 16 : 15,
        textAlign: "center",
        color: "#666",
        lineHeight: Platform.OS === 'ios' ? 24 : 22,
        fontWeight: "400",
    },
    footer: {
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === 'ios' ? 30 : 40,
        backgroundColor: 'transparent',
    },
    btn: {
        backgroundColor: "white",
        paddingHorizontal: 30,
        paddingVertical: 18,
        borderRadius: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    btn_text: {
        color: "#333",
        fontSize: Platform.OS === 'ios' ? 16 : 16,
        fontWeight: "400",
    },
    icon: {
        width: 14,
        height: 14,
        resizeMode: "contain",
        tintColor: "#333",
    },
    copy: {
        alignSelf: "center",
        fontSize: Platform.OS === 'ios' ? 13 : 12,
        color: "rgba(255, 255, 255, 0.8)",
        fontWeight: "400",
    },
    // Styles for AppIntroSlider's built-in pagination (as backup)
    sliderActiveDot: {
        backgroundColor: "white",
        width: 12,
        height: 12,
    },
    sliderDot: {
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        width: 12,
        height: 12,
    },
});