import {
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface IAboutProps {
    navigation: any;
}

const About = ({ navigation }: IAboutProps) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>NA FitTest Legal Documentation</Text>
                <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.notificationIcon}>
                    <Image
                        source={require("../../assets/downloadedIcons/notification.png")}
                        style={styles.icon}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scroll}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Copyright Notice</Text>
                    <View style={styles.item}>
                        <Text style={styles.label}>App Name:</Text>
                        <Text style={styles.value}>NA FitTest</Text>
                    </View>
                    <View style={styles.item}>
                        <Text style={styles.label}>Company:</Text>
                        <Text style={styles.value}>404services</Text>
                    </View>
                    <View style={styles.item}>
                        <Text style={styles.label}>Version:</Text>
                        <Text style={styles.value}>1.0.0</Text>
                    </View>
                    <View style={styles.item}>
                        <Text style={styles.label}>Contact:</Text>
                        <Text style={styles.value}>404services1@gmail.com</Text>
                    </View>

                    <Text style={styles.subtext}>© 2025 404services. All rights reserved.</Text>

                    <Text style={styles.paragraph}>
                        NA FitTest, including but not limited to its source code, design,
                        features, content, branding, and associated assets, is the exclusive
                        intellectual property of 404services. Unauthorized reproduction,
                        distribution, modification, or commercial use of any part of the
                        application is strictly prohibited without prior written consent from
                        404services.
                    </Text>

                    <Text style={styles.paragraph}>
                        All third-party trademarks, logos, or content used in this app are the
                        property of their respective owners and used under license or fair use
                        provisions.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Disclaimer</Text>
                    <Text style={styles.paragraph}>
                        NA FitTest is designed for general fitness assessment and educational
                        purposes only. It is not a substitute for professional medical advice,
                        diagnosis, or treatment.
                    </Text>
                    <Text style={styles.paragraph}>
                        Always consult with a qualified healthcare provider before starting any
                        fitness program. 404services assumes no responsibility for injuries or
                        health issues resulting from the use of this app.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Terms of Service</Text>
                    <Text style={styles.paragraph}>By using NA FitTest, you agree to:</Text>
                    <View style={styles.bulletList}>
                        <Text style={styles.bullet}>• Use the app only for lawful purposes.</Text>
                        <Text style={styles.bullet}>
                            • Not attempt to reverse-engineer, duplicate, or resell any part of
                            the application.
                        </Text>
                        <Text style={styles.bullet}>
                            • Respect all intellectual property rights held by 404services.
                        </Text>
                    </View>
                    <Text style={styles.paragraph}>
                        We reserve the right to modify or discontinue the app at any time
                        without notice.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Privacy Policy</Text>
                    <Text style={styles.paragraph}>
                        NA FitTest does not collect any personally identifiable information
                        (PII) unless explicitly provided by the user through forms or features.
                    </Text>
                    <Text style={styles.paragraph}>
                        We may collect anonymous usage statistics to improve the app’s
                        functionality and user experience. No data is sold or shared with third
                        parties unless required by law.
                    </Text>
                    <Text style={styles.paragraph}>
                        If any personal data is ever collected (e.g., email address for
                        feedback), it will be securely stored and used solely for communication
                        purposes related to the app.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.paragraph}>For questions or concerns, contact us at:</Text>
                    <Text style={[styles.value, { color: "#007BFF", fontSize: 16 }]}>
                        404services1@gmail.com
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

export default About;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: Platform.OS === "android" ? 60 : 80,
        backgroundColor: "#121212", // Dark background
    },
    scroll: {
        marginTop: 10,
    },
    header: {
        position: "relative",
        alignItems: "center",
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 15,
        fontWeight: "700",
        textAlign: "center",
        color: "#ffffff", // Light text for contrast
    },
    notificationIcon: {
        position: "absolute",
        right: 0,
    },
    icon: {
        width: 30,
        height: 30,
    },
    section: {
        backgroundColor: "#1e1e1e", // Card-like section
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: "600",
        marginBottom: 12,
        color: "#ffffff",
    },
    item: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 5,
        alignItems: "center",
    },
    label: {
        fontWeight: "600",
        fontSize: 15,
        color: "#eeeeee",
    },
    value: {
        fontWeight: "300",
        fontSize: 15,
        color: "#bbbbbb",
    },
    subtext: {
        fontSize: 13,
        marginTop: 10,
        marginBottom: 10,
        color: "#999999",
    },
    paragraph: {
        fontSize: 14,
        lineHeight: 22,
        color: "#cccccc",
        marginBottom: 10,
    },
    bulletList: {
        marginTop: 10,
        marginLeft: 10,
    },
    bullet: {
        fontSize: 14,
        lineHeight: 22,
        color: "#cccccc",
        marginBottom: 6,
    },
});
