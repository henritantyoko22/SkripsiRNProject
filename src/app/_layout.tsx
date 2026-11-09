import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { AuthProvider } from '@/context/AuthContext';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  return (
    <AuthProvider>
      <ThemeProvider value={DefaultTheme}>
        <AnimatedSplashOverlay />
        <AppTabs />
      </ThemeProvider>
    </AuthProvider>
  );
}

