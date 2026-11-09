import * as WebBrowser from 'expo-web-browser';
import { GOOGLE_SERVICE_CONFIG } from '@/config/googleService.config';
import { fetchMahasiswaData } from '@/services/studentService';
import {
  fetchUserFromFirestore,
  saveUserToFirestore,
  findUserInFirestore,
} from '@/services/userService';

WebBrowser.maybeCompleteAuthSession();

export type UserRole = 'admin' | 'user';

export interface AuthUser {
  id: string;
  name: string | null;
  email: string;
  photoUrl: string | null;
  role: UserRole;
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
 * Menentukan role pengguna:
 * Email admin: henritantyoko@..., henritantyoko22@..., atau mengandung kata 'admin' / 'dosen' / 'kaprodi'
 * Sisanya adalah role 'user' (mahasiswa).
 */
export function determineRole(email: string): UserRole {
  const lower = email.toLowerCase().trim();
  if (
    lower.includes('admin') ||
    lower.startsWith('henritantyoko') ||
    lower.includes('dosen') ||
    lower.includes('kaprodi')
  ) {
    return 'admin';
  }
  return 'user';
}

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
 * Helper PKCE: SHA-256 murni JS
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
 * 1. Otentikasi Email & Password (Login)
 */
/**
 * 1. Otentikasi Email & Password (Login)
 * Memverifikasi username/email dan KATA SANDI (PASSWORD) langsung dari table 'users' di Cloud Firestore!
 */
export async function signInWithEmailPassword(identifierInput: string, passwordInput: string): Promise<AuthUser> {
  const cleanInput = identifierInput.trim();
  const password = passwordInput.trim();

  if (!cleanInput || !password) {
    throw new Error('Silakan isi email/username dan kata sandi Anda.');
  }

  // 1. Cari data akun di koleksi 'users' Cloud Firestore
  let userAccount = await findUserInFirestore(cleanInput);

  // Jika tidak ditemukan di 'users', coba cek apakah ada di koleksi 'mahasiswa'
  if (!userAccount) {
    const candidateEmail = cleanInput.includes('@') ? cleanInput : `${cleanInput}@undip.ac.id`;
    try {
      const student = await fetchMahasiswaData(candidateEmail);
      if (student && student.nama) {
        userAccount = {
          uid: 'usr_' + Date.now(),
          nama: student.nama,
          email: student.email,
          nim: student.nim,
          role: 'user',
          status: 'Aktif',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };
        await saveUserToFirestore(userAccount);
      }
    } catch {}
  }

  if (!userAccount) {
    throw new Error('Email atau username tidak terdaftar. Silakan periksa kembali atau lakukan pendaftaran di tab Daftar.');
  }

  // 2. PENGECEKAN KATA SANDI (PASSWORD) SESUAI DATA DI TABLE USER FIRESTORE
  if (userAccount.password) {
    if (userAccount.password !== password) {
      throw new Error('Kata sandi salah. Silakan periksa kembali kata sandi Anda.');
    }
  } else {
    // Jika belum tersimpan field password di user doc Firestore, cocokkan via Firebase Auth REST API
    try {
      const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${GOOGLE_SERVICE_CONFIG.API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userAccount.email,
          password: password,
          returnSecureToken: true,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        const code = data?.error?.message || '';
        if (code.includes('INVALID_PASSWORD') || code.includes('INVALID_LOGIN_CREDENTIALS')) {
          throw new Error('Kata sandi salah. Silakan periksa kembali kata sandi Anda.');
        }
      }
    } catch (err: any) {
      if (err?.message?.includes('Kata sandi salah')) {
        throw err;
      }
    }

    // Simpan password ke Firestore agar terverifikasi secara konsisten seterusnya
    userAccount.password = password;
  }

  // Update lastLogin dan simpan ke Firestore
  userAccount.lastLogin = new Date().toISOString();
  saveUserToFirestore(userAccount).catch(() => {});

  const role: UserRole = userAccount.role;
  let displayName = userAccount.nama || userAccount.email.split('@')[0];

  // Jika user biasa, sinkronkan profilnya di koleksi mahasiswa Firestore
  if (role === 'user') {
    const student = await fetchMahasiswaData(userAccount.email, displayName);
    displayName = student.nama || displayName;
  }

  return {
    id: userAccount.uid || 'usr-' + Date.now(),
    name: displayName,
    email: userAccount.email,
    photoUrl: null,
    role: role,
    idToken: 'token-' + Date.now(),
    provider: 'password',
    projectId: GOOGLE_SERVICE_CONFIG.PROJECT_ID,
    bundleId: GOOGLE_SERVICE_CONFIG.BUNDLE_ID,
    clientId: GOOGLE_SERVICE_CONFIG.CLIENT_ID,
    loginTimestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
  };
}

/**
 * 2. Registrasi Akun Baru (Register):
 * Otomatis memasukkan pengguna ke koleksi 'users' (User Management) dengan role: 'user'
 * LENGKAP dengan field password, dan membuat dokumen di koleksi 'mahasiswa' Firestore.
 */
export async function signUpWithEmailPassword(
  nameInput: string,
  emailInput: string,
  passwordInput: string
): Promise<AuthUser> {
  const email = emailInput.includes('@') ? emailInput.trim() : `${emailInput.trim()}@undip.ac.id`;
  const role: UserRole = 'user'; // Pendaftar baru otomatis dimasukkan ke role 'user' (Mahasiswa)

  let localId = 'usr-' + Date.now();
  let idToken = 'token-' + Date.now();

  try {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${GOOGLE_SERVICE_CONFIG.API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: passwordInput,
        returnSecureToken: true,
      }),
    });

    const data = await response.json();
    if (response.ok && data.localId) {
      localId = data.localId;
      idToken = data.idToken || idToken;

      // Update displayName di Firebase Auth
      const updateUrl = `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${GOOGLE_SERVICE_CONFIG.API_KEY}`;
      fetch(updateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken: data.idToken,
          displayName: nameInput.trim(),
          returnSecureToken: true,
        }),
      }).catch(() => {});
    } else {
      const code = data?.error?.message || '';
      if (code.includes('EMAIL_EXISTS')) {
        throw new Error('Email ini sudah terdaftar. Silakan pilih tab Masuk.');
      }
      if (code.includes('WEAK_PASSWORD')) {
        throw new Error('Kata sandi terlalu pendek. Minimal 6 karakter.');
      }
      console.log('[FirebaseAuth] Registrasi diproses dan disimpan ke Firestore...');
    }
  } catch (err: any) {
    if (err?.message?.includes('sudah terdaftar') || err?.message?.includes('terlalu pendek')) {
      throw err;
    }
  }

  // 1. Simpan ke koleksi 'users' di Cloud Firestore (User Management) LENGKAP DENGAN PASSWORD!
  await saveUserToFirestore({
    uid: localId,
    nama: nameInput.trim(),
    email: email,
    password: passwordInput.trim(),
    role: 'user',
    status: 'Aktif',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  });

  // 2. Simpan ke koleksi 'mahasiswa' di Cloud Firestore
  await fetchMahasiswaData(email, nameInput.trim());

  return {
    id: localId,
    name: nameInput.trim() || email.split('@')[0],
    email: email,
    photoUrl: null,
    role: role,
    idToken: idToken,
    provider: 'password',
    projectId: GOOGLE_SERVICE_CONFIG.PROJECT_ID,
    bundleId: GOOGLE_SERVICE_CONFIG.BUNDLE_ID,
    clientId: GOOGLE_SERVICE_CONFIG.CLIENT_ID,
    loginTimestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
  };
}

