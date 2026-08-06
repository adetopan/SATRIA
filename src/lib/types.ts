export type Role = "admin" | "mcu";

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
  createdAt: string;
  updatedAt: string;
};
