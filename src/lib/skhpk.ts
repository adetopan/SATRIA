import type { HasilRikkes, Peserta, Rikkes, SkhpkSigner } from "./types";

export const SKHPK_SIGNER = {
  atasNama: "a.n. KEPALA PUSAT KEDOKTERAN DAN KESEHATAN POLRI",
  jabatan: "KAROKESPOL",
  nama: "Dr. dr.MOHAMMAD KHUSNAN MARZUKI, M.M., M.H.",
  pangkat: "BRIGADIR JENDRAL POLISI",
  nrp: "70090417",
  jenisKelamin: "LAKI-LAKI",
  satuan: "Pusdokkes Polri",
  status: "Aktif",
  ttdImagePath: "/specimen-ttd.png",
};

export function parseSignerSnapshot(value: unknown): SkhpkSigner | undefined {
  let raw: unknown = value;
  if (typeof value === "string") {
    try {
      raw = JSON.parse(value);
    } catch {
      return undefined;
    }
  }
  if (!raw || typeof raw !== "object") return undefined;

  const row = raw as Record<string, unknown>;
  const nama = String(row.nama || "").trim();
  if (!nama) return undefined;

  return {
    atasNama: String(row.atasNama || SKHPK_SIGNER.atasNama),
    jabatan: String(row.jabatan || SKHPK_SIGNER.jabatan),
    nama,
    pangkat: String(row.pangkat || SKHPK_SIGNER.pangkat),
    nrp: String(row.nrp || SKHPK_SIGNER.nrp),
    jenisKelamin: String(row.jenisKelamin || SKHPK_SIGNER.jenisKelamin),
    satuan: String(row.satuan || SKHPK_SIGNER.satuan),
    status: String(row.status || SKHPK_SIGNER.status),
    ttdImagePath: String(row.ttdImagePath || SKHPK_SIGNER.ttdImagePath),
  };
}

export function signerTtdSrc(signer: Pick<SkhpkSigner, "ttdImagePath">) {
  return signer.ttdImagePath || SKHPK_SIGNER.ttdImagePath;
}

export const SKHPK_DASAR =
  "Keputusan Kepala Kepolisian Negara Republik Indonesia Nomor: Kep/297/II/2025 tanggal 13 Februari 2025 tentang Mekanisme Pemberian Izin Penggunaan, Pengawasan dan Penyimpanan Senjata Api Organik Kepolisian Negara Republik Indonesia di lingkungan Kepala Kepolisian Negara Republik Indonesia;";

const ROMAN = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
];

export function romanMonth(dateStr: string) {
  const d = new Date(dateStr);
  const month = Number.isNaN(d.getTime())
    ? new Date().getMonth()
    : d.getMonth();
  return ROMAN[month];
}

