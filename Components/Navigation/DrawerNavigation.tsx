import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomePage from '../Screens/HomeScreen';
import Profile from '../Screens/Profile';
import EditDetails from '../Screens/EditDetails';
import History from '../Screens/History';
import AdminDashboard from '../Screens/AdminDashboard';
import About from '../LegalDocument/About';
import { Platform, View } from 'react-native';
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
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        options={{
          tabBarIcon: ({ focused }: any) => (
            <View style={{
              backgroundColor: focused ? 'black' : 'transparent',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 50,
              minHeight: 40,
              marginTop: 30
            }}>
              <Ionicons
                name='home-outline'
                size={25}
                color={focused ? 'white' : 'black'}
              />
            </View>
          )
        }}
        name="Home" component={HomePage}
      />
      <Tab.Screen
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{
              backgroundColor: focused ? 'black' : 'transparent',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 50,
              minHeight: 40,
              marginTop: 30
            }}>
              <Feather name='user' size={25} color={focused ? 'white' : 'black'} />
            </View>
          )
        }}
        name="Profile" component={Profile}
      />
      <Tab.Screen
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{
              backgroundColor: focused ? 'black' : 'transparent',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 50,
              minHeight: 40,
              marginTop: 30
            }}>
              <MaterialCommunityIcons name='history' size={25} color={focused ? 'white' : 'black'} />
            </View>
          )
        }}
        name="History" component={History}
      />
      <Tab.Screen
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{
              backgroundColor: focused ? 'black' : 'transparent',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 50,
              minHeight: 40,
              marginTop: 30
            }}>
              <SimpleLineIcons name='info' size={23} color={focused ? 'white' : 'black'} />
            </View>
          )
        }}
        name="About" component={About}
      />
    </Tab.Navigator>
  );
};
