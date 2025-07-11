import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import StackNavigation from './Components/Navigation/StackNavigator';
import { Provider as PaperProvider } from 'react-native-paper';
import { MD3LightTheme as DefaultTheme } from 'react-native-paper';
import { TourGuideProvider } from "rn-tourguide";
import Toast from 'react-native-toast-message';

function App() {

    return (
        <TourGuideProvider {...{ borderRadius: 16 }}>
            <PaperProvider theme={DefaultTheme}>
                <View style={styles.container}>
                    <StackNavigation />
                    <Toast />
                </View>
            </PaperProvider>
        </TourGuideProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default App;