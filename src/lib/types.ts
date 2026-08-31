export type Role = "admin" | "superadmin" | "mcu";

export type User = {
  id: string;
  username: string;
  password: string;
  name: string;
  role: Role;
  unit: string;
};

export type SessionUser = {
  id: string;
  username: string;
  name: string;
  role: Role;
  unit: string;
};

export type HasilRikkes = "LAYAK" | "TIDAK_LAYAK" | "PENDING";

export type SkhpkSigner = {
  atasNama: string;
  jabatan: string;
  nama: string;
  pangkat: string;
  nrp: string;
  jenisKelamin: string;
  satuan: string;
  status: string;
  ttdImagePath: string;
};

export type Peserta = {
  id: string;
  nrp: string;
  nama: string;
  pangkat: string;
  satuan: string;
  jabatan: string;
  alamatKantor: string;
  tanggalLahir: string;
  jenisKelamin: "L" | "P";
  noHp: string;
  keperluan: "IZIN_SENJATA" | "RIKKES_BERKALA" | "LAINNYA";
  statusRikkes: HasilRikkes;
  statusIzin: "BELUM" | "DIAJUKAN" | "DISETUJUI" | "DITOLAK";
  createdAt: string;
  updatedAt: string;
};

export type Rikkes = {
  id: string;
  pesertaId: string;
  nomorSurat: string;
  nomorSkhpk?: string;
  tanggalPemeriksaan: string;
  tanggalTerbit?: string;
  ditujukanKepada?: string;
  rumahSakit: string;
  dokter: string;
  hasil: HasilRikkes;
  tekananDarah: string;
  denyutNadi: string;
  tinggiBadan: string;
  beratBadan: string;
  visus: string;
  catatan: string;
  fileName: string;
  filePath: string;
  barcodeValue?: string;
  uploadedBy: string;
  uploadedByName: string;
  signerSnapshot?: SkhpkSigner;
  waSentAt?: string;
  createdAt: string;
};

export type IzinSenjata = {
  id: string;
  pesertaId: string;
  nomorPermohonan: string;
  jenisSenjata: string;
  keperluan: string;
  tanggalPengajuan: string;
  status: "DIAJUKAN" | "VERIFIKASI" | "DISETUJUI" | "DITOLAK";
  catatan: string;
  rikkesId?: string;
  ditujukanKepada?: string;
  createdAt: string;
  updatedAt: string;
};

export type ActivityAction =
  | "PESERTA_TAMBAH"
  | "MCU_UPLOAD"
  | "MCU_EDIT"
  | "MCU_HAPUS"
  | "IZIN_TAMBAH"
  | "IZIN_EDIT"
  | "IZIN_SETUJUI"
  | "IZIN_TOLAK"
  | "IZIN_HAPUS"
  | "PENGATURAN_SKHPK"
  | "SKHPK_KIRIM_WA";

export type ActivityModule = "PESERTA" | "MCU" | "IZIN" | "PENGATURAN";

export type ActivityLog = {
  id: string;
  createdAt: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: ActivityAction;
  module: ActivityModule;
  targetId: string;
  targetLabel: string;
  detail: string;
};
