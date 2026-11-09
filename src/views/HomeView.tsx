import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useAuth } from '@/context/AuthContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GOOGLE_SERVICE_CONFIG } from '@/config/googleService.config';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { GoogleLogo } from '@/components/GoogleLogo';

export function HomeView() {
  const { user, signOut, isLoading } = useAuth();
  const [showFullKeys, setShowFullKeys] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Konfirmasi Keluar',
      'Apakah Anda yakin ingin keluar dari akun Google ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ]
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        {/* User Profile Card */}
        <ThemedView type="backgroundElement" style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            {user?.photoUrl ? (
              <Image
                source={{ uri: user.photoUrl }}
                style={styles.avatarImage}
                contentFit="cover"
              />
            ) : (
              <View style={styles.avatarFallback}>
                <ThemedText type="subtitle" style={styles.avatarInitial}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </ThemedText>
              </View>
            )}
            <View style={styles.googleIconBadge}>
              <GoogleLogo size={14} />
            </View>
          </View>

          <View style={styles.profileInfo}>
            <ThemedText type="smallBold" style={styles.userName}>
              {user?.name || 'Pengguna Google'}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.userEmail}>
              {user?.email}
            </ThemedText>
            <View style={styles.activePill}>
              <View style={styles.greenPulse} />
              <ThemedText type="code" style={styles.activeText}>
                TERAUTENTIKASI GOOGLE
              </ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Info Sesi Login */}
        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold" style={styles.cardTitle}>
            Informasi Sesi Login
          </ThemedText>

          <View style={styles.detailRow}>
            <ThemedText type="small" themeColor="textSecondary">
              Provider Auth
            </ThemedText>
            <View style={styles.providerBadge}>
              <GoogleLogo size={14} />
              <ThemedText type="code" style={styles.providerText}>
                {user?.provider || 'google.com'}
              </ThemedText>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <ThemedText type="small" themeColor="textSecondary">
              User ID
            </ThemedText>
            <ThemedText type="code" style={styles.codeText}>
              {user?.id}
            </ThemedText>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <ThemedText type="small" themeColor="textSecondary">
              Waktu Masuk
            </ThemedText>
            <ThemedText type="small">{user?.loginTimestamp || 'Baru saja'}</ThemedText>
          </View>
        </ThemedView>

        {/* Integrasi GoogleService-Info.plist */}
        <ThemedView type="backgroundElement" style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <ThemedText type="smallBold" style={styles.cardTitle}>
              Kunci GoogleService-Info.plist
            </ThemedText>
            <Pressable
              onPress={() => setShowFullKeys(!showFullKeys)}
              style={styles.toggleButton}>
              <ThemedText type="linkPrimary" style={styles.toggleText}>
                {showFullKeys ? 'Ringkas' : 'Lihat Semua'}
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.plistItem}>
            <ThemedText type="code" themeColor="textSecondary">
              PROJECT_ID
            </ThemedText>
            <ThemedText type="code" style={styles.plistValue}>
              {GOOGLE_SERVICE_CONFIG.PROJECT_ID}
            </ThemedText>
          </View>

          <View style={styles.divider} />

          <View style={styles.plistItem}>
            <ThemedText type="code" themeColor="textSecondary">
              BUNDLE_ID
            </ThemedText>
            <ThemedText type="code" style={styles.plistValue}>
              {GOOGLE_SERVICE_CONFIG.BUNDLE_ID}
            </ThemedText>
          </View>

          <View style={styles.divider} />

          <View style={styles.plistItem}>
            <ThemedText type="code" themeColor="textSecondary">
              CLIENT_ID
            </ThemedText>
            <ThemedText
              type="code"
              numberOfLines={showFullKeys ? undefined : 1}
              style={[styles.plistValue, { color: '#3c87f7' }]}>
              {GOOGLE_SERVICE_CONFIG.CLIENT_ID}
            </ThemedText>
          </View>

          {showFullKeys && (
            <>
              <View style={styles.divider} />
              <View style={styles.plistItem}>
                <ThemedText type="code" themeColor="textSecondary">
                  REVERSED_CLIENT_ID
                </ThemedText>
                <ThemedText type="code" style={styles.plistValue}>
                  {GOOGLE_SERVICE_CONFIG.REVERSED_CLIENT_ID}
                </ThemedText>
              </View>

              <View style={styles.divider} />
              <View style={styles.plistItem}>
                <ThemedText type="code" themeColor="textSecondary">
                  API_KEY
                </ThemedText>
                <ThemedText type="code" style={styles.plistValue}>
                  {GOOGLE_SERVICE_CONFIG.API_KEY}
                </ThemedText>
              </View>

              <View style={styles.divider} />
              <View style={styles.plistItem}>
                <ThemedText type="code" themeColor="textSecondary">
                  GOOGLE_APP_ID
                </ThemedText>
                <ThemedText type="code" style={styles.plistValue}>
                  {GOOGLE_SERVICE_CONFIG.GOOGLE_APP_ID}
                </ThemedText>
              </View>

              <View style={styles.divider} />
              <View style={styles.plistItem}>
                <ThemedText type="code" themeColor="textSecondary">
                  STORAGE_BUCKET
                </ThemedText>
                <ThemedText type="code" style={styles.plistValue}>
                  {GOOGLE_SERVICE_CONFIG.STORAGE_BUCKET}
                </ThemedText>
              </View>
            </>
          )}
        </ThemedView>

        {/* Action Button: Keluar / Sign Out */}
        <Pressable
          onPress={handleSignOut}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.signOutButton,
            pressed && styles.signOutButtonPressed,
          ]}>
          {isLoading ? (
            <ActivityIndicator color="#E02424" size="small" />
          ) : (
            <ThemedText type="smallBold" style={styles.signOutText}>
              Keluar dari Akun (Sign Out)
            </ThemedText>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: Spacing.three,
  },
  profileCard: {
    padding: Spacing.four,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  avatarFallback: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#3c87f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#ffffff',
    fontWeight: '700',
  },
  googleIconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 18,
  },
  userEmail: {
    fontSize: 13,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  greenPulse: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#34A853',
  },
  activeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#34A853',
  },
  card: {
    padding: Spacing.four,
    borderRadius: 16,
    gap: Spacing.two,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
  },
  toggleButton: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  toggleText: {
    fontSize: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  providerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#8E918F1A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  providerText: {
    fontSize: 12,
  },
  codeText: {
    fontSize: 12,
  },
  plistItem: {
    gap: 3,
  },
  plistValue: {
    fontSize: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#8E918F33',
    marginVertical: 4,
  },
  signOutButton: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F98080',
    backgroundColor: '#FDE8E833',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  signOutButtonPressed: {
    opacity: 0.7,
  },
  signOutText: {
    color: '#E02424',
    fontSize: 14,
  },
});
