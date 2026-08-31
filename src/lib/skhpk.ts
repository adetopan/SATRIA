import type { HasilRikkes, Peserta, Rikkes, SkhpkSigner } from "./types";

export const SKHPK_SIGNER = {
  atasNama: "a.n. KEPALA PUSAT KEDOKTERAN DAN KESEHATAN POLRI",
  jabatan: "KAROKESPOL",
  nama: "Dr. dr.MOHAMMAD KHUSNAN MARZUKI, M.M., M.H.",
  pangkat: "BRIGADIR JENDRAL",
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
  "Keputusan Kapolri Nomor: Kep/1133/VI/2018 tanggal 12 Juni 2018 tentang Mekanisme Pemberian, Pengawasan dan Penyimpanan Senjata Api Organik Kepolisian Negara Republik Indonesia kepada Pejabat Polri;";

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

export function formatShortDateId(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function buildNomorSkhpk(seq: number, tanggal: string) {
  const year = new Date(tanggal).getFullYear() || new Date().getFullYear();
  return `SKHPK/ ${seq} /${romanMonth(tanggal)}/KES.15./${year}/DOKKES`;
}

export function nextSkhpkSeq(rikkes: Rikkes[]) {
  const nums = rikkes
    .map((r) => {
      const m = (r.nomorSkhpk || "").match(/SKHPK\/\s*(\d+)\s*\//i);
      return m ? Number(m[1]) : 0;
    })
    .filter((n) => n > 0);
  return (nums.length ? Math.max(...nums) : 0) + 1;
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
