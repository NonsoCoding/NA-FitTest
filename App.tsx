import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { PaperProvider } from 'react-native-paper';
import {
    MuseoModerno_100Thin, MuseoModerno_200ExtraLight, MuseoModerno_300Light,
    MuseoModerno_400Regular, MuseoModerno_500Medium, MuseoModerno_600SemiBold,
    MuseoModerno_700Bold, MuseoModerno_800ExtraBold, MuseoModerno_900Black
} from '@expo-google-fonts/museomoderno';
import {
    Montserrat_100Thin, Montserrat_200ExtraLight, Montserrat_300Light,
    Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold,
    Montserrat_700Bold, Montserrat_800ExtraBold, Montserrat_900Black
} from '@expo-google-fonts/montserrat';

import StackNavigation from './Components/Navigation/StackNavigator';

SplashScreen.preventAutoHideAsync(); // ✅ Prevent auto-hide early

export default function App() {
    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                await Font.loadAsync({
                    Montserrat_100Thin,
                    Montserrat_200ExtraLight,
                    Montserrat_300Light,
                    Montserrat_400Regular,
                    Montserrat_500Medium,
                    Montserrat_600SemiBold,
                    Montserrat_700Bold,
                    Montserrat_800ExtraBold,
                    Montserrat_900Black,
                    MuseoModerno_100Thin,
                    MuseoModerno_200ExtraLight,
                    MuseoModerno_300Light,
                    MuseoModerno_400Regular,
                    MuseoModerno_500Medium,
                    MuseoModerno_600SemiBold,
                    MuseoModerno_700Bold,
                    MuseoModerno_800ExtraBold,
                    MuseoModerno_900Black
                });
            } catch (e) {
                console.warn(e);
            } finally {
                setAppIsReady(true);
            }
        }

        prepare();
    }, []);

    // ✅ Hide the splash screen after fonts are loaded and view is ready
    const onLayoutRootView = useCallback(async () => {
        if (appIsReady) {
            await SplashScreen.hideAsync();
        }
    }, [appIsReady]);

    if (!appIsReady) {
        return null;
    }

    return (
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
            <PaperProvider>
                <StackNavigation />
            </PaperProvider>
        </View>
    );
}

const styles = StyleSheet.create({});
