"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function SkhpkFileUpload({
  izinId,
  fileName,
  filePath,
}: {
  izinId: string;
  fileName?: string;
  filePath?: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setLoading(true);
    try {
      const body = new FormData();
      body.set("file", file);
      const res = await fetch(`/api/izin/${izinId}/skhpk-file`, {
        method: "POST",
        body,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "Gagal mengunggah file SKHPK.");
        return;
      }
      router.refresh();
    } catch {
      alert("Terjadi kesalahan saat mengunggah file SKHPK.");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div style={{ minWidth: 140 }}>
      {filePath ? (
        <a
          href={`/skhpk-berkas/${izinId}`}
          target="_blank"
          rel="noreferrer"
          className="linkish"
        >
          {fileName || "Lihat file SKHPK"}
        </a>
      ) : (
        <div style={{ color: "var(--satria-muted)", fontSize: "0.85rem" }}>
          Belum ada file
        </div>
      )}
      <div style={{ marginTop: "0.4rem" }}>
        <button
          type="button"
          className="btn-secondary"
          style={{ width: "auto", whiteSpace: "nowrap" }}
          disabled={loading}
          onClick={() => inputRef.current?.click()}
        >
          {loading ? "Mengunggah..." : filePath ? "Ganti File" : "Unggah SKHPK"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,image/jpeg,image/png,image/webp"
          hidden
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}
