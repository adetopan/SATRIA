import { ACTIVITY_ACTION_LABEL } from "@/lib/activity-labels";
import { isValidNrp, normalizeNrp } from "@/lib/format";
import type { ActivityLog, IzinSenjata, Peserta, Rikkes } from "@/lib/types";

export type ManfaatBaris = {
  indikator: string;
  nilai: string;
  arti: string;
  nada?: "ok" | "wait" | "bad" | "info";
};

export type ManfaatAksi = {
  aksi: string;
  label: string;
  n: number;
};

export type ManfaatHarian = {
  hari: string;
  n: number;
};

export type ManfaatResponTahap = {
  tahap: string;
  dari: string;
  ke: string;
  n: number;
  median: string;
  rata: string;
  tercepat: string;
  terlama: string;
};

export type ManfaatEfisiensiLaporan = {
  dibuatPada: string;
  peserta: number;
  rikkes: number;
  izin: number;
  logs: number;
  funnel: {
    disetujui: number;
    ditolak: number;
    izinBerjalan: number;
    mcuTanpaIzin: number;
    belumMcu: number;
  };
  respon: {
    pesertaKeMcu: ManfaatResponTahap;
    mcuKeIzin: ManfaatResponTahap;
    pesertaKeIzin: ManfaatResponTahap;
    menungguMcu: string;
    menungguIzin: string;
    catatan: string;
  };
  kelengkapan: ManfaatBaris[];
  efisiensi: ManfaatBaris[];
  aksi: ManfaatAksi[];
  harian: ManfaatHarian[];
  catatanJeda: string;
};

function filled(value?: string) {
  return Boolean(String(value || "").trim());
}

function jakartaDay(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}

function formatHariId(isoDay: string) {
  const date = new Date(`${isoDay}T00:00:00+07:00`);
  if (Number.isNaN(date.getTime())) return isoDay;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

function rasio(n: number, d: number) {
  if (d <= 0) return "0 / 0";
  const pct = Math.round((n / d) * 100);
  return `${n} / ${d} (${pct}%)`;
}

function nadaRasio(n: number, d: number): ManfaatBaris["nada"] {
  if (d <= 0) return "wait";
  const p = n / d;
  if (p >= 0.9) return "ok";
  if (p >= 0.5) return "info";
  if (p >= 0.2) return "wait";
  return "bad";
}

function median(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor((sorted.length - 1) / 2)];
}

function mean(values: number[]) {
  if (!values.length) return null;
  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length,
  );
}

function daysBetween(fromIso: string, toIso: string) {
  const from = jakartaDay(fromIso);
  const to = jakartaDay(toIso);
  if (!from || !to || to < from) return null;
  const start = new Date(`${from}T00:00:00+07:00`).getTime();
  const end = new Date(`${to}T00:00:00+07:00`).getTime();
  return Math.round((end - start) / 864e5);
}

function formatDurasi(days: number | null) {
  if (days == null || !Number.isFinite(days)) return "—";
  const whole = Math.max(0, Math.round(days));
  if (whole === 0) return "hari yang sama";
  return `${whole} hari`;
}

function ringkasDurasi(
  values: number[],
): Omit<ManfaatResponTahap, "tahap" | "dari" | "ke"> {
  if (!values.length) {
    return {
      n: 0,
      median: "Belum ada data",
      rata: "—",
      tercepat: "—",
      terlama: "—",
    };
  }
  return {
    n: values.length,
    median: formatDurasi(median(values)),
    rata: formatDurasi(mean(values)),
    tercepat: formatDurasi(Math.min(...values)),
    terlama: formatDurasi(Math.max(...values)),
  };
}

