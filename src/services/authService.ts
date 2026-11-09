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

let isConfigured = false;

/**
 * Inisialisasi Google Sign In dengan key dari GoogleService-Info.plist
 */
export async function initializeGoogleSignIn(): Promise<boolean> {
  if (isConfigured) return true;

  try {
    // Dynamic import untuk mencegah crash jika native module belum ter-compile di Expo Go
    const GoogleSigninModule = require('@react-native-google-signin/google-signin');
    if (GoogleSigninModule?.GoogleSignin) {
      GoogleSigninModule.GoogleSignin.configure({
        iosClientId: GOOGLE_SERVICE_CONFIG.CLIENT_ID,
        scopes: ['profile', 'email'],
      });
      isConfigured = true;
      console.log('[GoogleAuth] Google Sign-In terkonfigurasi dengan iOS Client ID:', GOOGLE_SERVICE_CONFIG.CLIENT_ID);
      return true;
    }
  } catch {
    console.log(
      '[GoogleAuth] Native @react-native-google-signin/google-signin belum terpasang atau sedang berjalan di mode Expo Go/Web. Mode simulasi aktif.'
    );
  }
  return false;
}

/**
 * Menjalankan alur Sign In dengan Google
 */
export async function signInWithGoogle(): Promise<AuthUser> {
  const hasNative = await initializeGoogleSignIn();

  if (hasNative) {
    try {
      const { GoogleSignin } = require('@react-native-google-signin/google-signin');
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
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

  // Fallback simulator / demo account untuk preview tampilan di Expo Go atau Web
  await new Promise((resolve) => setTimeout(resolve, 600));

  return {
    id: 'google-usr-' + Math.floor(100000 + Math.random() * 900000),
    name: 'Mahasiswa Undip',
    email: 'skripsi.undip@gmail.com',
    photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    idToken: 'mock-google-id-token-' + GOOGLE_SERVICE_CONFIG.PROJECT_ID,
    provider: 'google.com',
    projectId: GOOGLE_SERVICE_CONFIG.PROJECT_ID,
    bundleId: GOOGLE_SERVICE_CONFIG.BUNDLE_ID,
    clientId: GOOGLE_SERVICE_CONFIG.CLIENT_ID,
    loginTimestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
  };
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