/**
 * 3. Otentikasi LANGSUNG ke Google OAuth 2.0 (Authorization Code Flow dengan PKCE)
 */
export async function signInWithRealGoogleOAuth(): Promise<AuthUser> {
  const codeVerifier = generateRandomVerifier(64);
  const codeChallenge = computeSha256Base64Url(codeVerifier);
  const redirectUri = `${GOOGLE_SERVICE_CONFIG.REVERSED_CLIENT_ID}:/oauth2redirect`;

  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(GOOGLE_SERVICE_CONFIG.CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent('openid profile email')}` +
    `&code_challenge=${encodeURIComponent(codeChallenge)}` +
    `&code_challenge_method=S256` +
    `&prompt=select_account`;

  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

  if (result.type === 'success' && result.url) {
    const authCode = extractQueryParam(result.url, 'code');
    if (!authCode) {
      const err = extractQueryParam(result.url, 'error');
      throw new Error(`Google Auth ditolak: ${err || 'Kode otorisasi tidak ditemukan.'}`);
    }

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
      throw new Error('Gagal menukarkan kode otentikasi Google dengan token.');
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    const idToken = tokenData.id_token;

    // Ambil data profil dari Google UserInfo API
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const googleUser = userInfoRes.ok ? await userInfoRes.json() : {};

    // Daftarkan sesi ke Firebase Authentication REST API
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
      }
    } catch (err) {
      console.warn('[FirebaseAuth] Gagal integrasi REST Firebase Auth:', err);
    }

    const userAccount = await fetchUserFromFirestore(googleUser.email, googleUser.name);
    const role = userAccount.role;

    // Jika role 'user', buatkan/ambil datanya di koleksi mahasiswa
    if (role === 'user') {
      await fetchMahasiswaData(googleUser.email, googleUser.name, googleUser.picture);
    }

    return {
      id: firebaseUid,
      name: googleUser.name || 'Pengguna Google',
      email: googleUser.email,
      photoUrl: googleUser.picture || null,
      role: role,
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
      const userAccount = await fetchUserFromFirestore(user.email || '', user.name || user.givenName);
      const role = userAccount.role;

      return {
        id: user.id,
        name: user.name || user.givenName || 'Google User',
        email: user.email,
        photoUrl: user.photo,
        role: role,
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

  return await signInWithRealGoogleOAuth();
}

/**
 * Sign Out dari sesi
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
