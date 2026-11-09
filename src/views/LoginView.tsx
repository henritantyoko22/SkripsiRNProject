import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { Image } from 'expo-image';
import { useAuth } from '@/context/AuthContext';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { GoogleLogo } from '@/components/GoogleLogo';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  PRESET_GOOGLE_ACCOUNTS,
  GoogleAccountOption,
} from '@/services/authService';

export function LoginView() {
  const { signIn, signInWithAccount, isLoading, error, clearError } = useAuth();
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [isChooserOpen, setIsChooserOpen] = useState<boolean>(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const handleRealGoogleLogin = async () => {
    try {
      await signIn();
    } catch (e) {
      // Error is stored in AuthContext
    }
  };

  // Form akun lain / custom
  const [isCustomOpen, setIsCustomOpen] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>('');
  const [customEmail, setCustomEmail] = useState<string>('');

  const handleSelectAccount = async (account: GoogleAccountOption) => {
    setSelectedAccountId(account.id);
    try {
      await signInWithAccount(account);
      setIsChooserOpen(false);
    } catch {
      // Error handled by AuthContext
    } finally {
      setSelectedAccountId(null);
    }
  };

  const handleCustomLogin = async () => {
    if (!customEmail.trim() || !customName.trim()) return;

    const customAccount: GoogleAccountOption = {
      id: 'google-custom-' + Date.now(),
      name: customName.trim(),
      email: customEmail.trim(),
      photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      role: 'Administrator Skripsi',
    };

    await handleSelectAccount(customAccount);
  };

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
            Masuk menggunakan akun Google Anda untuk mengakses dan mengelola database mahasiswa yang mengambil skripsi.
          </ThemedText>

          <View style={styles.buttonWrapper}>
            <GoogleSignInButton
              title="Masuk dengan Google (Akun Asli)"
              onPress={handleRealGoogleLogin}
              isLoading={isLoading}
            />

            <Pressable
              onPress={() => setIsChooserOpen(true)}
              style={styles.chooseAccountAltBtn}>
              <ThemedText type="code" style={styles.chooseAccountAltText}>
                Atau pilih akun preset / uji coba cepat ›
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.infoBox}>
            <ThemedText type="code" style={styles.infoBoxText}>
              🌐 Terhubung langsung ke Google OAuth 2.0 &amp; Firebase Authentication
            </ThemedText>
          </View>
        </ThemedView>

        {/* Petunjuk Login Mahasiswa */}
        <ThemedView type="backgroundElement" style={styles.guideCard}>
          <ThemedText type="smallBold" style={styles.guideTitle}>
            Pilihan Akun yang Tersedia
          </ThemedText>
          <View style={styles.guideRow}>
            <ThemedText type="smallBold" style={styles.guideBullet}>
              1.
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.guideText}>
              Pilih akun Google Anda (Koordinator Skripsi, Kaprodi, atau Akun Dosen/Admin).
            </ThemedText>
          </View>
          <View style={styles.guideRow}>
            <ThemedText type="smallBold" style={styles.guideBullet}>
              2.
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.guideText}>
              Atau gunakan opsi &ldquo;Gunakan akun lain&rdquo; untuk login dengan akun Google custom Anda.
            </ThemedText>
          </View>
        </ThemedView>
      </View>

      {/* MODAL: Google Account Chooser (Pilih Akun Google) */}
      <Modal
        visible={isChooserOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsChooserOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.accountChooserCard,
              { backgroundColor: isDark ? '#1E1E20' : '#FFFFFF' },
            ]}>
            {/* Header Chooser */}
            <View style={styles.chooserHeader}>
              <View style={styles.chooserTitleRow}>
                <GoogleLogo size={24} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <ThemedText type="smallBold" style={styles.chooserMainTitle}>
                    Pilih akun
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.chooserSubtitle}>
                    untuk melanjutkan ke Skripsi App UNDIP
                  </ThemedText>
                </View>
                <Pressable onPress={() => setIsChooserOpen(false)} style={styles.chooserCloseBtn}>
                  <ThemedText type="smallBold">✕</ThemedText>
                </Pressable>
              </View>
            </View>

            <View style={styles.accountDivider} />

            {/* List Pilihan Akun Google */}
            <ScrollView style={styles.accountListScroll} showsVerticalScrollIndicator={false}>
              {PRESET_GOOGLE_ACCOUNTS.map((acc) => {
                const isThisLoading = selectedAccountId === acc.id;
                return (
                  <Pressable
                    key={acc.id}
                    onPress={() => handleSelectAccount(acc)}
                    disabled={isLoading}
                    style={({ pressed }) => [
                      styles.accountItem,
                      pressed && styles.accountItemPressed,
                    ]}>
                    <View style={styles.accountAvatarWrapper}>
                      <Image
                        source={{ uri: acc.photoUrl }}
                        style={styles.accountAvatar}
                        contentFit="cover"
                      />
                    </View>

                    <View style={styles.accountDetails}>
                      <ThemedText type="smallBold" style={styles.accountName}>
                        {acc.name}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary" style={styles.accountEmail}>
                        {acc.email}
                      </ThemedText>
                      <View style={styles.roleBadge}>
                        <ThemedText type="code" style={styles.roleBadgeText}>
                          {acc.role}
                        </ThemedText>
                      </View>
                    </View>

                    {isThisLoading ? (
                      <ActivityIndicator size="small" color="#3c87f7" />
                    ) : (
                      <ThemedText type="small" themeColor="textSecondary">
                        ›
                      </ThemedText>
                    )}
                  </Pressable>
                );
              })}

              <View style={styles.accountDivider} />

              {/* Pilihan: Gunakan Akun Lain */}
              <Pressable
                onPress={() => setIsCustomOpen(!isCustomOpen)}
                style={({ pressed }) => [
                  styles.useAnotherAccountItem,
                  pressed && styles.accountItemPressed,
                ]}>
                <View style={styles.addAccountIconCircle}>
                  <ThemedText type="smallBold" style={{ color: '#3c87f7' }}>
                    +
                  </ThemedText>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <ThemedText type="smallBold" style={{ color: '#3c87f7' }}>
                    Gunakan akun Google lain
                  </ThemedText>
                  <ThemedText type="code" themeColor="textSecondary">
                    Ketik nama dan email akun Anda sendiri
                  </ThemedText>
                </View>
                <ThemedText type="smallBold" style={{ color: '#3c87f7' }}>
                  {isCustomOpen ? '▲' : '▼'}
                </ThemedText>
              </Pressable>

              {/* Form Input Akun Lain */}
              {isCustomOpen && (
                <View style={styles.customAccountForm}>
                  <ThemedText type="code" themeColor="textSecondary">
                    NAMA LENGKAP
                  </ThemedText>
                  <TextInput
                    value={customName}
                    onChangeText={setCustomName}
                    placeholder="Contoh: Henri Tantyoko"
                    placeholderTextColor={isDark ? '#71717A' : '#9CA3AF'}
                    style={[
                      styles.customInput,
                      {
                        color: isDark ? '#FFF' : '#111',
                        backgroundColor: isDark ? '#27272A' : '#F9FAFB',
                        borderColor: isDark ? '#3F3F46' : '#D1D5DB',
                      },
                    ]}
                  />

                  <ThemedText type="code" themeColor="textSecondary" style={{ marginTop: 8 }}>
                    EMAIL GOOGLE
                  </ThemedText>
                  <TextInput
                    value={customEmail}
                    onChangeText={setCustomEmail}
                    placeholder="nama.anda@gmail.com / @undip.ac.id"
                    placeholderTextColor={isDark ? '#71717A' : '#9CA3AF'}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={[
                      styles.customInput,
                      {
                        color: isDark ? '#FFF' : '#111',
                        backgroundColor: isDark ? '#27272A' : '#F9FAFB',
                        borderColor: isDark ? '#3F3F46' : '#D1D5DB',
                      },
                    ]}
                  />

                  <Pressable
                    onPress={handleCustomLogin}
                    disabled={isLoading || !customName.trim() || !customEmail.trim()}
                    style={[
                      styles.customLoginBtn,
                      (!customName.trim() || !customEmail.trim()) && { opacity: 0.5 },
                    ]}>
                    <ThemedText type="smallBold" style={{ color: '#FFF' }}>
                      Lanjutkan Masuk dengan Akun Ini
                    </ThemedText>
                  </Pressable>
                </View>
              )}
            </ScrollView>

            <View style={styles.accountDivider} />

            {/* Footer Kebijakan Google */}
            <View style={styles.chooserFooter}>
              <ThemedText type="code" themeColor="textSecondary" style={styles.footerNote}>
                Untuk melanjutkan, Google akan membagikan nama, alamat email, dan preferensi akun Anda kepada Skripsi App UNDIP.
              </ThemedText>
            </View>
          </View>
        </View>
      </Modal>
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
    gap: 8,
  },
  chooseAccountAltBtn: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  chooseAccountAltText: {
    fontSize: 11,
    color: '#3c87f7',
    fontWeight: '600',
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#00000080',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  accountChooserCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 24,
    padding: Spacing.four,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  chooserHeader: {
    paddingBottom: Spacing.two,
  },
  chooserTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chooserMainTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  chooserSubtitle: {
    fontSize: 12,
  },
  chooserCloseBtn: {
    padding: 6,
  },
  accountDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#8E918F33',
    marginVertical: Spacing.two,
  },
  accountListScroll: {
    maxHeight: 340,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  accountItemPressed: {
    backgroundColor: '#8E918F18',
  },
  accountAvatarWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  accountAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  accountDetails: {
    flex: 1,
    marginLeft: 12,
    gap: 2,
  },
  accountName: {
    fontSize: 14,
  },
  accountEmail: {
    fontSize: 12,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#3c87f715',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  roleBadgeText: {
    fontSize: 10,
    color: '#3c87f7',
    fontWeight: '700',
  },
  useAnotherAccountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  addAccountIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#3c87f7',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3c87f715',
  },
  customAccountForm: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#8E918F10',
    gap: 6,
  },
  customInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
  },
  customLoginBtn: {
    marginTop: 10,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3c87f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chooserFooter: {
    paddingTop: 4,
  },
  footerNote: {
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
  },
});