export function formatLongDateId(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Tutup nilai biodata SKHPK agar tidak dobel titik/koma. */
export function skhpkBioTutup(value: string | undefined, mark: ";" | "." | "") {
  const text = String(value || "-")
    .trim()
    .replace(/[;.,]+$/g, "");
  return mark ? `${text}${mark}` : text;
}

/** Huruf judul untuk teks KAPITAL SEMUA, biarkan data campur apa adanya. */
export function skhpkHurufSurat(value: string | undefined) {
  const raw = String(value || "").trim();
  if (!raw) return "-";
  const letters = raw.replace(/[^A-Za-z]/g, "");
  if (!letters) return raw;
  const upperRatio = (letters.match(/[A-Z]/g) || []).length / letters.length;
  if (upperRatio < 0.72) return raw;
  return raw.replace(/[A-Za-z][A-Za-z']*/g, (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}

export function formatNamaPejabatSkhpk(nama: string) {
  return String(nama || "")
    .replace(/([a-z]\.)([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatRujukanPermohonan(raw: string | undefined) {
  const text = String(raw || "").trim();
  if (!text || text === "-") return "-";
  const stripped = text.replace(/^rujukan\s+/i, "").trim();
  if (!stripped) return "-";
  if (/^surat\b/i.test(stripped) || /\bnomor\s*:/i.test(stripped)) {
    return stripped;
  }
  return `Surat Koordinator Staf Pribadi Pimpinan Polri Nomor: ${stripped} hal permohonan SKHPK dalam rangka pembuatan surat izin pinjam pakai dan membawa senjata api organik Polri.`;
}

export function pecahBulanTahun(dateStr: string) {
  const d = new Date(dateStr);
  const src = Number.isNaN(d.getTime()) ? new Date() : d;
  return {
    bulan: src.toLocaleDateString("id-ID", { month: "long" }),
    tahun: src.getFullYear(),
  };
}

export function formatShortDateId(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Nomor urut SKHPK SATRIA dimulai dari 83 (lanjutan register yang sudah terbit). */
export const SKHPK_SEQ_START = 83;

export function buildNomorSkhpk(seq: number, tanggal: string) {
  const year = new Date(tanggal).getFullYear() || new Date().getFullYear();
  return `SKHPK/ ${seq} /${romanMonth(tanggal)}/KES.15./${year}/DOKKES`;
}

export function nomorSkhpkSiap(nomor?: string) {
  const raw = String(nomor || "").trim();
  if (!raw || /draft/i.test(raw)) return undefined;
  return raw;
}

export function assignNomorSkhpkIfNeeded(
  rikkes: Rikkes,
  allRikkes: Rikkes[],
  peserta: Peserta,
) {
  const existing = nomorSkhpkSiap(rikkes.nomorSkhpk);
  if (existing) {
    return { rikkes, allRikkes, assigned: false as const };
  }

  const tanggal = rikkes.tanggalTerbit || rikkes.tanggalPemeriksaan;
  const next: Rikkes = {
    ...rikkes,
    nomorSkhpk: buildNomorSkhpk(nextSkhpkSeq(allRikkes), tanggal),
    tanggalTerbit: rikkes.tanggalTerbit || rikkes.tanggalPemeriksaan,
  };
  next.barcodeValue = buildBarcodeValue(next, peserta);

  return {
    rikkes: next,
    allRikkes: allRikkes.map((row) => (row.id === next.id ? next : row)),
    assigned: true as const,
  };
}

export function parseSkhpkSeq(nomor?: string) {
  const m = (nomor || "").match(/SKHPK\/\s*(\d+)\s*\//i);
  return m ? Number(m[1]) : 0;
}

/** Run 1, 2, 3, ... yang terbit sebelum counter digeser ke 83. */
function oneBasedRunEnd(seqs: number[]) {
  const set = new Set(seqs.filter((n) => n > 0));
  let end = 0;
  while (set.has(end + 1)) end += 1;
  return end;
}

function shiftedSkhpkSeq(seq: number, runEnd: number) {
  if (seq >= 1 && seq <= runEnd) return SKHPK_SEQ_START + seq - 1;
  return seq;
}

export function nextSkhpkSeq(rikkes: Rikkes[]) {
  const nums = rikkes.map((r) => parseSkhpkSeq(r.nomorSkhpk)).filter((n) => n > 0);
  const runEnd = oneBasedRunEnd(nums);
  const effective = nums.map((n) => shiftedSkhpkSeq(n, runEnd));
  const maxExisting = effective.length ? Math.max(...effective) : 0;
  return Math.max(maxExisting + 1, SKHPK_SEQ_START);
}

export function rebaseSkhpkNomorList(rikkes: Rikkes[]): Rikkes[] {
  const nums = rikkes.map((r) => parseSkhpkSeq(r.nomorSkhpk));
  const runEnd = oneBasedRunEnd(nums);
  if (runEnd === 0) return rikkes;

  return rikkes.map((r) => {
    const seq = parseSkhpkSeq(r.nomorSkhpk);
    if (seq < 1 || seq > runEnd) return r;

    const nomorSkhpk = buildNomorSkhpk(
      shiftedSkhpkSeq(seq, runEnd),
      r.tanggalPemeriksaan || r.tanggalTerbit || new Date().toISOString(),
    );
    const oldCompact = (r.nomorSkhpk || "").replace(/\s+/g, "");
    const newCompact = nomorSkhpk.replace(/\s+/g, "");
    return {
      ...r,
      nomorSkhpk,
      barcodeValue: r.barcodeValue
        ? r.barcodeValue.replace(oldCompact, newCompact)
        : r.barcodeValue,
    };
  });
}

export function buildBarcodeValue(rikkes: Rikkes, peserta: Peserta) {
  const nomor = (rikkes.nomorSkhpk || rikkes.id).replace(/\s+/g, "");
  return `SATRIA|${nomor}|${peserta.nrp}|${rikkes.hasil}|${rikkes.tanggalPemeriksaan}`;
}

export function memenuhiSyarat(hasil: HasilRikkes) {
  return hasil === "LAYAK";
}

export function canPrintSkhpk(rikkes: Rikkes) {
  return rikkes.hasil === "LAYAK" && Boolean(rikkes.nomorSkhpk);
}
