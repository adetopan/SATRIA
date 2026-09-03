export function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}

export function examDay(value?: string) {
  return (value || "").slice(0, 10);
}

export function findDuplicateMcuDate<
  T extends { id: string; pesertaId: string; tanggalPemeriksaan: string },
>(
  list: T[],
  pesertaId: string,
  tanggalPemeriksaan: string,
  excludeId?: string,
) {
  const day = examDay(tanggalPemeriksaan);
  if (!pesertaId || !day) return undefined;

  return list.find(
    (item) =>
      item.id !== excludeId &&
      item.pesertaId === pesertaId &&
      examDay(item.tanggalPemeriksaan) === day,
  );
}

export function duplicateMcuDateMessage(tanggalPemeriksaan: string) {
  return `Peserta ini sudah memiliki hasil MCU pada ${formatDate(tanggalPemeriksaan)}. Tidak dapat menginput tanggal pemeriksaan yang sama.`;
}

export function normalizeNrp(nrp: string) {
  return nrp.replace(/\s+/g, "").trim();
}

export function isValidNrp(nrp: string) {
  return /^\d{8}$/.test(normalizeNrp(nrp));
}

export function labelKeperluan(value: string) {
  switch (value) {
    case "IZIN_SENJATA":
      return "Izin Senjata Api";
    case "RIKKES_BERKALA":
      return "Rikkes Berkala";
    default:
      return "Lainnya";
  }
}

export function labelHasil(value: string) {
  switch (value) {
    case "LAYAK":
      return "Layak";
    case "TIDAK_LAYAK":
      return "Tidak Layak";
    default:
      return "Menunggu";
  }
}

export function labelIzin(value: string) {
  switch (value) {
    case "DIAJUKAN":
      return "Diajukan";
    case "VERIFIKASI":
      return "Verifikasi";
    case "DISETUJUI":
      return "Disetujui";
    case "DITOLAK":
      return "Ditolak";
    case "BELUM":
      return "Belum";
    default:
      return value;
  }
}
