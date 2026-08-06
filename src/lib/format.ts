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
