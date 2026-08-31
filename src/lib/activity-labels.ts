type PesertaLabel = {
  nama?: string | null;
  nrp?: string | null;
} | null;

export function pesertaActivityLabel(peserta?: PesertaLabel) {
  if (!peserta) return "Peserta tidak diketahui";
  const nama = peserta.nama?.trim() || "Tanpa nama";
  const nrp = peserta.nrp?.trim();
  return nrp ? `${nama} · NRP ${nrp}` : nama;
}
