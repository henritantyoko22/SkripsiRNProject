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

/**
 * Helper PKCE: Generate random string untuk code_verifier
 */
function generateRandomVerifier(length = 64): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Helper PKCE: Konversi bytes ke Base64URL
 */
function bytesToBase64Url(bytes: number[]): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let i = 0;
  for (; i + 2 < bytes.length; i += 3) {
    result += chars[bytes[i] >> 2];
    result += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
    result += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
    result += chars[bytes[i + 2] & 63];
  }
  if (i < bytes.length) {
    result += chars[bytes[i] >> 2];
    if (i + 1 < bytes.length) {
      result += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
      result += chars[(bytes[i + 1] & 15) << 2];
    } else {
      result += chars[(bytes[i] & 3) << 4];
    }
  }
  return result.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Helper PKCE: SHA-256 murni JS yang kompatibel di semua engine React Native / Hermes
 */
function computeSha256Base64Url(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let i, j;
  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;
  const hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;
  const isComposite: Record<number, boolean> = {};

  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) isComposite[i] = true;
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  ascii += '\x80';
  while ((ascii.length % 64) - 56) ascii += '\x00';
  for (i = 0; i < ascii.length; i++) {
    j = ascii.charCodeAt(i);
    words[i >> 2] |= j << ((3 - (i % 4)) * 8);
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;

  for (j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = [...hash];
    for (i = 0; i < 64; i++) {
      if (i >= 16) {
        const w15 = w[i - 15],
          w2 = w[i - 2];
        const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
        const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const s0 = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const s1 = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      const temp1 = (hash[7] + s1 + ch + k[i] + w[i]) | 0;
      const temp2 = (s0 + maj) | 0;
      hash[7] = hash[6];
      hash[6] = hash[5];
      hash[5] = hash[4];
      hash[4] = (hash[3] + temp1) | 0;
      hash[3] = hash[2];
      hash[2] = hash[1];
      hash[1] = hash[0];
      hash[0] = (temp1 + temp2) | 0;
    }
    for (i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
  }

  const bytes: number[] = [];
  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      bytes.push((hash[i] >> (8 * j)) & 255);
    }
  }

  return bytesToBase64Url(bytes);
}

function extractQueryParam(url: string, param: string): string | null {
  const match = url.match(new RegExp('[#?&]' + param + '=([^&#]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Otentikasi LANGSUNG ke Google OAuth 2.0 (Authorization Code Flow dengan PKCE)
 * Memperbaiki Error 400: unsupported_response_type
 */
export async function signInWithRealGoogleOAuth(): Promise<AuthUser> {
  // 1. Buat PKCE Code Verifier dan Code Challenge
  const codeVerifier = generateRandomVerifier(64);
  const codeChallenge = computeSha256Base64Url(codeVerifier);

  // 2. Redirect URI sesuai skema iOS terdaftar
  const redirectUri = `${GOOGLE_SERVICE_CONFIG.REVERSED_CLIENT_ID}:/oauth2redirect`;

  // 3. Authorization URL resmi Google (response_type=code untuk klien iOS)
  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(GOOGLE_SERVICE_CONFIG.CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent('openid profile email')}` +
    `&code_challenge=${encodeURIComponent(codeChallenge)}` +
    `&code_challenge_method=S256` +
    `&prompt=select_account`;

  console.log('[GoogleOAuth] Membuka Google OAuth dengan PKCE response_type=code...');

  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

  if (result.type === 'success' && result.url) {
    const authCode = extractQueryParam(result.url, 'code');
    if (!authCode) {
      const err = extractQueryParam(result.url, 'error');
      throw new Error(`Google Auth ditolak: ${err || 'Kode otorisasi tidak ditemukan.'}`);
    }

    // 4. Tukarkan authorization code + code_verifier dengan Token di Google Token Endpoint
    const tokenParams = new URLSearchParams({
      client_id: GOOGLE_SERVICE_CONFIG.CLIENT_ID,
      code: authCode,
      code_verifier: codeVerifier,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    });

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams.toString(),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      console.warn('[GoogleOAuth] Gagal menukarkan code dengan token:', errBody);
      throw new Error('Gagal menukarkan kode otentikasi Google dengan token.');
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    const idToken = tokenData.id_token;

    // 5. Ambil data profil dari Google UserInfo API
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const googleUser = userInfoRes.ok ? await userInfoRes.json() : {};

    // 6. Verifikasi dan daftarkan ke Firebase Authentication REST API
    let firebaseUid = googleUser.id || 'firebase-usr-' + Date.now();
    try {
      const firebaseAuthUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${GOOGLE_SERVICE_CONFIG.API_KEY}`;
      const postBody = idToken
        ? `id_token=${idToken}&providerId=google.com`
        : `access_token=${accessToken}&providerId=google.com`;

      const fbRes = await fetch(firebaseAuthUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postBody: postBody,
          requestUri: 'http://localhost',
          returnIdpCredential: true,
          returnSecureToken: true,
        }),
      });

      if (fbRes.ok) {
        const fbData = await fbRes.json();
        firebaseUid = fbData.localId || firebaseUid;
        console.log('[FirebaseAuth] Sukses login Firebase Auth UID:', firebaseUid);
      }
    } catch (err) {
      console.warn('[FirebaseAuth] Gagal integrasi REST Firebase Auth:', err);
    }

    return {
      id: firebaseUid,
      name: googleUser.name || 'Pengguna Google',
      email: googleUser.email,
      photoUrl: googleUser.picture || null,
      idToken: idToken || accessToken,
      provider: 'google.com',
      projectId: GOOGLE_SERVICE_CONFIG.PROJECT_ID,
      bundleId: GOOGLE_SERVICE_CONFIG.BUNDLE_ID,
      clientId: GOOGLE_SERVICE_CONFIG.CLIENT_ID,
      loginTimestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };
  }

  if (result.type === 'cancel' || result.type === 'dismiss') {
    throw new Error('Login Google dibatalkan oleh pengguna.');
  }

  throw new Error('Otentikasi Google tidak mengembalikan hasil.');
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

  // Jika di Expo Go / Web, jalankan Authorization Code Flow dengan PKCE
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
