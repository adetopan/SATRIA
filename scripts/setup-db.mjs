import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx < 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(path.join(root, ".env.local"));
loadEnvFile(path.join(root, ".env"));

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error(
    "DATABASE_URL belum di-set. Isi password PostgreSQL Anda di .env.local (password tidak diubah).",
  );
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });

const schema = readFileSync(path.join(root, "sql", "schema.sql"), "utf8");

const now = new Date().toISOString();

async function main() {
  const client = await pool.connect();
  try {
    console.log("Connected. Applying schema...");
    await client.query(schema);

    const users = await client.query("SELECT COUNT(*)::int AS count FROM users");
    if (users.rows[0].count > 0) {
      console.log("Data sudah ada, seed dilewati.");
      return;
    }

    console.log("Seeding demo data...");
    await client.query(
      `INSERT INTO users (id, username, password, name, role, unit) VALUES
       ('u-admin','admin','admin123','Administrator SATRIA','admin','Pusdokkes Polri'),
       ('u-superadmin','superadmin','superadmin123','Superadmin SATRIA','superadmin','Pusdokkes Polri'),
       ('u-mcu','mcu','mcu123','Petugas MCU RS Polri','mcu','RS Bhayangkara / MCU RS Polri')`,
    );

    await client.query(
      `INSERT INTO peserta (
         id, nrp, nama, pangkat, satuan, jabatan, alamat_kantor, tanggal_lahir,
         jenis_kelamin, no_hp, nomor_permohonan, keperluan, status_rikkes, status_izin, created_at, updated_at
       ) VALUES
       ('p-001','85010234','Bripka Andi Wijaya','Bripka','Polres Metro Jakarta Pusat','Bamin','Jl. Kramat Raya, Jakarta Pusat','1990-04-12','L','081234567890','','IZIN_SENJATA','PENDING','BELUM',$1,$1),
       ('p-002','87020991','Aiptu Siti Rahmawati','Aiptu','Polda Metro Jaya','Penyidik','Jl. Jend. Sudirman, Jakarta Selatan','1987-09-21','P','081298765432','','RIKKES_BERKALA','LAYAK','BELUM',$1,$1),
       ('p-003','91031550','Briptu Dimas Pratama','Briptu','Polres Bekasi','Patroli','Jl. Ahmad Yani, Bekasi','1995-01-08','L','082112223333','ISA/PMJ/112/2026','IZIN_SENJATA','PENDING','DIAJUKAN',$1,$1),
       ('p-004','83081568','Joko Agung Purnomo, S.I.K., M.Si., Ph.D.','AKBP','SSDM Polri','Asessor SDM Kepolisian Madya Tk. III SSDM Polri','Jalan Trunojoyo No.3, Kebayoran Baru, Jakarta Selatan','1983-08-15','L','081211112222','ISA/SSDM/082/2026','IZIN_SENJATA','LAYAK','DISETUJUI',$1,$1)`,
      [now],
    );

    await client.query(
      `INSERT INTO rikkes (
         id, peserta_id, nomor_surat, nomor_skhpk, tanggal_pemeriksaan, tanggal_terbit,
         ditujukan_kepada, rumah_sakit, dokter, hasil, tekanan_darah, denyut_nadi,
         tinggi_badan, berat_badan, visus, catatan, file_name, file_path, barcode_value,
         uploaded_by, uploaded_by_name, created_at
       ) VALUES
       ('r-001','p-002','MCU/RS.POLRI/045/VIII/2026','SKHPK/ 45 /VII/KES.15./2026/DOKKES','2026-07-20','2026-07-20','As SDM Kapolri','RS Bhayangkara Tk. I R. Said Sukanto','dr. Hendra Kusuma, Sp.KP','LAYAK','120/80','78','162','58','6/6','Sehat dan layak untuk tugas.','','','SATRIA|SKHPK/45/VII/KES.15./2026/DOKKES|87020991|LAYAK|2026-07-20','u-mcu','Petugas MCU RS Polri',$1),
       ('r-002','p-004','MCU/RS.POLRI/082/VII/2026','SKHPK/ 82 /VII/KES.15./2026/DOKKES','2026-07-28','2026-07-28','As SDM Kapolri','Pusdokkes Polri','Dr. dr. IG GEDE M. ANDIKA, Sp.Rad.','LAYAK','118/76','72','172','74','6/6','Memenuhi syarat untuk memperoleh Surat Izin Pinjam Pakai Senjata Api.','','','SATRIA|SKHPK/82/VII/KES.15./2026/DOKKES|83081568|LAYAK|2026-07-28','u-mcu','Petugas MCU RS Polri',$1)`,
      [now],
    );

    await client.query(
      `INSERT INTO izin_senjata (
         id, peserta_id, nomor_permohonan, jenis_senjata, keperluan, tanggal_pengajuan,
         status, catatan, rikkes_id, ditujukan_kepada, created_at, updated_at
       ) VALUES
       ('i-001','p-003','ISA/PMJ/112/2026','Pistol Dinas','Pengamanan tugas operasional','2026-08-01','VERIFIKASI','Menunggu hasil rikkes terbaru dari MCU.',NULL,'',$1,$1),
       ('i-002','p-004','ISA/SSDM/082/2026','Pistol Dinas','Surat Izin Pinjam Pakai Senjata Api','2026-07-28','DISETUJUI','SKHPK telah diterbitkan.','r-002','As SDM Kapolri',$1,$1)`,
      [now],
    );

    console.log("Setup database SATRIA selesai.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