export function buildManfaatEfisiensiLaporan(
  peserta: Peserta[],
  rikkes: Rikkes[],
  izin: IzinSenjata[],
  logs: ActivityLog[],
): ManfaatEfisiensiLaporan {
  const mcuIds = new Set(rikkes.map((row) => row.pesertaId));
  const izinIds = new Set(izin.map((row) => row.pesertaId));
  const disetujuiIds = new Set(
    izin.filter((row) => row.status === "DISETUJUI").map((row) => row.pesertaId),
  );
  const ditolakIds = new Set(
    izin.filter((row) => row.status === "DITOLAK").map((row) => row.pesertaId),
  );
  const izinBerjalanIds = new Set(
    izin
      .filter((row) => ["DIAJUKAN", "VERIFIKASI"].includes(row.status))
      .map((row) => row.pesertaId),
  );

  const belumMcu = peserta.filter((row) => !mcuIds.has(row.id)).length;
  const mcuTanpaIzin = peserta.filter(
    (row) => mcuIds.has(row.id) && !izinIds.has(row.id),
  ).length;
  const izinBerjalan = peserta.filter((row) =>
    izinBerjalanIds.has(row.id),
  ).length;
  const disetujui = peserta.filter((row) => disetujuiIds.has(row.id)).length;
  const ditolak = peserta.filter((row) => ditolakIds.has(row.id)).length;

  const nrpCount = new Map<string, number>();
  for (const row of peserta) {
    const nrp = normalizeNrp(row.nrp);
    if (!nrp) continue;
    nrpCount.set(nrp, (nrpCount.get(nrp) || 0) + 1);
  }
  const nrpDuplikatPasang = [...nrpCount.values()].filter((n) => n > 1).length;

  const berkasMcu = rikkes.filter((row) => filled(row.filePath)).length;
  const nomorSkhpk = rikkes.filter(
    (row) => filled(row.nomorSkhpk) && !/draft/i.test(row.nomorSkhpk || ""),
  ).length;
  const tertaut = izin.filter((row) => filled(row.rikkesId)).length;
  const waTerkirim = rikkes.filter((row) => filled(row.waSentAt)).length;

  const nowIso = new Date().toISOString();
  const mcuPertama = new Map<string, Rikkes>();
  for (const row of [...rikkes].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  )) {
    if (!mcuPertama.has(row.pesertaId)) mcuPertama.set(row.pesertaId, row);
  }

  const izinPutusan = new Map<string, IzinSenjata>();
  for (const row of [...izin]
    .filter((item) => ["DISETUJUI", "DITOLAK"].includes(item.status))
    .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt))) {
    if (!izinPutusan.has(row.pesertaId)) izinPutusan.set(row.pesertaId, row);
  }

  const jedaPesertaKeMcu: number[] = [];
  const jedaMcuKeIzin: number[] = [];
  const jedaPesertaKeIzin: number[] = [];
  const tungguMcu: number[] = [];
  const tungguIzin: number[] = [];

  for (const row of peserta) {
    const mcu = mcuPertama.get(row.id);
    const putusan = izinPutusan.get(row.id);
    if (mcu) {
      const keMcu = daysBetween(row.createdAt, mcu.createdAt);
      if (keMcu != null) jedaPesertaKeMcu.push(keMcu);
    } else {
      const menunggu = daysBetween(row.createdAt, nowIso);
      if (menunggu != null) tungguMcu.push(menunggu);
    }

    if (mcu && putusan) {
      const mcuWaktu = putusan.rikkesId
        ? rikkes.find((item) => item.id === putusan.rikkesId)?.createdAt ||
          mcu.createdAt
        : mcu.createdAt;
      const keIzin = daysBetween(mcuWaktu, putusan.updatedAt);
      if (keIzin != null) jedaMcuKeIzin.push(keIzin);
      const total = daysBetween(row.createdAt, putusan.updatedAt);
      if (total != null) jedaPesertaKeIzin.push(total);
    } else if (mcu && !putusan) {
      const menunggu = daysBetween(mcu.createdAt, nowIso);
      if (menunggu != null) tungguIzin.push(menunggu);
    }
  }

  const aksiMap = new Map<string, number>();
  for (const log of logs) {
    aksiMap.set(log.action, (aksiMap.get(log.action) || 0) + 1);
  }
  const aksi = [...aksiMap.entries()]
    .map(([key, n]) => ({
      aksi: key,
      label: ACTIVITY_ACTION_LABEL[key as keyof typeof ACTIVITY_ACTION_LABEL] || key,
      n,
    }))
    .sort((a, b) => b.n - a.n);

  const hariMap = new Map<string, number>();
  for (const log of logs) {
    const day = jakartaDay(log.createdAt);
    if (!day) continue;
    hariMap.set(day, (hariMap.get(day) || 0) + 1);
  }
  const harian = [...hariMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([hari, n]) => ({ hari: formatHariId(hari), n }));

  const n = peserta.length;
  const r = rikkes.length;
  const i = izin.length;

  return {
    dibuatPada: new Date().toISOString(),
    peserta: n,
    rikkes: r,
    izin: i,
    logs: logs.length,
    funnel: {
      disetujui,
      ditolak,
      izinBerjalan,
      mcuTanpaIzin,
      belumMcu,
    },
    respon: {
      pesertaKeMcu: {
        tahap: "Peserta → hasil MCU",
        dari: "Data peserta terbit",
        ke: "Hasil MCU masuk sistem",
        ...ringkasDurasi(jedaPesertaKeMcu),
      },
      mcuKeIzin: {
        tahap: "MCU → izin senjata",
        dari: "Hasil MCU masuk",
        ke: "Izin disetujui atau ditolak",
        ...ringkasDurasi(jedaMcuKeIzin),
      },
      pesertaKeIzin: {
        tahap: "Peserta → izin senjata",
        dari: "Data peserta terbit",
        ke: "Izin selesai diputus",
        ...ringkasDurasi(jedaPesertaKeIzin),
      },
      menungguMcu:
        tungguMcu.length > 0
          ? `${tungguMcu.length} peserta menunggu MCU (nilai tengah ${formatDurasi(median(tungguMcu))})`
          : "Tidak ada peserta yang masih menunggu MCU",
      menungguIzin:
        tungguIzin.length > 0
          ? `${tungguIzin.length} sudah MCU, belum ada putusan izin (nilai tengah ${formatDurasi(median(tungguIzin))})`
          : "Tidak ada antrean MCU tanpa putusan izin",
      catatan:
        jedaPesertaKeIzin.length <= 1
          ? "Hitungan memakai selisih tanggal kalender (1 hari, 2 hari, dst). Nilai tengah adalah angka di urutan tengah, bukan rata-rata."
          : "Hitungan memakai selisih tanggal kalender Asia/Jakarta. Nilai tengah adalah angka di urutan tengah, bukan rata-rata.",
    },
    kelengkapan: [
      {
        indikator: "NRP 8 digit valid",
        nilai: rasio(peserta.filter((row) => isValidNrp(row.nrp)).length, n),
        arti: "Identitas SKHPK dan barcode seragam",
        nada: nadaRasio(peserta.filter((row) => isValidNrp(row.nrp)).length, n),
      },
      {
        indikator: "Nomor permohonan",
        nilai: rasio(peserta.filter((row) => filled(row.nomorPermohonan)).length, n),
        arti: "Register izin tidak dicari di buku terpisah",
        nada: nadaRasio(
          peserta.filter((row) => filled(row.nomorPermohonan)).length,
          n,
        ),
      },
      {
        indikator: "Jabatan",
        nilai: rasio(peserta.filter((row) => filled(row.jabatan)).length, n),
        arti: "Dipakai cetakan SKHPK",
        nada: nadaRasio(peserta.filter((row) => filled(row.jabatan)).length, n),
      },
      {
        indikator: "Alamat kantor",
        nilai: rasio(peserta.filter((row) => filled(row.alamatKantor)).length, n),
        arti: "Dipakai cetakan SKHPK",
        nada: nadaRasio(peserta.filter((row) => filled(row.alamatKantor)).length, n),
      },
      {
        indikator: "Pangkat",
        nilai: rasio(peserta.filter((row) => filled(row.pangkat)).length, n),
        arti: "Identitas personel di surat",
        nada: nadaRasio(peserta.filter((row) => filled(row.pangkat)).length, n),
      },
      {
        indikator: "Satuan / kesatuan",
        nilai: rasio(peserta.filter((row) => filled(row.satuan)).length, n),
        arti: "Kosong berarti kesatuan di SKHPK tidak terisi",
        nada: nadaRasio(peserta.filter((row) => filled(row.satuan)).length, n),
      },
      {
        indikator: "Nomor HP",
        nilai: rasio(peserta.filter((row) => filled(row.noHp)).length, n),
        arti: "Siap distribusi WhatsApp",
        nada: nadaRasio(peserta.filter((row) => filled(row.noHp)).length, n),
      },
      {
        indikator: "Surat permohonan",
        nilai: rasio(
          peserta.filter((row) => filled(row.suratPermohonanFilePath)).length,
          n,
        ),
        arti: "Berkas permohonan sudah digital",
        nada: nadaRasio(
          peserta.filter((row) => filled(row.suratPermohonanFilePath)).length,
          n,
        ),
      },
    ],
    efisiensi: [
      {
        indikator: "Peserta sudah MCU",
        nilai: rasio(mcuIds.size, n),
        arti: "Antrean sisa terlihat di dashboard, tidak hilang di tumpukan kertas",
        nada: "info",
      },
      {
        indikator: "Berkas hasil MCU terlampir",
        nilai: rasio(berkasMcu, r),
        arti: "File hasil MCU tersimpan di SATRIA, tidak hanya di kertas terpisah",
        nada: berkasMcu === r && r > 0 ? "ok" : "wait",
      },
      {
        indikator: "Izin tertaut rikkes",
        nilai: rasio(tertaut, i),
        arti: "Putusan memakai hasil pemeriksaan yang sama",
        nada: tertaut === i && i > 0 ? "ok" : "wait",
      },
      {
        indikator: "Nomor SKHPK terbit",
        nilai: String(nomorSkhpk),
        arti: "Penomoran tercatat di sistem, bukan register kertas saja",
        nada: "info",
      },
      {
        indikator: "SKHPK dikirim WhatsApp",
        nilai: String(waTerkirim),
        arti: "Saluran distribusi digital sudah ada di aplikasi",
        nada: waTerkirim ? "ok" : "wait",
      },
    ],
    aksi,
    harian,
    catatanJeda:
      jedaPesertaKeIzin.length <= 1
        ? "Waktu respon dihitung dari timestamp sistem, bukan janji SLA."
        : "Waktu respon dihitung dari timestamp sistem, bukan janji SLA.",
  };
}
