import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack";
import AuthFlow from "../Authentication/AuthFlow";
import SignUpModal from "../Authentication/SignUp";

const Stack = createStackNavigator();

const StackNavigation: React.FC = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: "white" }
            }}>
                <Stack.Screen name="Intro" component={AuthFlow} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default StackNavigation;
