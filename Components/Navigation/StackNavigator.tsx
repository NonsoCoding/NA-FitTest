import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack";
import HomePage from "../Screens/HomeScreen";
import PullUpsTestScreen from "../Screens/TestScreens/PullUpTestScreen";
import PushUpsTestScreen from "../Screens/TestScreens/PushUpTestScreen";
import SprintTestScreen from "../Screens/TestScreens/SprintTestScreen";
import SitUpTestScreen from "../Screens/TestScreens/SitUpTextScreen";
import LoginScreen from "../Authentication/Login";
import SignUpScreen from "../Authentication/SignUp";
import ForgottenPassword from "../Authentication/ForgottenPassword";
import OTPScreen from "../Authentication/Otp";
import RunningTestScreen from "../Screens/TestScreens/RunningTestScreen";
import IntroScreen from "../Authentication/IntroScreen";
import LandingScreen from "../Authentication/LandingScreen";
import { Theme } from "../Branding/Theme";
import PasswordOTPScreen from "../Authentication/PasswordOTPResetScreen";
import ResetPassword from "../Authentication/ResetPassword";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DrawerNavigator } from "./DrawerNavigation";
import Profile from "../Screens/Profile";
import PersonalInfo from "../Screens/PersonalInfo";
import VerificationLinkScreen from "../Authentication/VerificationLinkScreen";
import PullUpHistory from "../Screens/TestHistory/PullUpHistory";
import RunningHistory from "../Screens/TestHistory/RunningHistory";
import SprintHistory from "../Screens/TestHistory/SprintingHistory";
import SitUpHistory from "../Screens/TestHistory/SitUpHistory";
import PushUpHistory from "../Screens/TestHistory/PushUpHistory";

const Stack = createStackNavigator();


const StackNavigation: React.FC = () => {
    // const { isSignedIn } = useAuth();

    return (
        <GestureHandlerRootView style={{
            flex: 1
        }}>
            <NavigationContainer>
                <Stack.Navigator
                    screenOptions={{
                        headerShown: false,
                        cardStyle: {
                            backgroundColor: Theme.colos.backgroundColor
                        }
                    }}
                >
                    <Stack.Screen name="IntroScreen" component={IntroScreen} />
                    <Stack.Screen name="LandingScreen" component={LandingScreen} />
                    <Stack.Screen name="MainDrawer" component={DrawerNavigator} />
                    <Stack.Screen name="LoginScreen" component={LoginScreen} />
                    <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
                    <Stack.Screen name="OTPScreen" component={OTPScreen} />
                    <Stack.Screen name="VerificationScreen" component={VerificationLinkScreen} />
                    <Stack.Screen name="PasswordOTPScreen" component={PasswordOTPScreen} />
                    <Stack.Screen name="PullUpScreen" component={PullUpsTestScreen} />
                    <Stack.Screen name="ForgottenPassword" component={ForgottenPassword} />
                    <Stack.Screen name="ResetPassword" component={ResetPassword} />
                    <Stack.Screen name="PushUpsScreen" component={PushUpsTestScreen} />
                    <Stack.Screen name="SprintScreen" component={SprintTestScreen} />
                    <Stack.Screen name="SitUpScreen" component={SitUpTestScreen} />
                    <Stack.Screen name="RunningScreen" component={RunningTestScreen} />
                    <Stack.Screen name="PullUpsHistory" component={PullUpHistory} />
                    <Stack.Screen name="PushUpHistory" component={PushUpHistory} />
                    <Stack.Screen name="RunningHistory" component={RunningHistory} />
                    <Stack.Screen name="SitUpHistory" component={SitUpHistory} />
                    <Stack.Screen name="SprintHistory" component={SprintHistory} />
                    <Stack.Screen name="PersonalInfo" component={PersonalInfo} />
                </Stack.Navigator>
            </NavigationContainer>
        </GestureHandlerRootView>
    )
}

export default StackNavigation;
