import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import StackNavigation from './Components/Navigation/StackNavigator';

export default function App() {

    return (
        <View style={{ flex: 1 }}>
            <StackNavigation />
        </View>
    );
}

const styles = StyleSheet.create({});
