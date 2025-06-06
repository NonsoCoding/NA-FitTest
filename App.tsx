import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import StackNavigation from './Components/Navigation/StackNavigator';
import { Provider as PaperProvider } from 'react-native-paper';
import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export default function App() {

    return (
        <PaperProvider theme={DefaultTheme}>
            <View style={{ flex: 1 }}>
                <StackNavigation />
            </View>
        </PaperProvider>
    );
}

const styles = StyleSheet.create({});
