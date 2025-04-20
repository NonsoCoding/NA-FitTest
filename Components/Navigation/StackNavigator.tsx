import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack";
import AuthFlow from "../Authentication/AuthFlow";
import SignUpModal from "../Authentication/SignUp";
import { tokenCache } from "../Branding/cache";
import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
import SignUp from "../Authentication/SignUp";

import HomePage from "../Screens/HomeScreen";

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
                        cardStyle: { backgroundColor: "white" },

                    }}>
                    <Stack.Screen name="Intro" component={AuthFlow} />
                    {/*<Stack.Screen name="SignUp" component={SignUp} />*/}
                    <Stack.Screen name="HomePage" component={HomePage} />
                </Stack.Navigator>
            </NavigationContainer>
        </ClerkProvider>
    )
}

export default StackNavigation;
