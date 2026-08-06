import type { HasilRikkes, Peserta, Rikkes } from "./types";

export const SKHPK_SIGNER = {
  atasNama: "a.n. KEPALA PUSAT KEDOKTERAN DAN KESEHATAN POLRI",
  jabatan: "KAROKESPOL",
  nama: "Dr. dr. IG GEDE M. ANDIKA, Sp.Rad.",
  pangkat: "BRIGADIR JENDERAL POLISI",
};

export const SKHPK_DASAR =
  "Keputusan Kapolri Nomor: Kep/1133/VI/2018 tanggal 12 Juni 2018 tentang Mekanisme Pemberian, Pengawasan dan Penyimpanan Senjata Api Organik Kepolisian Negara Republik Indonesia kepada Pejabat Polri, maka yang bertanda tangan di bawah ini menerangkan bahwa:";

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
