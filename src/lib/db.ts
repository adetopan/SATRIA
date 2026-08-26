import { promises as fs } from "fs";
import path from "path";
import { ensureUploadDir } from "@/lib/uploads";
import { query } from "./pg";
import { buildBarcodeValue, buildNomorSkhpk } from "./skhpk";
import type { IzinSenjata, Peserta, Rikkes, User } from "./types";

async function ensureUploadsDir() {
  await ensureUploadDir();
}

const defaultUsers: User[] = [
  {
    id: "u-admin",
    username: "admin",
    password: "admin123",
    name: "Administrator SATRIA",
    role: "admin",
    unit: "Pusdokkes Polri",
  },
  {
    id: "u-mcu",
    username: "mcu",
    password: "mcu123",
    name: "Petugas MCU RS Polri",
    role: "mcu",
    unit: "RS Bhayangkara / MCU RS Polri",
  },
];

const now = new Date().toISOString();

const defaultPeserta: Peserta[] = [
  {
    id: "p-001",
    nrp: "85010234",
    nama: "Bripka Andi Wijaya",
    pangkat: "Bripka",
    satuan: "Polres Metro Jakarta Pusat",
    jabatan: "Bamin",
    alamatKantor: "Jl. Kramat Raya, Jakarta Pusat",
    tanggalLahir: "1990-04-12",
    jenisKelamin: "L",
    noHp: "081234567890",
    keperluan: "IZIN_SENJATA",
    statusRikkes: "PENDING",
    statusIzin: "BELUM",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "p-002",
    nrp: "87020991",
    nama: "Aiptu Siti Rahmawati",
    pangkat: "Aiptu",
    satuan: "Polda Metro Jaya",
    jabatan: "Penyidik",
    alamatKantor: "Jl. Jend. Sudirman, Jakarta Selatan",
    tanggalLahir: "1987-09-21",
    jenisKelamin: "P",
    noHp: "081298765432",
    keperluan: "RIKKES_BERKALA",
    statusRikkes: "LAYAK",
    statusIzin: "BELUM",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "p-003",
    nrp: "91031550",
    nama: "Briptu Dimas Pratama",
    pangkat: "Briptu",
    satuan: "Polres Bekasi",
    jabatan: "Patroli",
    alamatKantor: "Jl. Ahmad Yani, Bekasi",
    tanggalLahir: "1995-01-08",
    jenisKelamin: "L",
    noHp: "082112223333",
    keperluan: "IZIN_SENJATA",
    statusRikkes: "PENDING",
    statusIzin: "DIAJUKAN",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "p-004",
    nrp: "83081568",
    nama: "Joko Agung Purnomo, S.I.K., M.Si., Ph.D.",
    pangkat: "AKBP",
    satuan: "SSDM Polri",
    jabatan: "Asessor SDM Kepolisian Madya Tk. III SSDM Polri",
    alamatKantor: "Jalan Trunojoyo No.3, Kebayoran Baru, Jakarta Selatan",
    tanggalLahir: "1983-08-15",
    jenisKelamin: "L",
    noHp: "081211112222",
    keperluan: "IZIN_SENJATA",
    statusRikkes: "LAYAK",
    statusIzin: "DISETUJUI",
    createdAt: now,
    updatedAt: now,
  },
];

const sampleSkhpkNomor = buildNomorSkhpk(82, "2026-07-28");
const samplePeserta = defaultPeserta[3];

const defaultRikkes: Rikkes[] = [
  {
    id: "r-001",
    pesertaId: "p-002",
    nomorSurat: "MCU/RS.POLRI/045/VIII/2026",
    nomorSkhpk: buildNomorSkhpk(45, "2026-07-20"),
    tanggalPemeriksaan: "2026-07-20",
    tanggalTerbit: "2026-07-20",
    ditujukanKepada: "As SDM Kapolri",
    rumahSakit: "RS Bhayangkara Tk. I R. Said Sukanto",
    dokter: "dr. Hendra Kusuma, Sp.KP",
    hasil: "LAYAK",
    tekananDarah: "120/80",
    denyutNadi: "78",
    tinggiBadan: "162",
    beratBadan: "58",
    visus: "6/6",
    catatan: "Sehat dan layak untuk tugas.",
    fileName: "",
    filePath: "",
    barcodeValue: "",
    uploadedBy: "u-mcu",
    uploadedByName: "Petugas MCU RS Polri",
    createdAt: now,
  },
  {
    id: "r-002",
    pesertaId: "p-004",
    nomorSurat: "MCU/RS.POLRI/082/VII/2026",
    nomorSkhpk: sampleSkhpkNomor,
    tanggalPemeriksaan: "2026-07-28",
    tanggalTerbit: "2026-07-28",
    ditujukanKepada: "As SDM Kapolri",
    rumahSakit: "Pusdokkes Polri",
    dokter: "Dr. dr. IG GEDE M. ANDIKA, Sp.Rad.",
    hasil: "LAYAK",
    tekananDarah: "118/76",
    denyutNadi: "72",
    tinggiBadan: "172",
    beratBadan: "74",
    visus: "6/6",
    catatan:
      "Memenuhi syarat untuk memperoleh Surat Izin Pinjam Pakai Senjata Api.",
    fileName: "",
    filePath: "",
    barcodeValue: "",
    uploadedBy: "u-mcu",
    uploadedByName: "Petugas MCU RS Polri",
    createdAt: now,
  },
];

