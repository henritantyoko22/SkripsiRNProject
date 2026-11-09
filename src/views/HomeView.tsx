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
} from 'react-native';
import { Image } from 'expo-image';
import { useAuth } from '@/context/AuthContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import {
  MahasiswaData,
  fetchMahasiswaData,
  saveMahasiswaData,
} from '@/services/studentService';

export function HomeView() {
  const { user, signOut, isLoading: isAuthLoading } = useAuth();
  const [studentData, setStudentData] = useState<MahasiswaData | null>(null);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Edit form state
  const [editNim, setEditNim] = useState('');
  const [editNama, setEditNama] = useState('');
  const [editJurusan, setEditJurusan] = useState('');
  const [editFakultas, setEditFakultas] = useState('');
  const [editSemester, setEditSemester] = useState('7');
  const [editIpk, setEditIpk] = useState('3.84');
  const [editJudul, setEditJudul] = useState('');

  const loadData = useCallback(async () => {
    if (!user?.email) return;
    try {
      const data = await fetchMahasiswaData(user.email, user.name, user.photoUrl);
      setStudentData(data);
      setEditNim(data.nim);
      setEditNama(data.nama);
      setEditJurusan(data.jurusan);
      setEditFakultas(data.fakultas);
      setEditSemester(data.semester.toString());
      setEditIpk(data.ipk.toString());
      setEditJudul(data.judulSkripsi);
    } catch (err) {
      console.warn('Gagal memuat data mahasiswa:', err);
    } finally {
      setLoadingData(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSaveEdit = async () => {
    if (!studentData) return;
    try {
      setSaving(true);
      const updated: MahasiswaData = {
        ...studentData,
        nim: editNim.trim() || studentData.nim,
        nama: editNama.trim() || studentData.nama,
        jurusan: editJurusan.trim() || studentData.jurusan,
        fakultas: editFakultas.trim() || studentData.fakultas,
        semester: Number(editSemester) || studentData.semester,
        ipk: parseFloat(editIpk) || studentData.ipk,
        judulSkripsi: editJudul.trim() || studentData.judulSkripsi,
      };

      const success = await saveMahasiswaData(updated);
      setStudentData(updated);
      setIsEditing(false);
      Alert.alert('Sukses', success ? 'Data mahasiswa berhasil diperbarui di database Firestore.' : 'Data tersimpan di sesi lokal.');
    } catch (e) {
      Alert.alert('Error', 'Gagal menyimpan perubahan data.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Konfirmasi Keluar',
      'Apakah Anda yakin ingin keluar dari akun mahasiswa ini?',
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

  if (loadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3c87f7" />
        <ThemedText type="small" themeColor="textSecondary" style={styles.loadingText}>
          Memuat data mahasiswa dari database...
        </ThemedText>
      </View>
    );
  }

  const data = studentData!;

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }>
      <View style={styles.container}>
        {/* Top Header Bar */}
        <View style={styles.headerBar}>
          <View>
            <ThemedText type="code" themeColor="textSecondary">
              PORTAL AKADEMIK
            </ThemedText>
            <ThemedText type="subtitle" style={styles.headerTitle}>
              Home Mahasiswa
            </ThemedText>
          </View>
          <Pressable onPress={() => setIsEditing(true)} style={styles.editButton}>
            <ThemedText type="smallBold" style={styles.editText}>
              ✏️ Edit Data
            </ThemedText>
          </Pressable>
        </View>

        {/* Kartu Tanda Mahasiswa Digital (KTM) */}
        <View style={styles.ktmCard}>
          <View style={styles.ktmTopBar}>
            <View>
              <ThemedText type="code" style={styles.ktmUni}>
                UNIVERSITAS DIPONEGORO
              </ThemedText>
              <ThemedText type="smallBold" style={styles.ktmCardTitle}>
                KARTU TANDA MAHASISWA
              </ThemedText>
            </View>
            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />
              <ThemedText type="code" style={styles.activeBadgeText}>
                {data.statusAkademik.toUpperCase()}
              </ThemedText>
            </View>
          </View>

          <View style={styles.ktmBody}>
            <View style={styles.ktmPhotoWrapper}>
              {data.fotoUrl ? (
                <Image
                  source={{ uri: data.fotoUrl }}
                  style={styles.ktmPhoto}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.ktmPhotoFallback}>
                  <ThemedText type="subtitle" style={styles.photoInitial}>
                    {data.nama.charAt(0)}
                  </ThemedText>
                </View>
              )}
            </View>

            <View style={styles.ktmInfo}>
              <ThemedText type="smallBold" style={styles.ktmNama} numberOfLines={2}>
                {data.nama}
              </ThemedText>
              <ThemedText type="code" style={styles.ktmNim}>
                NIM: {data.nim}
              </ThemedText>
              <ThemedText type="small" style={styles.ktmProdi}>
                {data.jurusan}
              </ThemedText>
              <ThemedText type="small" style={styles.ktmFakultas}>
                Fak. {data.fakultas}
              </ThemedText>
            </View>
          </View>

          <View style={styles.ktmFooter}>
            <ThemedText type="code" style={styles.ktmEmail}>
              {data.email}
            </ThemedText>
            <ThemedText type="code" style={styles.ktmAngkatan}>
              Angkatan {data.angkatan}
            </ThemedText>
          </View>
        </View>

        {/* Ringkasan Statistik Akademik */}
        <View style={styles.statsRow}>
          <ThemedView type="backgroundElement" style={styles.statBox}>
            <ThemedText type="code" themeColor="textSecondary">
              IPK
            </ThemedText>
            <ThemedText type="subtitle" style={styles.statValueHighlight}>
              {data.ipk.toFixed(2)}
            </ThemedText>
            <ThemedText type="code" style={styles.statSub}>
              Skala 4.00
            </ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.statBox}>
            <ThemedText type="code" themeColor="textSecondary">
              SKS SELESAI
            </ThemedText>
            <ThemedText type="subtitle" style={styles.statValue}>
              {data.sksSelesai}
            </ThemedText>
            <ThemedText type="code" style={styles.statSub}>
              Total 144 SKS
            </ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.statBox}>
            <ThemedText type="code" themeColor="textSecondary">
              SEMESTER
            </ThemedText>
            <ThemedText type="subtitle" style={styles.statValue}>
              {data.semester}
            </ThemedText>
            <ThemedText type="code" style={styles.statSub}>
              Ganjil 2026/2027
            </ThemedText>
          </ThemedView>
        </View>

        {/* Informasi Skripsi & Dosen Pembimbing */}
        <ThemedView type="backgroundElement" style={styles.card}>
          <View style={styles.cardTitleRow}>
            <ThemedText type="smallBold" style={styles.cardTitle}>
              Informasi Tugas Akhir / Skripsi
            </ThemedText>
            <View style={styles.skripsiBadge}>
              <ThemedText type="code" style={styles.skripsiBadgeText}>
                TAHAP PENGERJAAN
              </ThemedText>
            </View>
          </View>

          <View style={styles.skripsiContent}>
            <ThemedText type="code" themeColor="textSecondary">
              JUDUL SKRIPSI
            </ThemedText>
            <ThemedText type="default" style={styles.judulSkripsi}>
              &ldquo;{data.judulSkripsi}&rdquo;
            </ThemedText>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <ThemedText type="small" themeColor="textSecondary">
              Dosen Pembimbing
            </ThemedText>
            <ThemedText type="smallBold" style={styles.dosenText}>
              {data.pembimbingSkripsi}
            </ThemedText>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <ThemedText type="small" themeColor="textSecondary">
              Dosen Wali
            </ThemedText>
            <ThemedText type="smallBold" style={styles.dosenText}>
              {data.dosenWali}
            </ThemedText>
          </View>
        </ThemedView>

        {/* Tombol Logout */}
        <Pressable
          onPress={handleSignOut}
          disabled={isAuthLoading}
          style={({ pressed }) => [
            styles.signOutButton,
            pressed && styles.signOutButtonPressed,
          ]}>
          {isAuthLoading ? (
            <ActivityIndicator color="#E02424" size="small" />
          ) : (
            <ThemedText type="smallBold" style={styles.signOutText}>
              Keluar Akun Mahasiswa (Sign Out)
            </ThemedText>
          )}
        </Pressable>
      </View>

      {/* Modal Edit Data Mahasiswa */}
      <Modal
        visible={isEditing}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditing(false)}>
        <View style={styles.modalOverlay}>
          <ThemedView type="background" style={styles.modalContent}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              Edit Data Mahasiswa
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.modalSubtitle}>
              Perbarui data mahasiswa yang tersimpan di database Firestore
            </ThemedText>

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <ThemedText type="smallBold">NIM</ThemedText>
                <TextInput
                  value={editNim}
                  onChangeText={setEditNim}
                  style={styles.textInput}
                  placeholder="Contoh: 24060121130089"
                  placeholderTextColor="#888"
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText type="smallBold">Nama Lengkap</ThemedText>
                <TextInput
                  value={editNama}
                  onChangeText={setEditNama}
                  style={styles.textInput}
                  placeholder="Nama Lengkap Mahasiswa"
                  placeholderTextColor="#888"
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText type="smallBold">Program Studi / Jurusan</ThemedText>
                <TextInput
                  value={editJurusan}
                  onChangeText={setEditJurusan}
                  style={styles.textInput}
                  placeholder="Informatika"
                  placeholderTextColor="#888"
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText type="smallBold">Fakultas</ThemedText>
                <TextInput
                  value={editFakultas}
                  onChangeText={setEditFakultas}
                  style={styles.textInput}
                  placeholder="Sains dan Matematika"
                  placeholderTextColor="#888"
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <ThemedText type="smallBold">Semester</ThemedText>
                  <TextInput
                    value={editSemester}
                    onChangeText={setEditSemester}
                    keyboardType="numeric"
                    style={styles.textInput}
                    placeholder="7"
                    placeholderTextColor="#888"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <ThemedText type="smallBold">IPK</ThemedText>
                  <TextInput
                    value={editIpk}
                    onChangeText={setEditIpk}
                    keyboardType="decimal-pad"
                    style={styles.textInput}
                    placeholder="3.84"
                    placeholderTextColor="#888"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText type="smallBold">Judul Skripsi</ThemedText>
                <TextInput
                  value={editJudul}
                  onChangeText={setEditJudul}
                  multiline
                  numberOfLines={3}
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Tuliskan judul tugas akhir atau skripsi Anda..."
                  placeholderTextColor="#888"
                />
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setIsEditing(false)}
                disabled={saving}
                style={styles.modalCancelButton}>
                <ThemedText type="smallBold">Batal</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleSaveEdit}
                disabled={saving}
                style={styles.modalSaveButton}>
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <ThemedText type="smallBold" style={styles.modalSaveText}>
                    Simpan ke Firestore
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: Spacing.four,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
  },
  editButton: {
    backgroundColor: '#3c87f715',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3c87f740',
  },
  editText: {
    color: '#3c87f7',
    fontSize: 13,
  },
  ktmCard: {
    backgroundColor: '#1E3A8A',
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.three,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  ktmTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF33',
    paddingBottom: Spacing.two,
  },
  ktmUni: {
    color: '#93C5FD',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  ktmCardTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  activeBadge: {
    backgroundColor: '#065F46',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  activeBadgeText: {
    color: '#D1FAE5',
    fontSize: 10,
    fontWeight: '800',
  },
  ktmBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  ktmPhotoWrapper: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  ktmPhoto: {
    width: 72,
    height: 90,
  },
  ktmPhotoFallback: {
    width: 72,
    height: 90,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoInitial: {
    color: '#FFFFFF',
    fontSize: 28,
  },
  ktmInfo: {
    flex: 1,
    gap: 3,
  },
  ktmNama: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  ktmNim: {
    color: '#FCD34D',
    fontSize: 13,
    fontWeight: '700',
  },
  ktmProdi: {
    color: '#E0E7FF',
    fontSize: 13,
  },
  ktmFakultas: {
    color: '#BFDBFE',
    fontSize: 12,
  },
  ktmFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#FFFFFF22',
    paddingTop: Spacing.two,
  },
  ktmEmail: {
    color: '#BFDBFE',
    fontSize: 11,
  },
  ktmAngkatan: {
    color: '#93C5FD',
    fontSize: 11,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statBox: {
    flex: 1,
    padding: Spacing.three,
    borderRadius: 16,
    alignItems: 'center',
    gap: 2,
  },
  statValueHighlight: {
    fontSize: 24,
    fontWeight: '700',
    color: '#34A853',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statSub: {
    fontSize: 10,
    color: '#8E918F',
  },
  card: {
    padding: Spacing.four,
    borderRadius: 18,
    gap: Spacing.two,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
  },
  skripsiBadge: {
    backgroundColor: '#3c87f71A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  skripsiBadgeText: {
    color: '#3c87f7',
    fontSize: 10,
    fontWeight: '700',
  },
  skripsiContent: {
    gap: 4,
    marginTop: 2,
  },
  judulSkripsi: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#8E918F33',
    marginVertical: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dosenText: {
    fontSize: 13,
    textAlign: 'right',
    maxWidth: '60%',
  },
  signOutButton: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F98080',
    backgroundColor: '#FDE8E833',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  signOutButtonPressed: {
    opacity: 0.7,
  },
  signOutText: {
    color: '#E02424',
    fontSize: 14,
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
    maxHeight: '85%',
    gap: Spacing.two,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 13,
    marginBottom: Spacing.two,
  },
  modalForm: {
    marginBottom: Spacing.three,
  },
  inputGroup: {
    marginBottom: Spacing.three,
    gap: 6,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#8E918F40',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F1F1F',
    backgroundColor: '#FFFFFF10',
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
  modalCancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#8E918F40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSaveButton: {
    flex: 2,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3c87f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSaveText: {
    color: '#FFFFFF',
  },
});
