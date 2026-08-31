import type { ActivityAction, ActivityModule, Peserta } from "@/lib/types";

export const ACTIVITY_ACTION_LABEL: Record<ActivityAction, string> = {
  PESERTA_TAMBAH: "Tambah peserta",
  MCU_UPLOAD: "Upload MCU",
  MCU_EDIT: "Edit data MCU",
  MCU_HAPUS: "Hapus data MCU",
  IZIN_TAMBAH: "Pengajuan izin senjata api",
  IZIN_EDIT: "Edit izin senjata api",
  IZIN_SETUJUI: "Setujui izin senjata api",
  IZIN_TOLAK: "Tolak izin senjata api",
  IZIN_HAPUS: "Hapus izin senjata api",
  PENGATURAN_SKHPK: "Ubah pengaturan cetakan SKHPK",
  SKHPK_KIRIM_WA: "Kirim SKHPK via WhatsApp",
};

export const ACTIVITY_MODULE_LABEL: Record<ActivityModule, string> = {
  PESERTA: "Peserta",
  MCU: "MCU",
  IZIN: "Izin Senjata Api",
  PENGATURAN: "Pengaturan",
};

export function pesertaActivityLabel(
  p?: Pick<Peserta, "nama" | "nrp"> | null,
) {
  if (!p) return "Peserta tidak diketahui";
  return `${p.nama} — NRP ${p.nrp}`;
}
