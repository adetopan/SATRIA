"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function IzinStatusActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function update(next: string) {
    setLoading(true);
    await fetch(`/api/izin/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setLoading(false);
    router.refresh();
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
