import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { MindStreamProvider } from './src/context/MindStreamContext';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import BreathingScreen from './src/screens/BreathingScreen';
import StatsScreen from './src/screens/StatsScreen';

const Stack = createNativeStackNavigator();

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6366F1',
    secondary: '#8B5CF6',
    tertiary: '#14B8A6',
    background: '#F8FAFC',
    surface: '#FFFFFF',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <MindStreamProvider>
          <NavigationContainer>
            <StatusBar style="dark" />
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Breathing" component={BreathingScreen} />
              <Stack.Screen name="Stats" component={StatsScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </MindStreamProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}