defaultRikkes[0].barcodeValue = buildBarcodeValue(
  defaultRikkes[0],
  defaultPeserta[1],
);
defaultRikkes[1].barcodeValue = buildBarcodeValue(
  defaultRikkes[1],
  samplePeserta,
);

const defaultIzin: IzinSenjata[] = [
  {
    id: "i-001",
    pesertaId: "p-003",
    nomorPermohonan: "ISA/PMJ/112/2026",
    jenisSenjata: "Pistol Dinas",
    keperluan: "Pengamanan tugas operasional",
    tanggalPengajuan: "2026-08-01",
    status: "VERIFIKASI",
    catatan: "Menunggu hasil rikkes terbaru dari MCU.",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "i-002",
    pesertaId: "p-004",
    nomorPermohonan: "ISA/SSDM/082/2026",
    jenisSenjata: "Pistol Dinas",
    keperluan: "Surat Izin Pinjam Pakai Senjata Api",
    tanggalPengajuan: "2026-07-28",
    status: "DISETUJUI",
    catatan: "SKHPK telah diterbitkan.",
    rikkesId: "r-002",
    createdAt: now,
    updatedAt: now,
  },
];

function mapPeserta(row: Record<string, unknown>): Peserta {
  return {
    id: String(row.id),
    nrp: String(row.nrp),
    nama: String(row.nama),
    pangkat: String(row.pangkat || ""),
    satuan: String(row.satuan || ""),
    jabatan: String(row.jabatan || ""),
    alamatKantor: String(row.alamat_kantor || ""),
    tanggalLahir: String(row.tanggal_lahir || ""),
    jenisKelamin: row.jenis_kelamin === "P" ? "P" : "L",
    noHp: String(row.no_hp || ""),
    keperluan: (row.keperluan as Peserta["keperluan"]) || "IZIN_SENJATA",
    statusRikkes: (row.status_rikkes as Peserta["statusRikkes"]) || "PENDING",
    statusIzin: (row.status_izin as Peserta["statusIzin"]) || "BELUM",
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

function mapRikkes(row: Record<string, unknown>): Rikkes {
  return {
    id: String(row.id),
    pesertaId: String(row.peserta_id),
    nomorSurat: String(row.nomor_surat),
    nomorSkhpk: row.nomor_skhpk ? String(row.nomor_skhpk) : undefined,
    tanggalPemeriksaan: String(row.tanggal_pemeriksaan || ""),
    tanggalTerbit: row.tanggal_terbit ? String(row.tanggal_terbit) : undefined,
    ditujukanKepada: row.ditujukan_kepada
      ? String(row.ditujukan_kepada)
      : undefined,
    rumahSakit: String(row.rumah_sakit || ""),
    dokter: String(row.dokter || ""),
    hasil: (row.hasil as Rikkes["hasil"]) || "PENDING",
    tekananDarah: String(row.tekanan_darah || ""),
    denyutNadi: String(row.denyut_nadi || ""),
    tinggiBadan: String(row.tinggi_badan || ""),
    beratBadan: String(row.berat_badan || ""),
    visus: String(row.visus || ""),
    catatan: String(row.catatan || ""),
    fileName: String(row.file_name || ""),
    filePath: String(row.file_path || ""),
    barcodeValue: row.barcode_value ? String(row.barcode_value) : undefined,
    uploadedBy: String(row.uploaded_by || ""),
    uploadedByName: String(row.uploaded_by_name || ""),
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

function mapIzin(row: Record<string, unknown>): IzinSenjata {
  return {
    id: String(row.id),
    pesertaId: String(row.peserta_id),
    nomorPermohonan: String(row.nomor_permohonan),
    jenisSenjata: String(row.jenis_senjata || ""),
    keperluan: String(row.keperluan || ""),
    tanggalPengajuan: String(row.tanggal_pengajuan || ""),
    status: (row.status as IzinSenjata["status"]) || "DIAJUKAN",
    catatan: String(row.catatan || ""),
    rikkesId: row.rikkes_id ? String(row.rikkes_id) : undefined,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

let ensured = false;

export async function ensureDb() {
  if (ensured) return;
  await ensureUploadsDir();

  const schema = await fs.readFile(
    path.join(process.cwd(), "sql", "schema.sql"),
    "utf8",
  );
  await query(schema);

  const usersCount = await query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM users",
  );
  if (Number(usersCount.rows[0]?.count || 0) === 0) {
    await seedDefaults();
  }

  ensured = true;
}

async function upsertPeserta(p: Peserta) {
  await query(
    `INSERT INTO peserta (
       id, nrp, nama, pangkat, satuan, jabatan, alamat_kantor, tanggal_lahir,
       jenis_kelamin, no_hp, keperluan, status_rikkes, status_izin, created_at, updated_at
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
     ON CONFLICT (id) DO UPDATE SET
       nrp = EXCLUDED.nrp,
       nama = EXCLUDED.nama,
       pangkat = EXCLUDED.pangkat,
       satuan = EXCLUDED.satuan,
       jabatan = EXCLUDED.jabatan,
       alamat_kantor = EXCLUDED.alamat_kantor,
       tanggal_lahir = EXCLUDED.tanggal_lahir,
       jenis_kelamin = EXCLUDED.jenis_kelamin,
       no_hp = EXCLUDED.no_hp,
       keperluan = EXCLUDED.keperluan,
       status_rikkes = EXCLUDED.status_rikkes,
       status_izin = EXCLUDED.status_izin,
       updated_at = EXCLUDED.updated_at`,
    [
      p.id,
      p.nrp,
      p.nama,
      p.pangkat,
      p.satuan,
      p.jabatan,
      p.alamatKantor || "",
      p.tanggalLahir,
      p.jenisKelamin,
      p.noHp,
      p.keperluan,
      p.statusRikkes,
      p.statusIzin,
      p.createdAt,
      p.updatedAt,
    ],
  );
}

async function upsertRikkes(r: Rikkes) {
  await query(
    `INSERT INTO rikkes (
       id, peserta_id, nomor_surat, nomor_skhpk, tanggal_pemeriksaan, tanggal_terbit,
       ditujukan_kepada, rumah_sakit, dokter, hasil, tekanan_darah, denyut_nadi,
       tinggi_badan, berat_badan, visus, catatan, file_name, file_path, barcode_value,
       uploaded_by, uploaded_by_name, created_at
     ) VALUES (
       $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22
     )
     ON CONFLICT (id) DO UPDATE SET
       peserta_id = EXCLUDED.peserta_id,
       nomor_surat = EXCLUDED.nomor_surat,
       nomor_skhpk = EXCLUDED.nomor_skhpk,
       tanggal_pemeriksaan = EXCLUDED.tanggal_pemeriksaan,
       tanggal_terbit = EXCLUDED.tanggal_terbit,
       ditujukan_kepada = EXCLUDED.ditujukan_kepada,
       rumah_sakit = EXCLUDED.rumah_sakit,
       dokter = EXCLUDED.dokter,
       hasil = EXCLUDED.hasil,
       tekanan_darah = EXCLUDED.tekanan_darah,
       denyut_nadi = EXCLUDED.denyut_nadi,
       tinggi_badan = EXCLUDED.tinggi_badan,
       berat_badan = EXCLUDED.berat_badan,
       visus = EXCLUDED.visus,
       catatan = EXCLUDED.catatan,
       file_name = EXCLUDED.file_name,
       file_path = EXCLUDED.file_path,
       barcode_value = EXCLUDED.barcode_value,
       uploaded_by = EXCLUDED.uploaded_by,
       uploaded_by_name = EXCLUDED.uploaded_by_name`,
    [
      r.id,
      r.pesertaId,
      r.nomorSurat,
      r.nomorSkhpk || null,
      r.tanggalPemeriksaan,
      r.tanggalTerbit || null,
      r.ditujukanKepada || null,
      r.rumahSakit,
      r.dokter,
      r.hasil,
      r.tekananDarah,
      r.denyutNadi,
      r.tinggiBadan,
      r.beratBadan,
      r.visus,
      r.catatan,
      r.fileName,
      r.filePath,
      r.barcodeValue || null,
      r.uploadedBy,
      r.uploadedByName,
      r.createdAt,
    ],
  );
}

async function upsertIzin(i: IzinSenjata) {
  await query(
    `INSERT INTO izin_senjata (
       id, peserta_id, nomor_permohonan, jenis_senjata, keperluan, tanggal_pengajuan,
       status, catatan, rikkes_id, created_at, updated_at
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     ON CONFLICT (id) DO UPDATE SET
       peserta_id = EXCLUDED.peserta_id,
       nomor_permohonan = EXCLUDED.nomor_permohonan,
       jenis_senjata = EXCLUDED.jenis_senjata,
       keperluan = EXCLUDED.keperluan,
       tanggal_pengajuan = EXCLUDED.tanggal_pengajuan,
       status = EXCLUDED.status,
       catatan = EXCLUDED.catatan,
       rikkes_id = EXCLUDED.rikkes_id,
       updated_at = EXCLUDED.updated_at`,
    [
      i.id,
      i.pesertaId,
      i.nomorPermohonan,
      i.jenisSenjata,
      i.keperluan,
      i.tanggalPengajuan,
      i.status,
      i.catatan,
      i.rikkesId || null,
      i.createdAt,
      i.updatedAt,
    ],
  );
}

async function seedDefaults() {
  for (const u of defaultUsers) {
    await query(
      `INSERT INTO users (id, username, password, name, role, unit)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (id) DO NOTHING`,
      [u.id, u.username, u.password, u.name, u.role, u.unit],
    );
  }
  for (const p of defaultPeserta) await upsertPeserta(p);
  for (const r of defaultRikkes) await upsertRikkes(r);
  for (const i of defaultIzin) await upsertIzin(i);
}

export async function getUsers() {
  await ensureDb();
  const result = await query(
    "SELECT id, username, password, name, role, unit FROM users ORDER BY username",
  );
  return result.rows.map((row) => ({
    id: String(row.id),
    username: String(row.username),
    password: String(row.password),
    name: String(row.name),
    role: row.role as User["role"],
    unit: String(row.unit || ""),
  }));
}

export async function getPeserta() {
  await ensureDb();
  const result = await query(
    "SELECT * FROM peserta ORDER BY created_at DESC, nama ASC",
  );
  return result.rows.map((row) => mapPeserta(row));
}

export async function savePeserta(data: Peserta[]) {
  await ensureDb();
  const existing = await query<{ id: string }>("SELECT id FROM peserta");
  const keep = new Set(data.map((p) => p.id));
  for (const row of existing.rows) {
    if (!keep.has(String(row.id))) {
      await query("DELETE FROM peserta WHERE id = $1", [row.id]);
    }
  }
  for (const p of data) await upsertPeserta(p);
}

export async function getRikkes() {
  await ensureDb();
  const result = await query("SELECT * FROM rikkes ORDER BY created_at DESC");
  return result.rows.map((row) => mapRikkes(row));
}

export async function saveRikkes(data: Rikkes[]) {
  await ensureDb();
  const existing = await query<{ id: string }>("SELECT id FROM rikkes");
  const keep = new Set(data.map((r) => r.id));
  for (const row of existing.rows) {
    if (!keep.has(String(row.id))) {
      await query("DELETE FROM rikkes WHERE id = $1", [row.id]);
    }
  }
  for (const r of data) await upsertRikkes(r);
}

export async function getIzin() {
  await ensureDb();
  const result = await query(
    "SELECT * FROM izin_senjata ORDER BY created_at DESC",
  );
  return result.rows.map((row) => mapIzin(row));
}

export async function saveIzin(data: IzinSenjata[]) {
  await ensureDb();
  const existing = await query<{ id: string }>("SELECT id FROM izin_senjata");
  const keep = new Set(data.map((i) => i.id));
  for (const row of existing.rows) {
    if (!keep.has(String(row.id))) {
      await query("DELETE FROM izin_senjata WHERE id = $1", [row.id]);
    }
  }
  for (const i of data) await upsertIzin(i);
}

export function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
