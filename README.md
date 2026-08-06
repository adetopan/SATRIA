# SATRIA

**Sistem Administrasi Terintegrasi Rikkes dan Izin Senjata Api**

Aplikasi web untuk mengelola data peserta, unggahan hasil MCU/rikkes dari RS Polri, dan administrasi izin senjata api.

## Fitur

- Login multi-peran: **Admin SATRIA** dan **MCU RS Polri**
- Manajemen data peserta (nama, NRP, pangkat, satuan, keperluan)
- Upload hasil rikkes oleh MCU (data medis + berkas PDF/gambar)
- Cetak SKHPK dengan barcode sebagai TTD digital
- Tracking izin senjata api yang terhubung dengan status rikkes
- Dashboard ringkasan administrasi

## Database (PostgreSQL)

Password PostgreSQL **tidak diubah** oleh SATRIA. Pakai username/password yang sudah Anda miliki.

1. Isi `.env.local` dengan password PostgreSQL Anda:

```env
DATABASE_URL=postgresql://postgres:PASSWORD_ANDA@127.0.0.1:5432/satria
```

2. Buat database `satria` (opsional, jika belum ada):

```powershell
.\scripts\setup-postgres.ps1
```

Script ini hanya membuat database dan menulis `.env.local`. **Tidak mereset password.**

3. Migrasi + seed:

```bash
npm run db:setup
```

## Menjalankan

```bash
npm install
npm run db:setup
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Akun demo aplikasi

| Peran | Username | Password |
|-------|----------|----------|
| Admin SATRIA | `admin` | `admin123` |
| MCU RS Polri | `mcu` | `mcu123` |

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- PostgreSQL (`pg`)
- Unggahan berkas di `public/uploads/`
