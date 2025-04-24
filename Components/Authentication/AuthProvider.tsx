import React, { useEffect } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { ActivityIndicator, View } from "react-native";

const AuthProvider = ({ navigation }: any) => {
    const { isLoaded, isSignedIn } = useAuth();

    useEffect(() => {
        if (!isLoaded) return;

        if (isSignedIn) {
            navigation.reset({
                index: 0,
                routes: [{ name: "HomePage" }],
            });
        } else {
            navigation.reset({
                index: 0,
                routes: [{ name: "LoginScreen" }],
            });
        }
    }, [isLoaded, isSignedIn]);

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" />
        </View>
    );
};

export default AuthProvider;
