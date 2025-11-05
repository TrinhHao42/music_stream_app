import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import MiniPlayer from '@/components/MiniPlayer';
import { AuthProvider } from '@/contexts/AuthContext';
import { MiniPlayerProvider } from '@/contexts/MiniPlayerContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SafeAreaProvider>
        <AuthProvider>
          <MiniPlayerProvider>
            <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
              <Stack
                screenOptions={{ headerShown: false }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="launch" options={{ headerShown: false }} />
                <Stack.Screen name="play-audio" options={{ headerShown: false }} />
                </Stack>
              <MiniPlayer />
            </SafeAreaView>
          </MiniPlayerProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
