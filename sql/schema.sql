CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'superadmin', 'mcu')),
  unit TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS peserta (
  id TEXT PRIMARY KEY,
  nrp TEXT NOT NULL UNIQUE,
  nama TEXT NOT NULL,
  pangkat TEXT NOT NULL DEFAULT '',
  satuan TEXT NOT NULL DEFAULT '',
  jabatan TEXT NOT NULL DEFAULT '',
  alamat_kantor TEXT NOT NULL DEFAULT '',
  tanggal_lahir TEXT NOT NULL DEFAULT '',
  jenis_kelamin TEXT NOT NULL CHECK (jenis_kelamin IN ('L', 'P')),
  no_hp TEXT NOT NULL DEFAULT '',
  keperluan TEXT NOT NULL DEFAULT 'IZIN_SENJATA',
  status_rikkes TEXT NOT NULL DEFAULT 'PENDING',
  status_izin TEXT NOT NULL DEFAULT 'BELUM',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rikkes (
  id TEXT PRIMARY KEY,
  peserta_id TEXT NOT NULL REFERENCES peserta(id) ON DELETE CASCADE,
  nomor_surat TEXT NOT NULL,
  nomor_skhpk TEXT,
  tanggal_pemeriksaan TEXT NOT NULL,
  tanggal_terbit TEXT,
  ditujukan_kepada TEXT,
  rumah_sakit TEXT NOT NULL DEFAULT '',
  dokter TEXT NOT NULL DEFAULT '',
  hasil TEXT NOT NULL DEFAULT 'PENDING',
  tekanan_darah TEXT NOT NULL DEFAULT '',
  denyut_nadi TEXT NOT NULL DEFAULT '',
  tinggi_badan TEXT NOT NULL DEFAULT '',
  berat_badan TEXT NOT NULL DEFAULT '',
  visus TEXT NOT NULL DEFAULT '',
  catatan TEXT NOT NULL DEFAULT '',
  file_name TEXT NOT NULL DEFAULT '',
  file_path TEXT NOT NULL DEFAULT '',
  barcode_value TEXT,
  uploaded_by TEXT NOT NULL DEFAULT '',
  uploaded_by_name TEXT NOT NULL DEFAULT '',
  signer_snapshot JSONB,
  wa_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS izin_senjata (
  id TEXT PRIMARY KEY,
  peserta_id TEXT NOT NULL REFERENCES peserta(id) ON DELETE CASCADE,
  nomor_permohonan TEXT NOT NULL,
  jenis_senjata TEXT NOT NULL DEFAULT '',
  keperluan TEXT NOT NULL DEFAULT '',
  tanggal_pengajuan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DIAJUKAN',
  catatan TEXT NOT NULL DEFAULT '',
  rikkes_id TEXT,
  ditujukan_kepada TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_log (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id TEXT NOT NULL DEFAULT '',
  user_name TEXT NOT NULL DEFAULT '',
  user_role TEXT NOT NULL DEFAULT '',
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  target_id TEXT NOT NULL DEFAULT '',
  target_label TEXT NOT NULL DEFAULT '',
  detail TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS skhpk_setting (
  id TEXT PRIMARY KEY,
  atas_nama TEXT NOT NULL DEFAULT '',
  jabatan TEXT NOT NULL DEFAULT '',
  nama TEXT NOT NULL DEFAULT '',
  pangkat TEXT NOT NULL DEFAULT '',
  nrp TEXT NOT NULL DEFAULT '',
  jenis_kelamin TEXT NOT NULL DEFAULT '',
  satuan TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Aktif',
  ttd_image_path TEXT NOT NULL DEFAULT '/specimen-ttd.png',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rikkes_peserta ON rikkes(peserta_id);
CREATE INDEX IF NOT EXISTS idx_izin_peserta ON izin_senjata(peserta_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);
