import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import MobileMapView from './components/MobileMapView';
import TreeListView from './components/TreeListView';
import MobileTreeDetailView from './components/MobileTreeDetailView';
import LoginView from './components/LoginView';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MapStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="MobileMapView" component={MobileMapView} options={{ headerShown: false }} />
    <Stack.Screen name="TreeDetails" component={MobileTreeDetailView} options={{ title: 'Tree Details' }} />
  </Stack.Navigator>
);

const ListStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="TreeList" component={TreeListView} options={{ headerShown: false }} />
    <Stack.Screen name="TreeDetails" component={MobileTreeDetailView} options={{ title: 'Tree Details' }} />
  </Stack.Navigator>
);

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Map') {
              iconName = focused ? 'map' : 'map-outline';
            } else if (route.name === 'List') {
              iconName = focused ? 'list' : 'list-outline';
            } else if (route.name === 'Login') {
              iconName = focused? 'person' : 'person';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#030203',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: '#7FB241',
            paddingBottom: 5,
          },
        })}
      >
        <Tab.Screen name="Map" component={MapStack} options={{headerShown: false}} />
        <Tab.Screen name="List" component={ListStack} options={{headerShown: false}}/>
        <Tab.Screen name="Login" component={LoginView} options={{headerShown: false}} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;