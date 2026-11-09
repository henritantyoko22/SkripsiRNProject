import { Platform } from 'react-native';
import { GOOGLE_SERVICE_CONFIG } from '@/config/googleService.config';

export interface AuthUser {
  id: string;
  name: string | null;
  email: string;
  photoUrl: string | null;
  idToken?: string | null;
  serverAuthCode?: string | null;
  provider: string;
  projectId: string;
  bundleId: string;
  clientId: string;
  loginTimestamp: string;
}

export interface GoogleAccountOption {
  id: string;
  name: string;
  email: string;
  photoUrl: string;
  role: string;
}

export const PRESET_GOOGLE_ACCOUNTS: GoogleAccountOption[] = [
  {
    id: 'google-henri-22',
    name: 'Henri Tantyoko',
    email: 'henritantyoko22@gmail.com',
    photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    role: 'Admin Utama Skripsi',
  },
  {
    id: 'google-aris-undip',
    name: 'Dr. Aris Sugiharto, S.Si., M.Kom.',
    email: 'aris.sugiharto@live.undip.ac.id',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    role: 'Koordinator Skripsi Informatika',
  },
  {
    id: 'google-kusworo-undip',
    name: 'Prof. Dr. Kusworo Adi, S.Si., M.T.',
    email: 'kusworoadi@undip.ac.id',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    role: 'Ketua Departemen Informatika',
  },
  {
    id: 'google-retno-undip',
    name: 'Dr. Retno Kusumaningrum, S.Si., M.Kom.',
    email: 'retno.kusuma@undip.ac.id',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    role: 'Panitia Sidang & Skripsi',
  },
];

let isConfigured = false;

/**
 * Inisialisasi Google Sign In dengan key dari GoogleService-Info.plist
 */
export async function initializeGoogleSignIn(): Promise<boolean> {
  if (isConfigured) return true;

  try {
    const GoogleSigninModule = require('@react-native-google-signin/google-signin');
    if (GoogleSigninModule?.GoogleSignin) {
      GoogleSigninModule.GoogleSignin.configure({
        iosClientId: GOOGLE_SERVICE_CONFIG.CLIENT_ID,
        scopes: ['profile', 'email'],
      });
      isConfigured = true;
      return true;
    }
  } catch {
    // Mode simulasi/Expo Go
  }
  return false;
}

/**
 * Login langsung dengan akun Google yang dipilih dari Account Chooser
 */
export async function signInWithSelectedAccount(account: GoogleAccountOption): Promise<AuthUser> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  return {
    id: account.id,
    name: account.name,
    email: account.email,
    photoUrl: account.photoUrl,
    idToken: 'token-' + account.id,
    provider: 'google.com',
    projectId: GOOGLE_SERVICE_CONFIG.PROJECT_ID,
    bundleId: GOOGLE_SERVICE_CONFIG.BUNDLE_ID,
    clientId: GOOGLE_SERVICE_CONFIG.CLIENT_ID,
    loginTimestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
  };
}

/**
 * Menjalankan alur Sign In dengan Google (Native module atau prompt fallback)
 */
export async function signInWithGoogle(): Promise<AuthUser> {
  const hasNative = await initializeGoogleSignIn();

  if (hasNative) {
    try {
      const { GoogleSignin } = require('@react-native-google-signin/google-signin');
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      // Selalu signOut dulu di native agar prompt pemilihan akun Google selalu muncul
      try {
        await GoogleSignin.signOut();
      } catch {}
      const response = await GoogleSignin.signIn();
      const user = response.data?.user || response.user;
      const tokens = await GoogleSignin.getTokens();

      return {
        id: user.id,
        name: user.name || user.givenName || 'Google User',
        email: user.email,
        photoUrl: user.photo,
        idToken: tokens?.idToken,
        serverAuthCode: response.data?.serverAuthCode,
        provider: 'google.com',
        projectId: GOOGLE_SERVICE_CONFIG.PROJECT_ID,
        bundleId: GOOGLE_SERVICE_CONFIG.BUNDLE_ID,
        clientId: GOOGLE_SERVICE_CONFIG.CLIENT_ID,
        loginTimestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
    } catch (error: any) {
      console.error('[GoogleAuth] Native Sign In error:', error);
      throw error;
    }
  }

  // Jika di simulator / Expo Go tanpa native dev client, default ke akun utama
  return signInWithSelectedAccount(PRESET_GOOGLE_ACCOUNTS[0]);
}

/**
 * Sign Out dari sesi Google
 */
export async function signOutGoogle(): Promise<void> {
  try {
    const GoogleSigninModule = require('@react-native-google-signin/google-signin');
    if (GoogleSigninModule?.GoogleSignin) {
      await GoogleSigninModule.GoogleSignin.signOut();
    }
  } catch {
    // Abaikan jika native module belum terpasang
  }
}
