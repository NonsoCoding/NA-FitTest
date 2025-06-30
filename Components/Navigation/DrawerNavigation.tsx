import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomePage from '../Screens/HomeScreen';
import Profile from '../Screens/Profile';
import EditDetails from '../Screens/EditDetails';
import History from '../Screens/History';
import AdminDashboard from '../Screens/AdminDashboard';
import About from '../LegalDocument/About';
import { Platform } from 'react-native';
import { AntDesign, Feather, Ionicons, MaterialCommunityIcons, SimpleLineIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: Platform.OS === "android" ? 90 : 90,
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          color: "black"
        },
      }}
    >
      <Tab.Screen
        options={{
          tabBarIcon: ({ }) => (
            <Ionicons name='home-outline' size={25} />
          )
        }}
        name="Home" component={HomePage}
      />
      <Tab.Screen
        options={{
          tabBarIcon: ({ }) => (
            <Feather name='user' size={25} />
          )
        }}
        name="Profile" component={Profile}
      />
      <Tab.Screen
        options={{
          tabBarIcon: ({ }) => (
            <MaterialCommunityIcons name='history' size={25} />
          )
        }}
        name="History" component={History}
      />
      <Tab.Screen
        options={{
          tabBarIcon: ({ }) => (
            <SimpleLineIcons name='info' size={25} />
          )
        }}
        name="About" component={About}
      />
    </Tab.Navigator>
  );
};
