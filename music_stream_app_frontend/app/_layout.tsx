import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { useColorScheme } from '../hooks/use-color-scheme';
import { LaunchScreen, MyLibrary, MyPlaylists, PlayAnAudio, PlaylistDetails, SearchAudio, SubscriptionPlans } from './screens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={LaunchScreen} />
      <Tab.Screen name="Library" component={MyLibrary} />
      <Tab.Screen name="Playlists" component={MyPlaylists} />
      <Tab.Screen name="Search" component={SearchAudio} />
      <Tab.Screen name="Subscription" component={SubscriptionPlans} />
    </Tab.Navigator>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <Stack.Navigator
          screenOptions={{
            contentStyle: {
              backgroundColor: colorScheme === 'dark' ? DarkTheme.colors.background : DefaultTheme.colors.background,
            },
          }}
        >
          <Stack.Screen name="(tabs)" component={HomeTabs} options={{ headerShown: false }} />
          <Stack.Screen name="PlaylistDetails" component={PlaylistDetails} options={{ title: 'Playlist' }} />
          <Stack.Screen name="PlayAnAudio" component={PlayAnAudio} options={{ title: 'Now Playing' }} />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
