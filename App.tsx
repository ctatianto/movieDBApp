import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image, View, Text, StyleSheet } from 'react-native';
import { Bookmark } from 'lucide-react-native';
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

// Custom Tab Bar Icon Component
const TabBarIcon = ({ source, focused, title }: { source: any, focused: boolean, title: string }) => {
  return (
    <View style={styles.tabBarItem}>
      <Image 
        source={source} 
        style={[
          styles.tabBarIcon,
          { tintColor: focused ? '#90cea1' : '#c0c0c0' } // Light green for active, light gray for inactive
        ]} 
        resizeMode="contain"
      />
      <Text style={[
        styles.tabBarLabel,
        { color: focused ? '#90cea1' : '#c0c0c0' } // Light green for active, light gray for inactive
      ]}>
        {title}
      </Text>
    </View>
  );
};

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarStyle: {
        backgroundColor: '#032541', // Dark blue background
        borderTopWidth: 0, // Remove top border
        paddingBottom: 4,
        paddingTop: 4,
        height: 60,
      },
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeStackNavigator}
      options={{
        title: 'Home',
        tabBarIcon: ({ focused }) => (
          <TabBarIcon 
            source={require('./src/assets/Home.png')}
            focused={focused}
            title=""
          />
        ),
        headerShown: false,
      }}
    />
    <Tab.Screen
      name="Watchlist"
      component={WatchlistStackNavigator}
      options={{
        title: 'Watchlist',
        tabBarIcon: ({ focused }) => (
          <TabBarIcon 
            source={require('./src/assets/Watchlist.png')}
            focused={focused}
            title=""
          />
        ),
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

const styles = StyleSheet.create({
  tabBarItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarIcon: {
    width: 24,
    height: 24,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  tabIconText: {
    fontSize: 24,
  },
});

export default App;