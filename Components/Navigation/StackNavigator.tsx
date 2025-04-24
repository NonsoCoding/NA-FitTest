import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack";
import AuthFlow from "../Authentication/AuthFlow";
import SignUpModal from "../Authentication/SignUp";
import { tokenCache } from "../Branding/cache";
import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
import SignUp from "../Authentication/SignUp";

import HomePage from "../Screens/HomeScreen";
import PullUpsTestScreen from "../Screens/TestScreens/PullUpTestScreen";
import PushUpsTestScreen from "../Screens/TestScreens/PushUpTestScreen";
import SprintTestScreen from "../Screens/TestScreens/SprintTestScreen";
import SitUpTestScreen from "../Screens/TestScreens/SitUpTextScreen";
import RunningTestScreen from "../Screens/TestScreens/RunningTestScreen";
import LoginScreen from "../Authentication/Login";
import SignUpScreen from "../Authentication/SignUp";
import ForgottenPassword from "../Authentication/ForgottenPassword";
import OTPScreen from "../Authentication/Otp";

const Stack = createStackNavigator();


const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
    throw new Error(
        "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env"
    );


}

const StackNavigation: React.FC = () => {
    // const { isSignedIn } = useAuth();

    return (
        <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
            <NavigationContainer>
                <Stack.Navigator
                    screenOptions={{
                        headerShown: false,
                    }}>
                    <Stack.Screen name="Intro" component={AuthFlow} />
                    <Stack.Screen name="HomePage" component={HomePage} />
                    <Stack.Screen name="LoginScreen" component={LoginScreen} />
                    <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
                    <Stack.Screen name="ForgottenPassword" component={ForgottenPassword} />
                    <Stack.Screen name="OTPScreen" component={OTPScreen} />
                    <Stack.Screen name="PullUpsScreen" component={PullUpsTestScreen} />
                    <Stack.Screen name="PushUpsScreen" component={PushUpsTestScreen} />
                    <Stack.Screen name="SprintScreen" component={SprintTestScreen} />
                    <Stack.Screen name="SitUpScreen" component={SitUpTestScreen} />
                    <Stack.Screen name="RunningScreen" component={RunningTestScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </ClerkProvider>
    )
}

export default StackNavigation;
