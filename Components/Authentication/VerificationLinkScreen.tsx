import { Alert, Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { getAuth, reload, sendEmailVerification } from 'firebase/auth';
import { Theme } from '../Branding/Theme';
import { auth } from '../../Firebase/Settings';
import { useState } from 'react';
import LottieView from 'lottie-react-native';

interface VerificationLinkScreenIprops {
    navigation: any;
}

const VerificationLinkScreen = ({
    navigation
}: VerificationLinkScreenIprops) => {

    const [isLoading, setIsLoading] = useState(false);
    const [canResend, setCanResend] = useState(false);

    const checkEmailVerified = async () => {
        setIsLoading(true);
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
            await reload(user);
            if (user.emailVerified) {
                setIsLoading(false)
                Alert.alert('Verified', 'Your email is now verified!.');
                navigation.replace('PersonalInfo');
            } else {
                setIsLoading(false)
                Alert.alert('Not verified', 'Please verify your email before proceeding.')
            }
        }
    };

    const OpenEmailApp = async () => {
        setIsLoading(true);
        try {
            const url = 'mailto:';
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
                setIsLoading(false);
                Linking.openURL(url);
            } else {
                Alert.alert('Error', 'No email app found.')
            }
        } catch (error) {
            setIsLoading(false);
            console.error('Error opening email app', error);

        }
    }

    const resendVerificationLink = async () => {

        setIsLoading(true);
        if (!canResend) return;

        const user = auth.currentUser;

        if (user) {
            try {
                setIsLoading(false)
                await sendEmailVerification(user);
                Alert.alert('Verification Sent', 'A new verification email has been sent to your email.')
                setCanResend(false);
                setTimeout(() => {
                    setCanResend(true);
                }, 6000);
            } catch (error: any) {
                Alert.alert('Error', error.message);
            }
        } else {
            setIsLoading(false)
            Alert.alert('Error', 'No user is currently signed in.')
        }
    }

    return (
        <View style={{
            flex: 1,
            justifyContent: "center",
        }}>
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <LottieView
                        source={require("../../assets/ExerciseGifs/Animation - 1745262738989.json")}
                        style={{
                            height: 80,
                            width: 80
                        }}
                        resizeMode="contain"
                        loop={true}
                        autoPlay={true}
                    />
                    <Text style={{ color: "#fff", marginTop: 10, fontFamily: Theme.Montserrat_Font.Mont400 }}>Signing you in...</Text>
                </View>
            )}
            <View style={{
                padding: 20,
                gap: 20
            }}>
                <View style={{
                    alignItems: "center",
                    gap: 5
                }}>
                    <View>
                        <Image source={require("../../assets/downloadedIcons/email_icon.png")}
                            style={{
                                height: 50,
                                width: 50
                            }}
                        />
                    </View>
                    <Text>Check your email</Text>
                    <Text>Open mail app to verify</Text>
                </View>
                <View style={{
                    gap: 10
                }}>
                    <TouchableOpacity style={styles.btn}
                        onPress={() => {
                            checkEmailVerified();
                        }}
                    >
                        <Text style={{
                            color: "white"
                        }}>
                            I have verified
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            OpenEmailApp();
                        }}
                        style={styles.btn}
                    >
                        <Text style={{
                            color: "white"
                        }}>
                            Open email app
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={{
                    flexDirection: "row",
                    gap: 5,
                    alignSelf: "center"
                }}>
                    <Text>Didn't recieve the email?</Text>
                    <TouchableOpacity
                        onPress={() => {
                            resendVerificationLink();
                        }}
                        disabled={!canResend}
                    >
                        <Text style={{
                            color: Theme.colors.primaryColor
                        }}>Click to resend</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={{
                    flexDirection: "row",
                    alignItems: "center",
                    alignSelf: "center"
                }}>
                    <Image source={require("../../assets/downloadedIcons/arrow-left.png")} />
                    <Text>Back to log in</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default VerificationLinkScreen;

const styles = StyleSheet.create({
    btn: {
        backgroundColor: "#4B5320",
        padding: 20,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center"
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
})