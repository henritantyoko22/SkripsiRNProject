import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { LoginView } from '@/views/LoginView';
import { HomeView } from '@/views/HomeView';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset } from '@/constants/theme';

export default function IndexScreen() {
  const { user } = useAuth();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {user ? <HomeView /> : <LoginView />}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingBottom: BottomTabInset,
  },
});
