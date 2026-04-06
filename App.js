import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from './src/theme';

import HomeScreen   from './src/screens/HomeScreen';
import SetupScreen  from './src/screens/SetupScreen';
import GameScreen   from './src/screens/GameScreen';
import WinnerScreen from './src/screens/WinnerScreen';
import RulesScreen  from './src/screens/RulesScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: colors.sand },
          headerTintColor: colors.clayDark,
          headerTitleStyle: { fontWeight: '900', letterSpacing: 2, fontSize: 17 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.sand },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Setup"
          component={SetupScreen}
          options={{ title: 'NEW MATCH' }}
        />
        <Stack.Screen
          name="Game"
          component={GameScreen}
          options={{ title: 'LIVE MATCH', headerBackTitle: 'Home' }}
        />
        <Stack.Screen
          name="Winner"
          component={WinnerScreen}
          options={{ headerShown: false, presentation: 'modal' }}
        />
        <Stack.Screen
          name="Rules"
          component={RulesScreen}
          options={{ title: 'PADEL RULES' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
