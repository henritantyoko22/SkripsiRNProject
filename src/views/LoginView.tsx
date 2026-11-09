import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function LoginView() {
  const { signIn, isLoading, error, clearError } = useAuth();
  const theme = useTheme();

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        {/* Header Hero */}
        <View style={styles.header}>
          <View style={[styles.badge, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="code" style={styles.badgeText}>
              UNIVERSITAS DIPONEGORO
            </ThemedText>
          </View>
          <ThemedText type="subtitle" style={styles.title}>
            Portal Admin Skripsi
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
            Sistem Informasi &amp; Database Skripsi Mahasiswa
          </ThemedText>
        </View>

        {/* Error notification banner */}
        {error && (
          <View style={styles.errorBanner}>
            <ThemedText type="small" style={styles.errorText}>
              {error}
            </ThemedText>
            <Pressable onPress={clearError} style={styles.errorClose}>
              <ThemedText type="smallBold" style={styles.errorCloseText}>
                ✕
              </ThemedText>
            </Pressable>
          </View>
        )}

        {/* Main Action Card */}
        <ThemedView type="backgroundElement" style={styles.actionCard}>
          <ThemedText type="smallBold" style={styles.actionTitle}>
            Masuk sebagai Administrator
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.actionDesc}>
            Masuk menggunakan akun Google untuk mengakses dan mengelola database mahasiswa yang mengambil skripsi.
          </ThemedText>

          <View style={styles.buttonWrapper}>
            <GoogleSignInButton
              title="Masuk dengan Google"
              onPress={signIn}
              isLoading={isLoading}
            />
          </View>

          <View style={styles.infoBox}>
            <ThemedText type="code" style={styles.infoBoxText}>
              ℹ️ Akun Google otomatis terhubung dengan database mahasiswa Firestore
            </ThemedText>
          </View>
        </ThemedView>

        {/* Petunjuk Login Mahasiswa */}
        <ThemedView type="backgroundElement" style={styles.guideCard}>
          <ThemedText type="smallBold" style={styles.guideTitle}>
            Petunjuk Masuk
          </ThemedText>
          <View style={styles.guideRow}>
            <ThemedText type="smallBold" style={styles.guideBullet}>
              1.
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.guideText}>
              Pastikan akun Google yang digunakan aktif dan terdaftar.
            </ThemedText>
          </View>
          <View style={styles.guideRow}>
            <ThemedText type="smallBold" style={styles.guideBullet}>
              2.
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.guideText}>
              Setelah berhasil masuk, profil mahasiswa dan status akademik akan langsung ditampilkan.
            </ThemedText>
          </View>
        </ThemedView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: Spacing.four,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: Spacing.one,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  title: {
    textAlign: 'center',
    fontWeight: '700',
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 340,
    lineHeight: 20,
  },
  errorBanner: {
    backgroundColor: '#FDE8E8',
    borderColor: '#F98080',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    color: '#9B1C1C',
    flex: 1,
  },
  errorClose: {
    padding: 4,
    marginLeft: 8,
  },
  errorCloseText: {
    color: '#9B1C1C',
  },
  actionCard: {
    padding: Spacing.five,
    borderRadius: 24,
    gap: Spacing.two,
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 18,
    textAlign: 'center',
  },
  actionDesc: {
    textAlign: 'center',
    marginBottom: Spacing.three,
    lineHeight: 20,
  },
  buttonWrapper: {
    width: '100%',
    maxWidth: 320,
  },
  infoBox: {
    marginTop: Spacing.two,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#8E918F15',
  },
  infoBoxText: {
    fontSize: 11,
    textAlign: 'center',
    color: '#60646C',
  },
  guideCard: {
    padding: Spacing.four,
    borderRadius: 16,
    gap: Spacing.two,
  },
  guideTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  guideRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  guideBullet: {
    fontSize: 13,
    color: '#3c87f7',
  },
  guideText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
