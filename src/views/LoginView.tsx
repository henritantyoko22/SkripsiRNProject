import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GOOGLE_SERVICE_CONFIG } from '@/config/googleService.config';
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
              UNDIP • SKRIPSI APP
            </ThemedText>
          </View>
          <ThemedText type="subtitle" style={styles.title}>
            Sign in with Google
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
            Aplikasi autentikasi terhubung dengan Firebase &amp; Google Services Info Plist
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

        {/* Main Action Area */}
        <ThemedView type="backgroundElement" style={styles.actionCard}>
          <ThemedText type="smallBold" style={styles.actionTitle}>
            Masuk ke Akun Anda
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.actionDesc}>
            Gunakan akun Google yang terdaftar untuk mengakses aplikasi.
          </ThemedText>

          <View style={styles.buttonWrapper}>
            <GoogleSignInButton
              title="Masuk dengan Google"
              onPress={signIn}
              isLoading={isLoading}
            />
          </View>

          <ThemedText type="code" style={styles.securityNote}>
            🔒 Menggunakan kredensial resmi OAuth 2.0
          </ThemedText>
        </ThemedView>

        {/* Info Integrasi GoogleService-Info.plist */}
        <View style={styles.integrationSection}>
          <ThemedText type="smallBold" style={styles.sectionHeader}>
            Konfigurasi GoogleService-Info.plist
          </ThemedText>

          <ThemedView type="backgroundElement" style={styles.configCard}>
            <View style={styles.configRow}>
              <ThemedText type="code" themeColor="textSecondary">
                PROJECT_ID
              </ThemedText>
              <ThemedText type="smallBold">
                {GOOGLE_SERVICE_CONFIG.PROJECT_ID}
              </ThemedText>
            </View>

            <View style={styles.divider} />

            <View style={styles.configRow}>
              <ThemedText type="code" themeColor="textSecondary">
                BUNDLE_ID
              </ThemedText>
              <ThemedText type="code" style={styles.codeHighlight}>
                {GOOGLE_SERVICE_CONFIG.BUNDLE_ID}
              </ThemedText>
            </View>

            <View style={styles.divider} />

            <View style={styles.configRowVertical}>
              <ThemedText type="code" themeColor="textSecondary">
                CLIENT_ID (iOS)
              </ThemedText>
              <ThemedText type="code" numberOfLines={1} style={styles.clientIdText}>
                {GOOGLE_SERVICE_CONFIG.CLIENT_ID}
              </ThemedText>
            </View>

            <View style={styles.divider} />

            <View style={styles.statusRow}>
              <View style={styles.statusIndicator}>
                <View style={styles.statusDot} />
                <ThemedText type="small">IS_SIGNIN_ENABLED</ThemedText>
              </View>
              <View style={styles.tagTrue}>
                <ThemedText type="code" style={styles.tagText}>
                  TRUE
                </ThemedText>
              </View>
            </View>
          </ThemedView>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: Spacing.one,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    textAlign: 'center',
    fontWeight: '700',
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 320,
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
    padding: Spacing.four,
    borderRadius: 20,
    gap: Spacing.two,
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 18,
    textAlign: 'center',
  },
  actionDesc: {
    textAlign: 'center',
    marginBottom: Spacing.two,
  },
  buttonWrapper: {
    width: '100%',
    maxWidth: 320,
  },
  securityNote: {
    marginTop: Spacing.one,
    color: '#8E918F',
    textAlign: 'center',
  },
  integrationSection: {
    marginTop: Spacing.two,
    gap: Spacing.two,
  },
  sectionHeader: {
    fontSize: 15,
    marginLeft: 4,
  },
  configCard: {
    padding: Spacing.four,
    borderRadius: 16,
    gap: Spacing.two,
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  configRowVertical: {
    gap: 4,
  },
  clientIdText: {
    fontSize: 11,
    color: '#3c87f7',
  },
  codeHighlight: {
    fontSize: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#8E918F33',
    marginVertical: 4,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34A853',
  },
  tagTrue: {
    backgroundColor: '#DEF7EC',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    color: '#03543F',
    fontSize: 11,
    fontWeight: '700',
  },
});
