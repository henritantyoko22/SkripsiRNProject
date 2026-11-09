# 🚀 Panduan Koleksi Postman: Firebase Auth & Cloud Firestore REST API
## Portal Skripsi Universitas Diponegoro (React Native App)

File koleksi Postman siap pakai telah disediakan di:
📁 [**`Postman_Collection_Firebase_Skripsi.json`**](file:///Users/henri/Downloads/React%20Native%20App/SkripsiRNProject/Postman_Collection_Firebase_Skripsi.json)

---

## 📥 Cara Impor ke Aplikasi Postman

1. Buka aplikasi **Postman**.
2. Klik tombol **Import** di pojok kiri atas (atau tekan `Ctrl + O` / `Cmd + O`).
3. Pilih atau *drag & drop* file:  
   `SkripsiRNProject/Postman_Collection_Firebase_Skripsi.json`.
4. Koleksi bernama **`Firebase & Firestore REST API - Portal Skripsi UNDIP`** akan langsung muncul di panel sebelah kiri.

---

## ⚙️ Variabel Koleksi (Collection Variables)

Koleksi ini sudah dikonfigurasi dengan variabel otomatis:

| Variabel | Nilai Default | Deskripsi |
|---|---|---|
| `{{projectId}}` | `appbaru-8a5da` | ID Project Firebase Cloud Firestore |
| `{{apiKey}}` | `AIzaSyBxTNIy5sFRAvcIpaGUji_DVIlOnz0qk3k` | Web API Key Firebase |
| `{{clientId}}` | `713806429454-0gba7b84e5c7ggldl0skka1iatfrgbok...` | Klien ID Google OAuth 2.0 |
| `{{idToken}}` | *(Otomatis terisi saat login)* | Token JWT pengguna Firebase yang sedang aktif |

> 💡 **Fitur Otomatis:** Ketika Anda menjalankan request **`1.2 Masuk dengan Email & Password`**, Postman memiliki *Test Script* yang otomatis mengambil `idToken` dari respons dan menyimpannya ke variabel `{{idToken}}`.

---

## 📑 Daftar Lengkap Endpoint

### 1. Folder: Firebase Authentication (Identity Toolkit)
Menggunakan endpoint resmi Google Identity Toolkit REST API: `https://identitytoolkit.googleapis.com/v1/accounts:*`

* **`1.1 Registrasi Akun Baru (Sign Up)`**
  * **Metode**: `POST`
  * **URL**: `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={{apiKey}}`
  * **Body**:
    ```json
    {
      "email": "mahasiswa_baru@students.undip.ac.id",
      "password": "undip123456",
      "returnSecureToken": true
    }
    ```
  * **Output**: Mengembalikan `localId` (UID) dan `idToken`.

* **`1.2 Masuk dengan Email & Password (Sign In)`**
  * **Metode**: `POST`
  * **URL**: `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={{apiKey}}`
  * **Body**:
    ```json
    {
      "email": "admin@undip.ac.id",
      "password": "adminundip_password",
      "returnSecureToken": true
    }
    ```

* **`1.3 Update Profil Pengguna (Display Name)`**
  * **Metode**: `POST`
  * **URL**: `https://identitytoolkit.googleapis.com/v1/accounts:update?key={{apiKey}}`
  * **Body**:
    ```json
    {
      "idToken": "{{idToken}}",
      "displayName": "Henri Tantyoko",
      "returnSecureToken": true
    }
    ```

* **`1.4 Ambil Data Pengguna (Lookup User Profile)`**
  * **Metode**: `POST`
  * **URL**: `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key={{apiKey}}`
  * **Body**: `{ "idToken": "{{idToken}}" }`

* **`1.5 Kirim Email Reset Kata Sandi`**
  * **Metode**: `POST`
  * **URL**: `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key={{apiKey}}`
  * **Body**: `{ "requestType": "PASSWORD_RESET", "email": "henritantyoko@gmail.com" }`

---

### 2. Folder: Google OAuth 2.0 (PKCE Flow)
* **`2.1 URL Otorisasi Google (WebAuthSession / Browser)`**
  * **Metode**: `GET`
  * **URL**:  
    `https://accounts.google.com/o/oauth2/v2/auth?client_id={{clientId}}&redirect_uri=com.googleusercontent.apps.713806429454-0gba7b84e5c7ggldl0skka1iatfrgbok:/oauth2redirect&response_type=code&scope=openid%20profile%20email&code_challenge=CODE_CHALLENGE&code_challenge_method=S256&prompt=select_account`
  * **Fungsi**: Membuka halaman login & pemilihan akun Google di browser.

* **`2.2 Tukar Authorization Code dengan Token Google (Token Exchange)`**
  * **Metode**: `POST`
  * **URL**: `https://oauth2.googleapis.com/token`
  * **Header**: `Content-Type: application/x-www-form-urlencoded`
  * **Body**:
    - `client_id`: `{{clientId}}`
    - `grant_type`: `authorization_code`
    - `code`: `<CODE_DARI_REDIRECT>`
    - `redirect_uri`: `com.googleusercontent.apps.713806429454-0gba7b84e5c7ggldl0skka1iatfrgbok:/oauth2redirect`
    - `code_verifier`: `<CODE_VERIFIER_ORIGINAL>`

---

### 3. Folder: Cloud Firestore - Koleksi `users` (User Management & RBAC)
*Format REST API Firestore membungkus data dalam objek tipe (`stringValue`, `integerValue`, dll).*

* **`3.1 Ambil Semua Akun Pengguna (Get All Users)`**
  * **Metode**: `GET`
  * **URL**: `https://firestore.googleapis.com/v1/projects/{{projectId}}/databases/(default)/documents/users?key={{apiKey}}`
  * **Fungsi**: Digunakan pada panel **User Management** Admin untuk menampilkan seluruh akun terdaftar beserta perannya.

* **`3.2 Ambil 1 User Berdasarkan ID / Email (Get User by Doc ID)`**
  * **Metode**: `GET`
  * **URL**: `https://firestore.googleapis.com/v1/projects/{{projectId}}/databases/(default)/documents/users/henritantyoko_gmail_com?key={{apiKey}}`

* **`3.3 Buat / Update Pengguna Baru (Create/Upsert User)`**
  * **Metode**: `PATCH`
  * **URL**: `https://firestore.googleapis.com/v1/projects/{{projectId}}/databases/(default)/documents/users/budi_santoso_students_undip_ac_id?key={{apiKey}}`
  * **Body**:
    ```json
    {
      "fields": {
        "uid": { "stringValue": "usr_manual_01" },
        "nama": { "stringValue": "Budi Santoso" },
        "email": { "stringValue": "budi.santoso@students.undip.ac.id" },
        "password": { "stringValue": "budi123456" },
        "role": { "stringValue": "user" },
        "nim": { "stringValue": "24060121140020" },
        "status": { "stringValue": "Aktif" },
        "createdAt": { "stringValue": "2026-11-09T06:00:00.000Z" },
        "lastLogin": { "stringValue": "2026-11-09T06:00:00.000Z" }
      }
    }
    ```

* **`3.4 Ubah Role Pengguna (Promote/Demote Role via fieldMask)`**
  * **Metode**: `PATCH`
  * **URL**: `https://firestore.googleapis.com/v1/projects/{{projectId}}/databases/(default)/documents/users/budi_santoso_students_undip_ac_id?updateMask.fieldPaths=role&key={{apiKey}}`
  * **Body**:
    ```json
    {
      "fields": {
        "role": { "stringValue": "admin" }
      }
    }
    ```
  * **Fungsi**: Mengubah hak akses pengguna menjadi Admin tanpa menimpa data nama, email, atau password.

* **`3.5 Hapus Dokumen Pengguna (Delete User)`**
  * **Metode**: `DELETE`
  * **URL**: `https://firestore.googleapis.com/v1/projects/{{projectId}}/databases/(default)/documents/users/budi_santoso_students_undip_ac_id?key={{apiKey}}`

---

### 4. Folder: Cloud Firestore - Koleksi `mahasiswa` (Data Skripsi & Akademik)

* **`4.1 Ambil Seluruh Data Mahasiswa & Skripsi (Get All Mahasiswa)`**
  * **Metode**: `GET`
  * **URL**: `https://firestore.googleapis.com/v1/projects/{{projectId}}/databases/(default)/documents/mahasiswa?key={{apiKey}}`
  * **Fungsi**: Memuat seluruh data untuk tabel skripsi di Dashboard Admin.

* **`4.2 Ambil Data 1 Mahasiswa Berdasarkan Email (Get Student by Doc ID)`**
  * **Metode**: `GET`
  * **URL**: `https://firestore.googleapis.com/v1/projects/{{projectId}}/databases/(default)/documents/mahasiswa/dimas_prasetyo_students_undip_ac_id?key={{apiKey}}`
  * **Fungsi**: Memuat data personal untuk KTM digital & skripsi pada tampilan Mahasiswa.

* **`4.3 Tambah / Simpan Data Mahasiswa Baru (Create/Upsert Mahasiswa)`**
  * **Metode**: `PATCH`
  * **URL**: `https://firestore.googleapis.com/v1/projects/{{projectId}}/databases/(default)/documents/mahasiswa/budi_santoso_students_undip_ac_id?key={{apiKey}}`
  * **Body**:
    ```json
    {
      "fields": {
        "nim": { "stringValue": "24060121140020" },
        "nama": { "stringValue": "Budi Santoso" },
        "email": { "stringValue": "budi.santoso@students.undip.ac.id" },
        "fotoUrl": { "stringValue": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80" },
        "fakultas": { "stringValue": "Sains dan Matematika" },
        "jurusan": { "stringValue": "Informatika" },
        "angkatan": { "stringValue": "2021" },
        "semester": { "integerValue": "7" },
        "statusAkademik": { "stringValue": "Aktif" },
        "statusSkripsi": { "stringValue": "Bimbingan" },
        "ipk": { "doubleValue": 3.82 },
        "sksSelesai": { "integerValue": "138" },
        "dosenWali": { "stringValue": "Prof. Dr. Kusworo Adi, S.Si., M.T." },
        "judulSkripsi": { "stringValue": "Penerapan Transfer Learning ResNet-50 untuk Deteksi Dini Penyakit Tanaman Padi" },
        "pembimbingSkripsi": { "stringValue": "Dr. Aris Sugiharto, S.Si., M.Kom." },
        "updatedAt": { "stringValue": "2026-11-09T06:00:00.000Z" }
      }
    }
    ```

* **`4.4 Perbarui Judul Skripsi Saja (Partial Update / Edit Judul)`**
  * **Metode**: `PATCH`
  * **URL**: `https://firestore.googleapis.com/v1/projects/{{projectId}}/databases/(default)/documents/mahasiswa/dimas_prasetyo_students_undip_ac_id?updateMask.fieldPaths=judulSkripsi&updateMask.fieldPaths=updatedAt&key={{apiKey}}`
  * **Body**:
    ```json
    {
      "fields": {
        "judulSkripsi": { "stringValue": "Optimasi Hyperparameter Model YOLOv8 untuk Deteksi Rambu Lalu Lintas pada Smart Car" },
        "updatedAt": { "stringValue": "2026-11-09T06:30:00.000Z" }
      }
    }
    ```
  * **Fungsi**: Memperbarui judul skripsi mahasiswa secara terisolasi tanpa menimpa data nilai IPK, SKS, atau pembimbing.

* **`4.5 Hapus Data Mahasiswa (Delete Mahasiswa)`**
  * **Metode**: `DELETE`
  * **URL**: `https://firestore.googleapis.com/v1/projects/{{projectId}}/databases/(default)/documents/mahasiswa/budi_santoso_students_undip_ac_id?key={{apiKey}}`

---

## 🔒 Catatan Keamanan Header Authorization

Ketika menguji REST API Firestore melalui Postman:
* Gunakan parameter `?key={{apiKey}}`.
* **JANGAN** menyertakan header `Authorization: Bearer <token_palsu>` jika token bukan berasal langsung dari Google/Firebase JWT yang sah (`ey...`).
* Jika menyertakan token yang salah, Google Cloud akan mengembalikan error **HTTP 401 UNAUTHENTICATED** (*"Request had invalid authentication credentials"*).
