import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

const AuthProvider = ({ navigation }: any) => {


    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" />
        </View>
    );
};

export default AuthProvider;
