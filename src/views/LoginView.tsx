import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { ThemedText } from '@/components/themed-text';
import { Spacing, MaxContentWidth } from '@/constants/theme';

export function LoginView() {
  const { signIn, signInWithEmail, registerUser, isLoading, error, clearError } = useAuth();

  // Mode tab: 'login' atau 'register'
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // State Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // State Register
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleTabChange = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    clearError();
    setValidationError(null);
  };

  const handleLoginSubmit = async () => {
    setValidationError(null);
    clearError();

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setValidationError('Silakan isi email/username dan kata sandi Anda.');
      return;
    }

    try {
      await signInWithEmail(loginEmail, loginPassword);
    } catch {
      // Error disimpan di AuthContext
    }
  };

  const handleRegisterSubmit = async () => {
    setValidationError(null);
    clearError();

    if (!registerName.trim()) {
      setValidationError('Silakan masukkan nama lengkap Anda.');
      return;
    }
    if (!registerEmail.trim()) {
      setValidationError('Silakan masukkan alamat email atau username.');
      return;
    }
    if (registerPassword.length < 6) {
      setValidationError('Kata sandi minimal 6 karakter.');
      return;
    }
    if (registerPassword !== registerConfirmPassword) {
      setValidationError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    try {
      await registerUser(registerName, registerEmail, registerPassword);
      Alert.alert(
        'Pendaftaran Berhasil',
        `Akun ${registerEmail.trim()} berhasil didaftarkan di database Cloud Firestore!\n\nSilakan masuk menggunakan email/username dan kata sandi Anda.`,
        [
          {
            text: 'Masuk Sekarang',
            onPress: () => {
              setLoginEmail(registerEmail.trim());
              setLoginPassword('');
              setActiveTab('login');
              setRegisterPassword('');
              setRegisterConfirmPassword('');
            },
          },
        ]
      );
    } catch {
      // Error disimpan di AuthContext
    }
  };

  const displayError = validationError || error;

  return (
    <View style={styles.outerScreen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Header Universitas (Light Mode) */}
          <View style={styles.header}>
            <View style={styles.badge}>
              <ThemedText type="code" style={styles.badgeText}>
                UNIVERSITAS DIPONEGORO
              </ThemedText>
            </View>
            <ThemedText type="subtitle" style={styles.title}>
              Portal Skripsi
            </ThemedText>
            <ThemedText type="small" style={styles.subtitle}>
              Sistem Informasi &amp; Pengelolaan Tugas Akhir Mahasiswa
            </ThemedText>
          </View>

          {/* Notifikasi Error jika ada */}
          {displayError && (
            <View style={styles.errorBanner}>
              <ThemedText type="small" style={styles.errorText}>
                {displayError}
              </ThemedText>
              <Pressable
                onPress={() => {
                  setValidationError(null);
                  clearError();
                }}
                style={styles.errorClose}>
                <ThemedText type="smallBold" style={styles.errorCloseText}>
                  ✕
                </ThemedText>
              </Pressable>
            </View>
          )}

          {/* Kartu Autentikasi Utama (Clean White Light Mode) */}
          <View style={styles.authCard}>
            {/* Tab Switcher: Masuk vs Daftar */}
            <View style={styles.tabSwitcher}>
              <Pressable
                onPress={() => handleTabChange('login')}
                style={[styles.tabButton, activeTab === 'login' && styles.tabButtonActive]}>
                <ThemedText
                  type="smallBold"
                  style={[styles.tabText, activeTab === 'login' && styles.tabTextActive]}>
                  Masuk (Login)
                </ThemedText>
              </Pressable>

              <Pressable
                onPress={() => handleTabChange('register')}
                style={[styles.tabButton, activeTab === 'register' && styles.tabButtonActive]}>
                <ThemedText
                  type="smallBold"
                  style={[styles.tabText, activeTab === 'register' && styles.tabTextActive]}>
                  Daftar (Register)
                </ThemedText>
              </Pressable>
            </View>

            {/* FORM 1: MASUK (LOGIN) */}
            {activeTab === 'login' && (
              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <ThemedText type="smallBold" style={styles.label}>
                    Email atau Username
                  </ThemedText>
                  <TextInput
                    value={loginEmail}
                    onChangeText={setLoginEmail}
                    placeholder="nama@undip.ac.id atau username"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                    style={styles.textInput}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <ThemedText type="smallBold" style={styles.label}>
                    Kata Sandi
                  </ThemedText>
                  <View style={styles.passwordWrapper}>
                    <TextInput
                      value={loginPassword}
                      onChangeText={setLoginPassword}
                      placeholder="Masukkan kata sandi"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!showLoginPassword}
                      autoCapitalize="none"
                      style={styles.passwordInput}
                    />
                    <Pressable
                      onPress={() => setShowLoginPassword(!showLoginPassword)}
                      style={styles.eyeBtn}>
                      <ThemedText type="code" style={styles.eyeBtnText}>
                        {showLoginPassword ? 'Sembunyi' : 'Lihat'}
                      </ThemedText>
                    </Pressable>
                  </View>
                </View>

                <Pressable
                  onPress={handleLoginSubmit}
                  disabled={isLoading}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.buttonPressed,
                  ]}>
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <ThemedText type="smallBold" style={styles.primaryButtonText}>
                      Masuk ke Akun
                    </ThemedText>
                  )}
                </Pressable>
              </View>
            )}

            {/* FORM 2: DAFTAR (REGISTER) */}
            {activeTab === 'register' && (
              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <ThemedText type="smallBold" style={styles.label}>
                    Nama Lengkap
                  </ThemedText>
                  <TextInput
                    value={registerName}
                    onChangeText={setRegisterName}
                    placeholder="Contoh: Henri Tantyoko"
                    placeholderTextColor="#94A3B8"
                    style={styles.textInput}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <ThemedText type="smallBold" style={styles.label}>
                    Alamat Email
                  </ThemedText>
                  <TextInput
                    value={registerEmail}
                    onChangeText={setRegisterEmail}
                    placeholder="email@students.undip.ac.id"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.textInput}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <ThemedText type="smallBold" style={styles.label}>
                    Kata Sandi Baru
                  </ThemedText>
                  <View style={styles.passwordWrapper}>
                    <TextInput
                      value={registerPassword}
                      onChangeText={setRegisterPassword}
                      placeholder="Minimal 6 karakter"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!showRegisterPassword}
                      autoCapitalize="none"
                      style={styles.passwordInput}
                    />
                    <Pressable
                      onPress={() => setShowRegisterPassword(!showRegisterPassword)}
                      style={styles.eyeBtn}>
                      <ThemedText type="code" style={styles.eyeBtnText}>
                        {showRegisterPassword ? 'Sembunyi' : 'Lihat'}
                      </ThemedText>
                    </Pressable>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <ThemedText type="smallBold" style={styles.label}>
                    Konfirmasi Kata Sandi
                  </ThemedText>
                  <TextInput
                    value={registerConfirmPassword}
                    onChangeText={setRegisterConfirmPassword}
                    placeholder="Ketik ulang kata sandi"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showRegisterPassword}
                    autoCapitalize="none"
                    style={styles.textInput}
                  />
                </View>

                <Pressable
                  onPress={handleRegisterSubmit}
                  disabled={isLoading}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.buttonPressed,
                  ]}>
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <ThemedText type="smallBold" style={styles.primaryButtonText}>
                      Daftar Akun Baru
                    </ThemedText>
                  )}
                </Pressable>
              </View>
            )}

            {/* Separator / Pembatas Opsi */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <ThemedText type="code" style={styles.dividerText}>
                atau
              </ThemedText>
              <View style={styles.dividerLine} />
            </View>

            {/* Tombol Google Sign In */}
            <View style={styles.googleButtonWrapper}>
              <GoogleSignInButton
                title={activeTab === 'login' ? 'Masuk dengan Google' : 'Daftar dengan Google'}
                onPress={signIn}
                isLoading={isLoading}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerScreen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
  container: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    gap: Spacing.three,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  badge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1D4ED8',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    color: '#64748B',
    lineHeight: 18,
    maxWidth: 320,
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderColor: '#F87171',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    color: '#991B1B',
    fontSize: 13,
    flex: 1,
  },
  errorClose: {
    padding: 4,
    marginLeft: 8,
  },
  errorCloseText: {
    color: '#991B1B',
    fontSize: 14,
  },
  authCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: Spacing.four,
    gap: Spacing.three,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#1D4ED8',
    fontWeight: '800',
  },
  formContainer: {
    gap: Spacing.three,
    marginTop: 4,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '700',
  },
  textInput: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#0F172A',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#0F172A',
  },
  eyeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  eyeBtnText: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '700',
  },
  primaryButton: {
    height: 48,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#94A3B8',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  googleButtonWrapper: {
    width: '100%',
  },
});
