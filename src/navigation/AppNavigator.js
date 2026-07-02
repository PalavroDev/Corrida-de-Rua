import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../contexts/AuthContext';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/home/HomeScreen';
import RunTrackingScreen from '../screens/run/RunTrackingScreen';
import RankingScreen from '../screens/ranking/RankingScreen';
import SearchUsersScreen from '../screens/social/SearchUsersScreen';
import UserProfileScreen from '../screens/social/UserProfileScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import GoalsScreen from '../screens/goals/GoalsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#111', borderTopColor: '#222' },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#555',
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Início: 'home',
            Ranking: 'trophy',
            Buscar: 'search',
            Metas: 'flag',
            Perfil: 'person',
          };
          return <Ionicons name={icons[route.name] || 'ellipse'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Início" component={HomeScreen} />
      <Tab.Screen name="Ranking" component={RankingScreen} />
      <Tab.Screen name="Buscar" component={SearchUsersScreen} />
      <Tab.Screen name="Metas" component={GoalsScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#111' }, headerTintColor: '#fff' }}>
      <Stack.Screen name="Main" component={HomeTabs} options={{ headerShown: false }} />
      <Stack.Screen name="RunTracking" component={RunTrackingScreen} options={{ title: 'Corrida' }} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} options={{ title: 'Perfil' }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#4CAF50" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
