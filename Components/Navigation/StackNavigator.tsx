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
                    // initialRouteName={isSignedIn ? }
                    screenOptions={{
                        headerShown: false,
                    }}>
                    <Stack.Screen name="Intro" component={AuthFlow} />
                    {/*<Stack.Screen name="SignUp" component={SignUp} />*/}
                    <Stack.Screen name="HomePage" component={HomePage} />
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
