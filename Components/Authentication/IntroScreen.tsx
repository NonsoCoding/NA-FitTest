import React, { useState } from "react";
import { Image, ImageBackground, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
            text: "Our intelligent motion sensors track every rep and step, offering real-time feedback and form correction. Whether you're sprinting or doing core workouts, it’s like having a coach in your pocket"
        },
        {
            key: "slide3",
            title: "Go Beyond the Basics",
            text: "Personalized fitness routines. Performance analytics. Progress history & goal tracking. Wristwatch integration for heart rate & vitals Get stronger, smarter, and stay motivated — every day."
        }
    ]

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
        <ImageBackground
            source={require("../../assets/BackgroundImages/Background.png")}
            style={styles.container}
            resizeMode="cover"
        >
            <View style={styles.sliderWrapper}>
                <View style={{
                    flex: 1,
                    top: 100
                }}>
                    <AppIntroSlider
                        data={slides}
                        renderItem={_renderItem}
                        showNextButton={false}
                        showDoneButton={false}
                        showSkipButton={false}
                        onSlideChange={(index: number) => setActiveIndex(index)}
                        renderPagination={() => (
                            <View></View>
                        )} // disable default pagination
                    />
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate("LoginScreen")}>
                    <Text style={styles.btn_text}>Get started</Text>
                    <Image
                        source={require("../../assets/BackgroundImages/VectorRight.png")}
                        style={styles.icon}
                    />
                </TouchableOpacity>
                <Text style={styles.copy}>© 2025 404services. All rights reserved.</Text>
            </View>
        </ImageBackground>
    );
};

export default IntroScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        paddingBottom: 30
    },
    btn: {
        backgroundColor: "white",
        padding: 30,
        borderRadius: 5,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    btn_text: {
        color: "black",
        fontSize: 16,
    },
    slide: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
    },
    slideBox: {
        backgroundColor: "white",
        padding: 40,
        height: "35%",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
    },
    customPagination: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 6,
    },
    activeDot: {
        backgroundColor: "white",
    },
    inactiveDot: {
        backgroundColor: "lightgrey",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
    },
    text: {
        fontSize: 16,
        textAlign: "center",
        marginTop: 10,
    },
    sliderWrapper: {
        flex: 1,
    },
    footer: {
        paddingHorizontal: 20,
        paddingBottom: 30,
        backgroundColor: 'transparent',
    },
    icon: {
        width: 20,
        height: 20,
        resizeMode: "contain",
    },

    copy: {
        alignSelf: "center",
        marginTop: 10,
        fontSize: 12,
        color: "white"
    },

});