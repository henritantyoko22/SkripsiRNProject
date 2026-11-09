import React from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { LoginView } from '@/views/LoginView';
import { HomeView } from '@/views/HomeView';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset } from '@/constants/theme';

export default function IndexScreen() {
  const { user, isInitialLoading } = useAuth();

  if (isInitialLoading) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#3c87f7" />
      </ThemedView>
    );
  }

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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  safeArea: {
    flex: 1,
    paddingBottom: BottomTabInset,
  },
});
