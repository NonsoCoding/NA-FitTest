import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack";
import AuthFlow from "../Authentication/AuthFlow";
import SignUpModal from "../Authentication/SignUp";
import HomePage from "../Screens/HomeScreen";

const Stack = createStackNavigator();

const StackNavigation: React.FC = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: "white" }
            }}>
                <Stack.Screen name="Intro" component={AuthFlow} />
                <Stack.Screen name="HomePage" component={HomePage} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default StackNavigation;
