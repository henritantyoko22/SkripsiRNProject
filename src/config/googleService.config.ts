/**
 * Konfigurasi Integrasi Google Sign-In & Firebase
 * Diambil langsung dan disinkronkan dengan file: GoogleService-Info.plist
 */

export interface GoogleServiceInfoConfig {
  CLIENT_ID: string;
  REVERSED_CLIENT_ID: string;
  API_KEY: string;
  GCM_SENDER_ID: string;
  PLIST_VERSION: string;
  BUNDLE_ID: string;
  PROJECT_ID: string;
  STORAGE_BUCKET: string;
  GOOGLE_APP_ID: string;
  IS_SIGNIN_ENABLED: boolean;
  IS_GCM_ENABLED: boolean;
  IS_APPINVITE_ENABLED: boolean;
  IS_ADS_ENABLED: boolean;
  IS_ANALYTICS_ENABLED: boolean;
}

export const GOOGLE_SERVICE_CONFIG: GoogleServiceInfoConfig = {
  // iOS OAuth Client ID dari Google Console / Firebase
  CLIENT_ID: '713806429454-0gba7b84e5c7ggldl0skka1iatfrgbok.apps.googleusercontent.com',

  // Skema URL balik untuk redirect kembali ke app di iOS
  REVERSED_CLIENT_ID: 'com.googleusercontent.apps.713806429454-0gba7b84e5c7ggldl0skka1iatfrgbok',

  // Firebase Web API Key
  API_KEY: 'AIzaSyBxTNIy5sFRAvcIpaGUji_DVIlOnz0qk3k',

  // Google Cloud Messaging / Firebase Cloud Messaging Sender ID
  GCM_SENDER_ID: '713806429454',

  PLIST_VERSION: '1',

  // Bundle Identifier iOS (harus sama persis dengan yang terdaftar di Google Console)
  BUNDLE_ID: 'com.undip.SkripsiProjectApp',

  // Nama Project Firebase
  PROJECT_ID: 'appbaru-8a5da',

  // Cloud Storage Bucket
  STORAGE_BUCKET: 'appbaru-8a5da.firebasestorage.app',

  // ID Aplikasi Firebase untuk platform iOS
  GOOGLE_APP_ID: '1:713806429454:ios:af64b2bc70138f50d26b5f',

  IS_SIGNIN_ENABLED: true,
  IS_GCM_ENABLED: true,
  IS_APPINVITE_ENABLED: true,
  IS_ADS_ENABLED: false,
  IS_ANALYTICS_ENABLED: false,
};

export default GOOGLE_SERVICE_CONFIG;
