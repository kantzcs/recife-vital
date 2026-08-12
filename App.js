import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import AgendaScreen from './src/screens/AgendaScreen';
import RecompensasScreen from './src/screens/RecompensasScreen';
import { COLORS } from './src/constants/theme';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: { height: 60, paddingBottom: 8, paddingTop: 8 },
          tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
          tabBarIcon: ({ focused }) => {
            let icon = '🏠';
            if (route.name === 'Agenda') icon = '📅';
            if (route.name === 'Recompensas') icon = '🎁';
            return <Text style={{ fontSize: 20 }}>{icon}</Text>;
          },
        })}
      >
        <Tab.Screen name="Início" component={HomeScreen} />
        <Tab.Screen name="Agenda" component={AgendaScreen} />
        <Tab.Screen name="Recompensas" component={RecompensasScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
