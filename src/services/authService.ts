import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { GOOGLE_SERVICE_CONFIG } from '@/config/googleService.config';

WebBrowser.maybeCompleteAuthSession();

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
 * Inisialisasi Google Sign In native jika tersedia
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
    // Mode Expo Go / Web
  }
  return false;
}

function extractQueryParam(url: string, param: string): string | null {
  const match = url.match(new RegExp('[#?&]' + param + '=([^&#]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Otentikasi LANGSUNG ke Google OAuth 2.0 (accounts.google.com) dan Firebase Authentication
 * Membuka browser sheet resmi Google untuk memilih akun / login akun Google asli
 */
export async function signInWithRealGoogleOAuth(): Promise<AuthUser> {
  const redirectUri = `${GOOGLE_SERVICE_CONFIG.REVERSED_CLIENT_ID}:/oauth2redirect`;
  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(GOOGLE_SERVICE_CONFIG.CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=token` +
    `&scope=${encodeURIComponent('openid profile email')}` +
    `&prompt=select_account`;

  console.log('[GoogleOAuth] Membuka jendela resmi Google Sign-In:', authUrl);

  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

  if (result.type === 'success' && result.url) {
    const accessToken = extractQueryParam(result.url, 'access_token');
    if (accessToken) {
      // 1. Ambil profil pengguna asli dari API Google
      const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!userInfoRes.ok) {
        throw new Error('Gagal mengambil data profil dari Google API.');
      }

      const googleUser = await userInfoRes.json();

      // 2. Verifikasi dan daftarkan sesi ke Firebase Authentication REST API
      let firebaseUid = googleUser.id;
      try {
        const firebaseAuthUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${GOOGLE_SERVICE_CONFIG.API_KEY}`;
        const fbRes = await fetch(firebaseAuthUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postBody: `access_token=${accessToken}&providerId=google.com`,
            requestUri: 'http://localhost',
            returnIdpCredential: true,
            returnSecureToken: true,
          }),
        });

        if (fbRes.ok) {
          const fbData = await fbRes.json();
          firebaseUid = fbData.localId || googleUser.id;
          console.log('[FirebaseAuth] Berhasil login ke Firebase Auth UID:', firebaseUid);
        }
      } catch (err) {
        console.warn('[FirebaseAuth] Gagal integrasi REST Firebase Auth:', err);
      }

      return {
        id: firebaseUid,
        name: googleUser.name || 'Pengguna Google',
        email: googleUser.email,
        photoUrl: googleUser.picture || null,
        idToken: accessToken,
        provider: 'google.com',
        projectId: GOOGLE_SERVICE_CONFIG.PROJECT_ID,
        bundleId: GOOGLE_SERVICE_CONFIG.BUNDLE_ID,
        clientId: GOOGLE_SERVICE_CONFIG.CLIENT_ID,
        loginTimestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
    }
  }

  if (result.type === 'cancel' || result.type === 'dismiss') {
    throw new Error('Login Google dibatalkan oleh pengguna.');
  }

  throw new Error('Otentikasi Google tidak mengembalikan token.');
}

/**
 * Login langsung dengan akun yang dipilih dari dialog
 */
export async function signInWithSelectedAccount(account: GoogleAccountOption): Promise<AuthUser> {
  await new Promise((resolve) => setTimeout(resolve, 300));

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
 * Menjalankan alur Sign In dengan Google
 */
export async function signInWithGoogle(): Promise<AuthUser> {
  // Cek native module terlebih dahulu jika ada
  const hasNative = await initializeGoogleSignIn();
  if (hasNative) {
    try {
      const { GoogleSignin } = require('@react-native-google-signin/google-signin');
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
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

  // Jika native module belum dikompilasi di Expo Go, jalankan Google OAuth via WebBrowser
  return await signInWithRealGoogleOAuth();
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
