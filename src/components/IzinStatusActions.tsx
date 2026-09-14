"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ToastProvider";

export function IzinStatusActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const { notify } = useToast();
  const [loading, setLoading] = useState(false);

  async function update(next: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/izin/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        notify("error", data.error || "Gagal mengubah status izin.");
        return;
      }
      notify(
        "success",
        next === "DISETUJUI"
          ? "Izin senjata berhasil disetujui."
          : next === "DITOLAK"
            ? "Izin senjata berhasil ditolak."
            : "Izin senjata berhasil diverifikasi.",
      );
      router.refresh();
    } catch {
      notify("error", "Terjadi kesalahan saat mengubah status izin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="actions">
      {status !== "VERIFIKASI" ? (
        <button
          type="button"
          className="btn-secondary"
          disabled={loading}
          onClick={() => update("VERIFIKASI")}
        >
          Verifikasi
        </button>
      ) : null}
      {status !== "DISETUJUI" ? (
        <button
          type="button"
          className="btn-primary"
          style={{ width: "auto" }}
          disabled={loading}
          onClick={() => update("DISETUJUI")}
        >
          Setujui
        </button>
      ) : null}
      {status !== "DITOLAK" ? (
        <button
          type="button"
          className="btn-danger"
          disabled={loading}
          onClick={() => update("DITOLAK")}
        >
          Tolak
        </button>
      ) : null}
    </div>
  );
}
