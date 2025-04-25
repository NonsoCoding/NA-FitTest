import 'react-native-reanimated';
import { StyleSheet, Text, View } from 'react-native';
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { PaperProvider } from 'react-native-paper';
import { useCallback, useEffect, useState } from 'react';
import {
  Montserrat_100Thin, Montserrat_200ExtraLight, Montserrat_300Light,
  Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold,
  Montserrat_700Bold, Montserrat_800ExtraBold, Montserrat_900Black,
} from '@expo-google-fonts/montserrat';
import {
  MuseoModerno_100Thin, MuseoModerno_200ExtraLight, MuseoModerno_300Light,
  MuseoModerno_400Regular, MuseoModerno_500Medium, MuseoModerno_600SemiBold,
  MuseoModerno_700Bold, MuseoModerno_800ExtraBold, MuseoModerno_900Black
} from '@expo-google-fonts/museomoderno';
import StackNavigation from './Components/Navigation/StackNavigator';

export default function App() {

  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync({ Montserrat_100Thin });
        await Font.loadAsync({ Montserrat_200ExtraLight });
        await Font.loadAsync({ Montserrat_300Light });
        await Font.loadAsync({ Montserrat_400Regular });
        await Font.loadAsync({ Montserrat_500Medium });
        await Font.loadAsync({ Montserrat_600SemiBold });
        await Font.loadAsync({ Montserrat_700Bold });
        await Font.loadAsync({ Montserrat_800ExtraBold });
        await Font.loadAsync({ Montserrat_900Black });
        await Font.loadAsync({ MuseoModerno_100Thin });
        await Font.loadAsync({ MuseoModerno_200ExtraLight });
        await Font.loadAsync({ MuseoModerno_300Light });
        await Font.loadAsync({ MuseoModerno_400Regular });
        await Font.loadAsync({ MuseoModerno_500Medium });
        await Font.loadAsync({ MuseoModerno_600SemiBold });
        await Font.loadAsync({ MuseoModerno_700Bold });
        await Font.loadAsync({ MuseoModerno_800ExtraBold });
        await Font.loadAsync({ MuseoModerno_900Black });
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={{
      flex: 1
    }}>
      <PaperProvider>
        <StackNavigation />
      </PaperProvider>
    </View>
  );
}

const styles = StyleSheet.create({
});
