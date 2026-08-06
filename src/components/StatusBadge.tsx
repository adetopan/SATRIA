import { labelHasil, labelIzin } from "@/lib/format";

const rikkesClass: Record<string, string> = {
  LAYAK: "badge-ok",
  TIDAK_LAYAK: "badge-bad",
  PENDING: "badge-wait",
};

const izinClass: Record<string, string> = {
  DISETUJUI: "badge-ok",
  DITOLAK: "badge-bad",
  DIAJUKAN: "badge-info",
  VERIFIKASI: "badge-wait",
  BELUM: "badge-muted",
};

export function RikkesBadge({ value }: { value: string }) {
  return (
    <span className={`badge ${rikkesClass[value] || "badge-muted"}`}>
      {labelHasil(value)}
    </span>
  );
}

export function IzinBadge({ value }: { value: string }) {
  return (
    <span className={`badge ${izinClass[value] || "badge-muted"}`}>
      {labelIzin(value)}
    </span>
  );
}
