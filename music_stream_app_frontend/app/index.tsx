// Redirect to tabs (Home screen)
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/(tabs)" />;
}

