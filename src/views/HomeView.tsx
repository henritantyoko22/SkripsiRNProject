import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
  useColorScheme,
} from 'react-native';
import { Image } from 'expo-image';
import { useAuth } from '@/context/AuthContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import {
  MahasiswaData,
  fetchAllMahasiswa,
  saveMahasiswaData,
  deleteMahasiswaData,
} from '@/services/studentService';
import { UserAccount, fetchAllUsers, updateUserRole } from '@/services/userService';
import { MahasiswaHomeView } from '@/views/MahasiswaHomeView';

export function HomeView() {
  const { user, signOut, isLoading: isAuthLoading } = useAuth();
  const [adminViewMode, setAdminViewMode] = useState<'admin' | 'mahasiswa_preview'>('admin');
  const colorScheme = useColorScheme();
  const isDark = false; // Selalu gunakan Light Mode sesuai permintaan

  // Jika login sebagai role user biasa (Mahasiswa), tampilkan halaman profil & skripsi Mahasiswa
  if (user?.role === 'user') {
    return <MahasiswaHomeView />;
  }

  // Jika login sebagai Admin dan sedang preview tampilan mahasiswa
  if (adminViewMode === 'mahasiswa_preview') {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        <View style={styles.previewModeBanner}>
          <ThemedText type="code" style={styles.previewModeText}>
            Mode Preview Mahasiswa (Admin)
          </ThemedText>
          <Pressable
            onPress={() => setAdminViewMode('admin')}
            style={styles.previewModeBackBtn}>
            <ThemedText type="smallBold" style={{ color: '#FFFFFF', fontSize: 12 }}>
              ← Kembali ke Dashboard Admin
            </ThemedText>
          </Pressable>
        </View>
        <MahasiswaHomeView />
      </View>
    );
  }

  const [adminActiveTab, setAdminActiveTab] = useState<'skripsi' | 'users'>('skripsi');
  const [usersList, setUsersList] = useState<UserAccount[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);

  const [mahasiswaList, setMahasiswaList] = useState<MahasiswaData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('Semua');

  // Modal Detail state
  const [selectedMhs, setSelectedMhs] = useState<MahasiswaData | null>(null);

  // Modal Form (Tambah / Edit) state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [editingTargetName, setEditingTargetName] = useState<string>('');

  // Form input fields (selalu terisi data mahasiswa yang sedang diedit)
  const [formNim, setFormNim] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formJurusan, setFormJurusan] = useState('Informatika');
  const [formFakultas, setFormFakultas] = useState('Sains dan Matematika');
  const [formAngkatan, setFormAngkatan] = useState('2021');
  const [formSemester, setFormSemester] = useState('7');
  const [formIpk, setFormIpk] = useState('3.80');
  const [formSks, setFormSks] = useState('138');
  const [formJudul, setFormJudul] = useState('');
  const [formPembimbing, setFormPembimbing] = useState('Dr. Aris Sugiharto, S.Si., M.Kom.');
  const [formDosenWali, setFormDosenWali] = useState('Prof. Dr. Kusworo Adi, S.Si., M.T.');
  const [formStatusSkripsi, setFormStatusSkripsi] = useState<
    'Bimbingan' | 'Seminar Proposal' | 'Sidang Skripsi' | 'Lulus'
  >('Bimbingan');

  const loadData = useCallback(async () => {
    try {
      const data = await fetchAllMahasiswa();
      setMahasiswaList(data);
    } catch (err) {
      console.warn('Gagal memuat list mahasiswa:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const data = await fetchAllUsers();
      setUsersList(data);
    } catch (err) {
      console.warn('Gagal memuat user management:', err);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [mhs, users] = await Promise.all([fetchAllMahasiswa(), fetchAllUsers()]);
        if (isMounted) {
          setMahasiswaList(mhs);
          setUsersList(users);
        }
      } catch (err) {
        console.warn('Gagal memuat data awal:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
          setLoadingUsers(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    if (adminActiveTab === 'users') {
      loadUsers().finally(() => setRefreshing(false));
    } else {
      loadData().finally(() => setRefreshing(false));
    }
  };

  const handleToggleUserRole = (targetUser: UserAccount) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    const roleLabel = newRole === 'admin' ? 'Administrator (Bisa melihat seluruh database mahasiswa)' : 'Mahasiswa (Hanya melihat data profil pribadi)';

    Alert.alert(
      'Ubah Hak Akses / Role',
      `Ubah role "${targetUser.nama}" (${targetUser.email}) menjadi:\n\n👉 ${roleLabel}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Ubah Role',
          onPress: async () => {
            try {
              const success = await updateUserRole(targetUser.email, newRole);
              if (success) {
                Alert.alert(
                  'Sukses',
                  `Hak akses ${targetUser.email} berhasil diubah menjadi ${newRole.toUpperCase()} di koleksi Firestore 'users'.`
                );
                loadUsers();
              } else {
                Alert.alert('Error', 'Gagal memperbarui role di Firestore.');
              }
            } catch {
              Alert.alert('Error', 'Terjadi kesalahan jaringan.');
            }
          },
        },
      ]
    );
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingTargetName('');
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    setFormNim(`240601211${randomSuffix}`);
    setFormNama('');
    setFormEmail('');
    setFormJurusan('Informatika');
    setFormFakultas('Sains dan Matematika');
    setFormAngkatan('2021');
    setFormSemester('7');
    setFormIpk('3.80');
    setFormSks('138');
    setFormJudul('');
    setFormPembimbing('Dr. Aris Sugiharto, S.Si., M.Kom.');
    setFormDosenWali('Prof. Dr. Kusworo Adi, S.Si., M.T.');
    setFormStatusSkripsi('Bimbingan');
    setIsFormOpen(true);
  };

  // Saat tombol EDIT diklik: AMBIL LANGSUNG DATA MAHASISWA DAN ISI KE INPUT
  const handleOpenEdit = (mhs: MahasiswaData) => {
    setIsEditing(true);
    setEditingTargetName(mhs.nama);
    setFormNim(String(mhs.nim || ''));
    setFormNama(String(mhs.nama || ''));
    setFormEmail(String(mhs.email || ''));
    setFormJurusan(String(mhs.jurusan || 'Informatika'));
    setFormFakultas(String(mhs.fakultas || 'Sains dan Matematika'));
    setFormAngkatan(String(mhs.angkatan || '2021'));
    setFormSemester(String(mhs.semester ?? 7));
    setFormIpk(String(mhs.ipk ?? 3.8));
    setFormSks(String(mhs.sksSelesai ?? 138));
    setFormJudul(String(mhs.judulSkripsi || ''));
    setFormPembimbing(String(mhs.pembimbingSkripsi || ''));
    setFormDosenWali(String(mhs.dosenWali || ''));
    setFormStatusSkripsi(mhs.statusSkripsi || 'Bimbingan');
    setIsFormOpen(true);
  };

  const handleSaveForm = async () => {
    if (!formNama.trim() || !formNim.trim() || !formJudul.trim()) {
      Alert.alert('Perhatian', 'Harap lengkapi NIM, Nama Mahasiswa, dan Judul Skripsi.');
      return;
    }

    const email = formEmail.trim() || `${formNim.toLowerCase()}@students.undip.ac.id`;

    const payload: MahasiswaData = {
      nim: formNim.trim(),
      nama: formNama.trim(),
      email: email,
      fotoUrl: `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 1000)}?auto=format&fit=crop&w=200&q=80`,
      fakultas: formFakultas.trim(),
      jurusan: formJurusan.trim(),
      angkatan: formAngkatan.trim(),
      semester: Number(formSemester) || 7,
      statusAkademik: 'Aktif',
      statusSkripsi: formStatusSkripsi,
      ipk: parseFloat(formIpk) || 3.8,
      sksSelesai: Number(formSks) || 138,
      dosenWali: formDosenWali.trim(),
      judulSkripsi: formJudul.trim(),
      pembimbingSkripsi: formPembimbing.trim(),
      updatedAt: new Date().toISOString(),
    };

    setSaving(true);
    try {
      await saveMahasiswaData(payload);
      await loadData();
      setIsFormOpen(false);
      Alert.alert('Sukses', `Data mahasiswa "${payload.nama}" berhasil disimpan ke Firestore.`);
    } catch (err) {
      Alert.alert('Error', 'Gagal menyimpan ke database Firestore.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (mhs: MahasiswaData) => {
    Alert.alert(
      'Hapus Mahasiswa',
      `Yakin ingin menghapus data skripsi "${mhs.nama}" (${mhs.nim}) dari Firestore?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            await deleteMahasiswaData(mhs.email);
            await loadData();
            if (selectedMhs?.email === mhs.email) {
              setSelectedMhs(null);
            }
          },
        },
      ]
    );
  };



  const handleSignOut = () => {
    Alert.alert(
      'Konfirmasi Keluar',
      'Keluar dari sesi Administrator Skripsi?',
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

  // Filter list
  const filteredList = mahasiswaList.filter((mhs) => {
    const matchesSearch =
      mhs.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mhs.nim.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mhs.judulSkripsi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mhs.pembimbingSkripsi.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatusFilter === 'Semua' || mhs.statusSkripsi === selectedStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Statistik ringkasan
  const totalMahasiswa = mahasiswaList.length;
  const countBimbingan = mahasiswaList.filter((m) => m.statusSkripsi === 'Bimbingan').length;
  const countSempro = mahasiswaList.filter((m) => m.statusSkripsi === 'Seminar Proposal').length;
  const countSidang = mahasiswaList.filter((m) => m.statusSkripsi === 'Sidang Skripsi').length;

  const getStatusBadgeStyle = (status?: string) => {
    switch (status) {
      case 'Seminar Proposal':
        return { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' };
      case 'Sidang Skripsi':
        return { bg: '#EDE9FE', text: '#5B21B6', border: '#DDD6FE' };
      case 'Lulus':
        return { bg: '#D1FAE5', text: '#065F46', border: '#A7F3D0' };
      default:
        return { bg: '#DBEAFE', text: '#1E40AF', border: '#BFDBFE' };
    }
  };

  // Style input teks adaptif tema terang / gelap agar selalu terlihat jelas
  const inputStyle = [
    styles.textInput,
    {
      color: isDark ? '#FFFFFF' : '#111827',
      backgroundColor: isDark ? '#27272A' : '#F9FAFB',
      borderColor: isDark ? '#3F3F46' : '#D1D5DB',
    },
  ];

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }>
      <View style={styles.container}>
        {/* Admin Header Bar */}
        <ThemedView type="backgroundElement" style={styles.adminHeaderCard}>
          <View style={styles.adminProfileRow}>
            {user?.photoUrl ? (
              <Image
                source={{ uri: user.photoUrl }}
                style={styles.adminAvatar}
                contentFit="cover"
              />
            ) : (
              <View style={styles.adminAvatarFallback}>
                <ThemedText type="smallBold" style={{ color: '#fff' }}>
                  ADM
                </ThemedText>
              </View>
            )}
            <View style={styles.adminInfo}>
              <View style={styles.adminBadge}>
                <ThemedText type="code" style={styles.adminBadgeText}>
                  ADMINISTRATOR SKRIPSI
                </ThemedText>
              </View>
              <ThemedText type="smallBold" style={styles.adminName}>
                {user?.name || 'Administrator Skripsi'}
              </ThemedText>
              <ThemedText type="code" themeColor="textSecondary" style={styles.adminEmail}>
                {user?.email || 'admin@undip.ac.id'}
              </ThemedText>
            </View>

            <View style={styles.adminActionGroup}>
              <Pressable
                onPress={() => setAdminViewMode('mahasiswa_preview')}
                style={styles.adminPreviewBtn}>
                <ThemedText type="code" style={styles.adminPreviewText}>
                  View Mahasiswa
                </ThemedText>
              </Pressable>

              <Pressable
                onPress={handleSignOut}
                disabled={isAuthLoading}
                style={styles.adminSignOutBtn}>
                <ThemedText type="code" style={styles.adminSignOutText}>
                  Keluar
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </ThemedView>

        {/* Tab Switcher Admin: Skripsi vs User Management */}
        <View style={styles.adminTabSelector}>
          <Pressable
            onPress={() => setAdminActiveTab('skripsi')}
            style={[
              styles.adminTabBtn,
              adminActiveTab === 'skripsi' && styles.adminTabBtnActive,
            ]}>
            <ThemedText
              type="smallBold"
              style={[
                styles.adminTabText,
                adminActiveTab === 'skripsi' && styles.adminTabTextActive,
              ]}>
              📋 Data Skripsi ({mahasiswaList.length})
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={() => {
              setAdminActiveTab('users');
              loadUsers();
            }}
            style={[
              styles.adminTabBtn,
              adminActiveTab === 'users' && styles.adminTabBtnActive,
            ]}>
            <ThemedText
              type="smallBold"
              style={[
                styles.adminTabText,
                adminActiveTab === 'users' && styles.adminTabTextActive,
              ]}>
              👥 User Management ({usersList.length})
            </ThemedText>
          </Pressable>
        </View>

        {adminActiveTab === 'users' ? (
          <View style={styles.userMgmtContainer}>
            <View style={styles.headerSection}>
              <View style={styles.titleInfo}>
                <ThemedText type="subtitle" style={styles.pageTitle}>
                  Hak Akses &amp; User Management
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Koleksi Firestore &apos;users&apos; • Atur siapa yang bisa melihat semua data mahasiswa (Admin) atau hanya profil pribadi (Mahasiswa)
                </ThemedText>
              </View>

              <Pressable
                onPress={() => loadUsers()}
                style={styles.refreshUsersBtn}>
                <ThemedText type="smallBold" style={{ color: '#3c87f7' }}>
                  🔄 Muat Ulang
                </ThemedText>
              </Pressable>
            </View>

            {/* Metric User Management */}
            <View style={styles.metricsRow}>
              <ThemedView type="backgroundElement" style={styles.metricCard}>
                <ThemedText type="code" themeColor="textSecondary">TOTAL USER</ThemedText>
                <ThemedText type="subtitle" style={styles.metricNum}>{usersList.length}</ThemedText>
                <ThemedText type="code" style={styles.metricSub}>Terdaftar</ThemedText>
              </ThemedView>

              <ThemedView type="backgroundElement" style={styles.metricCard}>
                <ThemedText type="code" style={{ color: '#4338CA' }}>ADMIN</ThemedText>
                <ThemedText type="subtitle" style={[styles.metricNum, { color: '#4338CA' }]}>
                  {usersList.filter((u) => u.role === 'admin').length}
                </ThemedText>
                <ThemedText type="code" style={styles.metricSub}>Akses Penuh</ThemedText>
              </ThemedView>

              <ThemedView type="backgroundElement" style={styles.metricCard}>
                <ThemedText type="code" style={{ color: '#0284C7' }}>MAHASISWA</ThemedText>
                <ThemedText type="subtitle" style={[styles.metricNum, { color: '#0284C7' }]}>
                  {usersList.filter((u) => u.role === 'user').length}
                </ThemedText>
                <ThemedText type="code" style={styles.metricSub}>Akses Personal</ThemedText>
              </ThemedView>
            </View>

            {/* Info Box */}
            <View style={styles.userMgmtInfoBox}>
              <ThemedText type="smallBold" style={{ color: '#1E40AF', marginBottom: 2 }}>
                ℹ️ Penjelasan Hak Akses Pengguna:
              </ThemedText>
              <ThemedText type="code" style={{ color: '#1E3A8A', lineHeight: 18 }}>
                • <ThemedText type="code" style={{ fontWeight: '700' }}>ADMIN</ThemedText>: Memiliki izin penuh melihat tabel seluruh mahasiswa, rekapitulasi dosen, menambah, mengedit, dan menghapus skripsi.{'\n'}
                • <ThemedText type="code" style={{ fontWeight: '700' }}>MAHASISWA</ThemedText>: Hanya melihat KTM digital &amp; data skripsi pribadinya di koleksi &apos;mahasiswa&apos;.
              </ThemedText>
            </View>

            {/* User List */}
            {loadingUsers ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color="#3c87f7" />
                <ThemedText type="small" style={{ marginTop: 8 }}>Memuat akun dari koleksi &apos;users&apos;...</ThemedText>
              </View>
            ) : usersList.length === 0 ? (
              <View style={styles.emptyCard}>
                <ThemedText type="subtitle" style={styles.emptyTitle}>Belum Ada Pengguna di Koleksi &apos;users&apos;</ThemedText>
                <ThemedText type="small" style={styles.emptySubtitle}>
                  Setiap akun yang mendaftar atau login otomatis tersimpan di koleksi &apos;users&apos; Firestore.
                </ThemedText>
                <Pressable onPress={() => loadUsers()} style={styles.retryBtn}>
                  <ThemedText type="smallBold" style={{ color: '#FFFFFF' }}>Muat Ulang Data</ThemedText>
                </Pressable>
              </View>
            ) : (
              <View style={styles.userListContainer}>
                {usersList.map((usr, idx) => (
                  <View key={usr.email || idx} style={styles.userCard}>
                    <View style={styles.userCardHeader}>
                      <View
                        style={[
                          styles.userAvatarBox,
                          usr.role === 'admin' ? styles.userAvatarBoxAdmin : styles.userAvatarBoxStudent,
                        ]}>
                        <ThemedText type="smallBold" style={{ color: '#FFFFFF', fontSize: 16 }}>
                          {usr.nama ? usr.nama.charAt(0).toUpperCase() : 'U'}
                        </ThemedText>
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.userNameRow}>
                          <ThemedText type="smallBold" style={styles.userNameText}>
                            {usr.nama || 'Pengguna'}
                          </ThemedText>
                          <View
                            style={[
                              styles.userRoleBadge,
                              usr.role === 'admin' ? styles.userRoleBadgeAdmin : styles.userRoleBadgeStudent,
                            ]}>
                            <ThemedText
                              type="code"
                              style={[
                                styles.userRoleBadgeText,
                                usr.role === 'admin' ? styles.userRoleBadgeTextAdmin : styles.userRoleBadgeTextStudent,
                              ]}>
                              {usr.role === 'admin' ? '🛡️ ADMIN' : '🎓 MAHASISWA'}
                            </ThemedText>
                          </View>
                        </View>
                        <ThemedText type="code" style={styles.userEmailText}>
                          {usr.email}
                        </ThemedText>
                        <ThemedText type="code" style={styles.userAccessDesc}>
                          {usr.role === 'admin'
                            ? 'Dapat melihat seluruh database mahasiswa & skripsi'
                            : 'Hanya dapat melihat profil & skripsi pribadinya'}
                        </ThemedText>
                      </View>
                    </View>

                    <View style={styles.userCardFooter}>
                      <View style={styles.userStatusPill}>
                        <View style={styles.userStatusDot} />
                        <ThemedText type="code" style={styles.userStatusText}>
                          Status: {usr.status || 'Aktif'}
                        </ThemedText>
                      </View>

                      <Pressable
                        onPress={() => handleToggleUserRole(usr)}
                        style={({ pressed }) => [
                          styles.userRoleChangeBtn,
                          usr.role === 'admin' ? styles.demoteBtn : styles.promoteBtn,
                          pressed && { opacity: 0.8 },
                        ]}>
                        <ThemedText
                          type="code"
                          style={[
                            styles.userRoleChangeText,
                            usr.role === 'admin' ? styles.demoteText : styles.promoteText,
                          ]}>
                          {usr.role === 'admin' ? 'Ubah ke Mahasiswa' : 'Jadikan Admin'}
                        </ThemedText>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          <>
            {/* Section Judul & Tombol Tambah Mahasiswa (Full Width - Tidak Terpotong) */}
            <View style={styles.headerSection}>
              <View style={styles.titleInfo}>
                <ThemedText type="subtitle" style={styles.pageTitle}>
                  Daftar Mahasiswa &amp; Skripsi
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Database Cloud Firestore • Universitas Diponegoro ({mahasiswaList.length} Mahasiswa)
                </ThemedText>
              </View>

              {/* Action Row: Tombol Tambah Mahasiswa */}
              <View style={styles.actionButtonsContainer}>
                <Pressable
                  onPress={handleOpenAdd}
                  style={({ pressed }) => [
                    styles.fullAddButton,
                    pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] },
                  ]}>
                  <ThemedText type="smallBold" style={styles.fullAddButtonText}>
                    + Tambah Mahasiswa Baru
                  </ThemedText>
                </Pressable>
              </View>
            </View>

        {/* Metric Cards Row */}
        <View style={styles.metricsRow}>
          <ThemedView type="backgroundElement" style={styles.metricCard}>
            <ThemedText type="code" themeColor="textSecondary">
              TOTAL
            </ThemedText>
            <ThemedText type="subtitle" style={styles.metricNum}>
              {totalMahasiswa}
            </ThemedText>
            <ThemedText type="code" style={styles.metricSub}>
              Mahasiswa
            </ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.metricCard}>
            <ThemedText type="code" style={{ color: '#1E40AF' }}>
              BIMBINGAN
            </ThemedText>
            <ThemedText type="subtitle" style={[styles.metricNum, { color: '#1E40AF' }]}>
              {countBimbingan}
            </ThemedText>
            <ThemedText type="code" style={styles.metricSub}>
              Aktif
            </ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.metricCard}>
            <ThemedText type="code" style={{ color: '#92400E' }}>
              SEMPRO
            </ThemedText>
            <ThemedText type="subtitle" style={[styles.metricNum, { color: '#92400E' }]}>
              {countSempro}
            </ThemedText>
            <ThemedText type="code" style={styles.metricSub}>
              Proposal
            </ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.metricCard}>
            <ThemedText type="code" style={{ color: '#5B21B6' }}>
              SIDANG
            </ThemedText>
            <ThemedText type="subtitle" style={[styles.metricNum, { color: '#5B21B6' }]}>
              {countSidang}
            </ThemedText>
            <ThemedText type="code" style={styles.metricSub}>
              Ujian Akhir
            </ThemedText>
          </ThemedView>
        </View>

        {/* Search & Filter Bar */}
        <ThemedView type="backgroundElement" style={styles.filterSection}>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="🔍 Cari Nama Mahasiswa, NIM, Judul Skripsi, atau Dosen..."
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            style={[
              styles.searchInput,
              {
                color: isDark ? '#FFFFFF' : '#111827',
                backgroundColor: isDark ? '#27272A' : '#FFFFFF',
                borderColor: isDark ? '#3F3F46' : '#D1D5DB',
              },
            ]}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChipsRow}>
            {['Semua', 'Bimbingan', 'Seminar Proposal', 'Sidang Skripsi', 'Lulus'].map((filter) => {
              const active = selectedStatusFilter === filter;
              return (
                <Pressable
                  key={filter}
                  onPress={() => setSelectedStatusFilter(filter)}
                  style={[styles.filterChip, active && styles.filterChipActive]}>
                  <ThemedText
                    type="code"
                    style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                    {filter}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>
        </ThemedView>

        {/* Tabel / List Mahasiswa Skripsi */}
        {loading ? (
          <View style={styles.tableLoading}>
            <ActivityIndicator size="large" color="#3c87f7" />
            <ThemedText type="small" themeColor="textSecondary">
              Memuat data tabel mahasiswa dari Cloud Firestore...
            </ThemedText>
          </View>
        ) : filteredList.length === 0 ? (
          <ThemedView type="backgroundElement" style={styles.emptyCard}>
            <ThemedText type="subtitle">📋</ThemedText>
            <ThemedText type="smallBold">Tidak ada data mahasiswa yang cocok</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Coba ganti kata kunci pencarian atau ubah filter status.
            </ThemedText>
          </ThemedView>
        ) : (
          <View style={styles.tableListWrapper}>
            {filteredList.map((mhs, index) => {
              const badge = getStatusBadgeStyle(mhs.statusSkripsi);
              return (
                <ThemedView key={mhs.nim + index} type="backgroundElement" style={styles.mhsRowCard}>
                  {/* Top Row: Mahasiswa Identity & Status */}
                  <View style={styles.rowHeader}>
                    <View style={styles.mhsIdentity}>
                      <View style={styles.avatarThumbnailWrapper}>
                        {mhs.fotoUrl ? (
                          <Image
                            source={{ uri: mhs.fotoUrl }}
                            style={styles.avatarThumbnail}
                            contentFit="cover"
                          />
                        ) : (
                          <View style={styles.avatarThumbnailFallback}>
                            <ThemedText type="code" style={{ color: '#fff', fontSize: 12 }}>
                              {mhs.nama.charAt(0)}
                            </ThemedText>
                          </View>
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <ThemedText type="smallBold" style={styles.mhsName} numberOfLines={1}>
                          {mhs.nama}
                        </ThemedText>
                        <ThemedText type="code" style={styles.mhsNim}>
                          NIM: {mhs.nim} • {mhs.jurusan}
                        </ThemedText>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: badge.bg, borderColor: badge.border },
                      ]}>
                      <ThemedText type="code" style={[styles.statusBadgeText, { color: badge.text }]}>
                        {mhs.statusSkripsi || 'Bimbingan'}
                      </ThemedText>
                    </View>
                  </View>

                  {/* Middle Row: Judul Skripsi */}
                  <View style={styles.thesisBox}>
                    <ThemedText type="code" themeColor="textSecondary" style={styles.thesisLabel}>
                      JUDUL SKRIPSI:
                    </ThemedText>
                    <ThemedText type="smallBold" style={styles.thesisTitle}>
                      &ldquo;{mhs.judulSkripsi}&rdquo;
                    </ThemedText>
                  </View>

                  {/* Bottom Row: Dosen Pembimbing & Actions */}
                  <View style={styles.rowFooter}>
                    <View style={styles.pembimbingInfo}>
                      <ThemedText type="code" themeColor="textSecondary">
                        Pembimbing:
                      </ThemedText>
                      <ThemedText type="small" style={styles.pembimbingName} numberOfLines={1}>
                        {mhs.pembimbingSkripsi}
                      </ThemedText>
                    </View>

                    <View style={styles.actionButtonsRow}>
                      <Pressable
                        onPress={() => setSelectedMhs(mhs)}
                        style={styles.detailBtn}>
                        <ThemedText type="code" style={styles.detailBtnText}>
                          Detail
                        </ThemedText>
                      </Pressable>

                      <Pressable
                        onPress={() => handleOpenEdit(mhs)}
                        style={styles.editBtn}>
                        <ThemedText type="code" style={styles.editBtnText}>
                          Edit
                        </ThemedText>
                      </Pressable>

                      <Pressable
                        onPress={() => handleDelete(mhs)}
                        style={styles.deleteBtn}>
                        <ThemedText type="code" style={styles.deleteBtnText}>
                          ✕
                        </ThemedText>
                      </Pressable>
                    </View>
                  </View>
                </ThemedView>
              );
            })}
          </View>
        )}
          </>
        )}
      </View>

      {/* MODAL 1: Detail Lengkap Mahasiswa */}
      <Modal
        visible={!!selectedMhs}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedMhs(null)}>
        <View style={styles.modalOverlay}>
          <ThemedView type="background" style={styles.modalContent}>
            {selectedMhs && (
              <>
                <View style={styles.modalHeaderRow}>
                  <ThemedText type="subtitle" style={styles.modalTitle}>
                    Detail Skripsi Mahasiswa
                  </ThemedText>
                  <Pressable onPress={() => setSelectedMhs(null)} style={styles.closeModalBtn}>
                    <ThemedText type="smallBold">✕</ThemedText>
                  </Pressable>
                </View>

                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  {/* Profil Singkat */}
                  <View style={styles.detailProfileBox}>
                    <View style={styles.detailPhotoWrapper}>
                      {selectedMhs.fotoUrl ? (
                        <Image
                          source={{ uri: selectedMhs.fotoUrl }}
                          style={styles.detailPhoto}
                          contentFit="cover"
                        />
                      ) : (
                        <View style={styles.detailPhotoFallback}>
                          <ThemedText type="subtitle" style={{ color: '#fff' }}>
                            {selectedMhs.nama.charAt(0)}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThemedText type="smallBold" style={{ fontSize: 17 }}>
                        {selectedMhs.nama}
                      </ThemedText>
                      <ThemedText type="code" style={{ color: '#3c87f7' }}>
                        NIM: {selectedMhs.nim}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {selectedMhs.jurusan} • Fak. {selectedMhs.fakultas}
                      </ThemedText>
                    </View>
                  </View>

                  {/* Judul Skripsi Lengkap */}
                  <View style={styles.detailSection}>
                    <ThemedText type="code" themeColor="textSecondary">
                      JUDUL TUGAS AKHIR / SKRIPSI
                    </ThemedText>
                    <ThemedText type="default" style={styles.detailJudul}>
                      &ldquo;{selectedMhs.judulSkripsi}&rdquo;
                    </ThemedText>
                  </View>

                  {/* Detail Grid */}
                  <View style={styles.detailGrid}>
                    <View style={styles.detailGridItem}>
                      <ThemedText type="code" themeColor="textSecondary">
                        Status Bimbingan
                      </ThemedText>
                      <ThemedText type="smallBold">
                        {selectedMhs.statusSkripsi || 'Bimbingan'}
                      </ThemedText>
                    </View>

                    <View style={styles.detailGridItem}>
                      <ThemedText type="code" themeColor="textSecondary">
                        Dosen Pembimbing
                      </ThemedText>
                      <ThemedText type="smallBold">
                        {selectedMhs.pembimbingSkripsi}
                      </ThemedText>
                    </View>

                    <View style={styles.detailGridItem}>
                      <ThemedText type="code" themeColor="textSecondary">
                        Dosen Wali
                      </ThemedText>
                      <ThemedText type="smallBold">{selectedMhs.dosenWali}</ThemedText>
                    </View>

                    <View style={styles.detailGridItem}>
                      <ThemedText type="code" themeColor="textSecondary">
                        IPK / SKS
                      </ThemedText>
                      <ThemedText type="smallBold">
                        IPK {selectedMhs.ipk.toFixed(2)} • {selectedMhs.sksSelesai} SKS
                      </ThemedText>
                    </View>

                    <View style={styles.detailGridItem}>
                      <ThemedText type="code" themeColor="textSecondary">
                        Email Mahasiswa
                      </ThemedText>
                      <ThemedText type="code">{selectedMhs.email}</ThemedText>
                    </View>

                    <View style={styles.detailGridItem}>
                      <ThemedText type="code" themeColor="textSecondary">
                        Semester / Angkatan
                      </ThemedText>
                      <ThemedText type="smallBold">
                        Semester {selectedMhs.semester} ({selectedMhs.angkatan})
                      </ThemedText>
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.modalFooterRow}>
                  <Pressable
                    onPress={() => {
                      const m = selectedMhs;
                      setSelectedMhs(null);
                      handleOpenEdit(m);
                    }}
                    style={styles.modalEditFullBtn}>
                    <ThemedText type="smallBold" style={{ color: '#fff' }}>
                      ✏️ Edit Skripsi Mahasiswa Ini
                    </ThemedText>
                  </Pressable>
                </View>
              </>
            )}
          </ThemedView>
        </View>
      </Modal>

      {/* MODAL 2: Form Tambah / Edit Mahasiswa (DATA PRE-FILLED & TIDAK KOSONG) */}
      <Modal
        visible={isFormOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFormOpen(false)}>
        <View style={styles.modalOverlay}>
          <ThemedView type="background" style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <View>
                <ThemedText type="subtitle" style={styles.modalTitle}>
                  {isEditing ? 'Edit Data Skripsi' : 'Tambah Mahasiswa Baru'}
                </ThemedText>
                {isEditing && (
                  <ThemedText type="code" style={styles.editingBannerText}>
                    Mengedit data: {editingTargetName} (NIM: {formNim})
                  </ThemedText>
                )}
              </View>
              <Pressable onPress={() => setIsFormOpen(false)} style={styles.closeModalBtn}>
                <ThemedText type="smallBold">✕</ThemedText>
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <ThemedText type="smallBold">NIM Mahasiswa</ThemedText>
                <TextInput
                  value={formNim}
                  onChangeText={setFormNim}
                  placeholder="24060121130089"
                  placeholderTextColor={isDark ? '#71717A' : '#9CA3AF'}
                  style={inputStyle}
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText type="smallBold">Nama Lengkap Mahasiswa</ThemedText>
                <TextInput
                  value={formNama}
                  onChangeText={setFormNama}
                  placeholder="Nama Lengkap Mahasiswa"
                  placeholderTextColor={isDark ? '#71717A' : '#9CA3AF'}
                  style={inputStyle}
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText type="smallBold">Judul Skripsi / Tugas Akhir</ThemedText>
                <TextInput
                  value={formJudul}
                  onChangeText={setFormJudul}
                  multiline
                  numberOfLines={3}
                  placeholder="Tuliskan judul penelitian skripsi..."
                  placeholderTextColor={isDark ? '#71717A' : '#9CA3AF'}
                  style={[inputStyle, styles.textArea]}
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText type="smallBold">Dosen Pembimbing Skripsi</ThemedText>
                <TextInput
                  value={formPembimbing}
                  onChangeText={setFormPembimbing}
                  placeholder="Nama & Gelar Dosen Pembimbing"
                  placeholderTextColor={isDark ? '#71717A' : '#9CA3AF'}
                  style={inputStyle}
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText type="smallBold">Tahap / Status Bimbingan Skripsi</ThemedText>
                <View style={styles.statusChipsGrid}>
                  {(['Bimbingan', 'Seminar Proposal', 'Sidang Skripsi', 'Lulus'] as const).map(
                    (st) => {
                      const selected = formStatusSkripsi === st;
                      return (
                        <Pressable
                          key={st}
                          onPress={() => setFormStatusSkripsi(st)}
                          style={[
                            styles.statusSelectChip,
                            selected && styles.statusSelectChipActive,
                          ]}>
                          <ThemedText
                            type="code"
                            style={[
                              styles.statusSelectText,
                              selected && styles.statusSelectTextActive,
                            ]}>
                            {st}
                          </ThemedText>
                        </Pressable>
                      );
                    }
                  )}
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <ThemedText type="smallBold">Program Studi</ThemedText>
                  <TextInput
                    value={formJurusan}
                    onChangeText={setFormJurusan}
                    style={inputStyle}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <ThemedText type="smallBold">Angkatan</ThemedText>
                  <TextInput
                    value={formAngkatan}
                    onChangeText={setFormAngkatan}
                    style={inputStyle}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <ThemedText type="smallBold">IPK</ThemedText>
                  <TextInput
                    value={formIpk}
                    onChangeText={setFormIpk}
                    keyboardType="decimal-pad"
                    style={inputStyle}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <ThemedText type="smallBold">SKS Selesai</ThemedText>
                  <TextInput
                    value={formSks}
                    onChangeText={setFormSks}
                    keyboardType="numeric"
                    style={inputStyle}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <ThemedText type="smallBold">Dosen Wali Akademik</ThemedText>
                <TextInput
                  value={formDosenWali}
                  onChangeText={setFormDosenWali}
                  style={inputStyle}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooterRow}>
              <Pressable
                onPress={() => setIsFormOpen(false)}
                disabled={saving}
                style={styles.modalCancelBtn}>
                <ThemedText type="smallBold">Batal</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleSaveForm}
                disabled={saving}
                style={styles.modalSaveBtn}>
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <ThemedText type="smallBold" style={{ color: '#fff' }}>
                    {isEditing ? 'Simpan Perubahan ke Firestore' : 'Tambahkan ke Firestore'}
                  </ThemedText>
                )}
              </Pressable>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
  },
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: Spacing.three,
  },
  adminHeaderCard: {
    padding: Spacing.three,
    borderRadius: 18,
  },
  adminProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  adminAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  adminAvatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3c87f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminInfo: {
    flex: 1,
    gap: 2,
  },
  adminBadge: {
    backgroundColor: '#3c87f722',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  adminBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#3c87f7',
  },
  adminName: {
    fontSize: 15,
  },
  adminEmail: {
    fontSize: 11,
  },
  adminSignOutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F98080',
    backgroundColor: '#FDE8E822',
  },
  adminSignOutText: {
    color: '#E02424',
    fontSize: 11,
    fontWeight: '700',
  },
  headerSection: {
    gap: Spacing.two,
    marginTop: 4,
  },
  titleInfo: {
    gap: 2,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  fullAddButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#3c87f7',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3c87f7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  fullAddButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  syncButton: {
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3c87f750',
    backgroundColor: '#3c87f715',
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncButtonText: {
    color: '#3c87f7',
    fontSize: 11,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  metricCard: {
    flex: 1,
    padding: Spacing.two,
    borderRadius: 14,
    alignItems: 'center',
    gap: 1,
  },
  metricNum: {
    fontSize: 20,
    fontWeight: '800',
  },
  metricSub: {
    fontSize: 9,
  },
  filterSection: {
    padding: Spacing.three,
    borderRadius: 16,
    gap: Spacing.two,
  },
  searchInput: {
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#8E918F33',
    backgroundColor: '#8E918F10',
    marginRight: 6,
  },
  filterChipActive: {
    backgroundColor: '#3c87f7',
    borderColor: '#3c87f7',
  },
  filterChipText: {
    fontSize: 11,
    color: '#60646C',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tableLoading: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },
  emptyCard: {
    padding: Spacing.five,
    borderRadius: 16,
    alignItems: 'center',
    gap: 6,
  },
  tableListWrapper: {
    gap: Spacing.two,
  },
  mhsRowCard: {
    padding: Spacing.three,
    borderRadius: 16,
    gap: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#8E918F25',
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  mhsIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatarThumbnailWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  avatarThumbnail: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  avatarThumbnailFallback: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mhsName: {
    fontSize: 14,
  },
  mhsNim: {
    fontSize: 11,
    color: '#8E918F',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  thesisBox: {
    backgroundColor: '#8E918F10',
    padding: 10,
    borderRadius: 10,
    gap: 2,
  },
  thesisLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  thesisTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  rowFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  pembimbingInfo: {
    flex: 1,
    gap: 1,
  },
  pembimbingName: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#3c87f715',
  },
  detailBtnText: {
    fontSize: 11,
    color: '#3c87f7',
    fontWeight: '700',
  },
  editBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#8E918F20',
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  deleteBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#FDE8E8',
  },
  deleteBtnText: {
    fontSize: 11,
    color: '#9B1C1C',
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000080',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.four,
    maxHeight: '90%',
    gap: Spacing.two,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  editingBannerText: {
    fontSize: 11,
    color: '#3c87f7',
    marginTop: 2,
  },
  closeModalBtn: {
    padding: 6,
  },
  modalBody: {
    marginVertical: Spacing.two,
  },
  detailProfileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: '#8E918F25',
    marginBottom: Spacing.three,
  },
  detailPhotoWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  detailPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  detailPhotoFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3c87f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailSection: {
    gap: 4,
    marginBottom: Spacing.three,
  },
  detailJudul: {
    fontSize: 15,
    fontWeight: '600',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  detailGrid: {
    gap: Spacing.two,
  },
  detailGridItem: {
    gap: 2,
    backgroundColor: '#8E918F10',
    padding: 10,
    borderRadius: 10,
  },
  modalFooterRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
  modalEditFullBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3c87f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formGroup: {
    marginBottom: Spacing.three,
    gap: 6,
  },
  formRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  statusChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusSelectChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#8E918F40',
    backgroundColor: '#8E918F10',
  },
  statusSelectChipActive: {
    backgroundColor: '#3c87f7',
    borderColor: '#3c87f7',
  },
  statusSelectText: {
    fontSize: 11,
    color: '#60646C',
  },
  statusSelectTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#8E918F40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSaveBtn: {
    flex: 2,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3c87f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminActionGroup: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 6,
  },
  adminPreviewBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#E0E7FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  adminPreviewText: {
    fontSize: 11,
    color: '#3730A3',
    fontWeight: '600',
  },
  previewModeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  previewModeText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  previewModeBackBtn: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  adminTabSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    backgroundColor: '#F1F5F9',
    padding: 4,
    borderRadius: 12,
  },
  adminTabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminTabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  adminTabText: {
    fontSize: 13,
    color: '#64748B',
  },
  adminTabTextActive: {
    color: '#1E293B',
    fontWeight: '700',
  },
  userMgmtContainer: {
    gap: 14,
  },
  loadingBox: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: '#3c87f7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshUsersBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignSelf: 'flex-start',
  },
  userMgmtInfoBox: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 12,
  },
  userListContainer: {
    gap: 12,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    gap: 12,
  },
  userCardHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  userAvatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarBoxAdmin: {
    backgroundColor: '#4338CA',
  },
  userAvatarBoxStudent: {
    backgroundColor: '#0284C7',
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  userNameText: {
    fontSize: 15,
    color: '#0F172A',
  },
  userRoleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  userRoleBadgeAdmin: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  userRoleBadgeStudent: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  userRoleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  userRoleBadgeTextAdmin: {
    color: '#4338CA',
  },
  userRoleBadgeTextStudent: {
    color: '#0369A1',
  },
  userEmailText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  userAccessDesc: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 4,
  },
  userCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  userStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  userStatusText: {
    fontSize: 12,
    color: '#475569',
  },
  userRoleChangeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  promoteBtn: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  demoteBtn: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  userRoleChangeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  promoteText: {
    color: '#4338CA',
  },
  demoteText: {
    color: '#DC2626',
  },
});
