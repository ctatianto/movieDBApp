import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Bookmark } from 'lucide-react-native';
import { AppProvider } from './src/context/AppContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { DetailsScreen } from './src/screens/DetailsScreen';
import { WatchlistScreen } from './src/screens/WatchlistScreen';

export type RootStackParamList = {
  HomeTabs: undefined;
  Details: { movieId: number };
};

export type HomeTabParamList = {
  Home: undefined;
  Watchlist: undefined;
};

export type HomeStackParamList = {
  HomeMain: undefined;
  Details: { movieId: number };
};

export type WatchlistStackParamList = {
  WatchlistMain: undefined;
  Details: { movieId: number };
};

const Tab = createBottomTabNavigator<HomeTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const WatchlistStack = createNativeStackNavigator<WatchlistStackParamList>();

const HomeStackNavigator = () => (
  <HomeStack.Navigator>
    <HomeStack.Screen 
      name="HomeMain" 
      component={HomeScreen}
      options={{ headerShown: false }}
    />
    <HomeStack.Screen 
      name="Details" 
      component={DetailsScreen}
      options={{ 
        title: 'Movie Details',
        headerBackTitle: 'Back'
      }}
    />
  </HomeStack.Navigator>
);

const WatchlistStackNavigator = () => (
  <WatchlistStack.Navigator>
    <WatchlistStack.Screen 
      name="WatchlistMain" 
      component={WatchlistScreen}
      options={{ headerShown: false }}
    />
    <WatchlistStack.Screen 
      name="Details" 
      component={DetailsScreen}
      options={{ 
        title: 'Movie Details',
        headerBackTitle: 'Back'
      }}
    />
  </WatchlistStack.Navigator>
);

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: '#007bff',
      tabBarInactiveTintColor: '#6c757d',
      tabBarStyle: {
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
        paddingBottom: 4,
        paddingTop: 4,
        height: 60,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '500',
      },
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeStackNavigator}
      options={{
        title: 'Home',
        tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        headerShown: false,
      }}
    />
    <Tab.Screen
      name="Watchlist"
      component={WatchlistStackNavigator}
      options={{
        title: 'Watchlist',
        tabBarIcon: ({ color, size }) => <Bookmark size={size} color={color} />,
        headerShown: false,
      }}
    />
  </Tab.Navigator>
);

const App = () => {
  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen 
            name="HomeTabs" 
            component={TabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Details" 
            component={DetailsScreen}
            options={{ 
              title: 'Movie Details',
              headerBackTitle: 'Back'
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
};

export default App;