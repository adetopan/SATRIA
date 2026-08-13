"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Peserta } from "@/lib/types";

export function UploadMcuForm({ peserta }: { peserta: Peserta[] }) {
  const router = useRouter();

  const [pesertaId, setPesertaId] = useState(
    peserta[0]?.id || ""
  );

  const [tanggalPemeriksaan, setTanggalPemeriksaan] = useState("");

  const [file, setFile] = useState<File | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const selected = useMemo(
    () => peserta.find((p) => p.id === pesertaId),
    [peserta, pesertaId]
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    // Validasi peserta
    if (!pesertaId) {
      setError("Silakan pilih peserta.");
      setLoading(false);
      return;
    }

    // Validasi tanggal
    if (!tanggalPemeriksaan) {
      setError("Tanggal pemeriksaan wajib diisi.");
      setLoading(false);
      return;
    }

    // Validasi file
    if (!file) {
      setError("Berkas hasil MCU wajib dipilih.");
      setLoading(false);
      return;
    }

    const form = new FormData();

    // Hanya data dari form yang dikirim
    form.set("pesertaId", pesertaId);
    form.set("tanggalPemeriksaan", tanggalPemeriksaan);
    form.set("file", file);

    try {
      const res = await fetch("/api/rikkes", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error || "Gagal mengunggah hasil MCU."
        );
        return;
      }

      setSuccess(
        "Hasil rikkes berhasil diunggah ke SATRIA."
      );

      // Reset tanggal
      setTanggalPemeriksaan("");

      // Reset file
      setFile(null);

      // Refresh halaman
      router.refresh();

    } catch (error) {
      setError(
        "Terjadi kesalahan saat mengunggah hasil MCU."
      );
    } finally {
      setLoading(false);
    }
  }

  if (peserta.length === 0) {
    return (
      <div className="panel">
        <div className="empty">
          Belum ada peserta. Admin perlu mendaftarkan
          peserta terlebih dahulu.
        </div>
      </div>
    );
  }

  return (
    <form
      className="panel"
      onSubmit={onSubmit}
    >

      {/* HEADER */}
      <div className="panel-head">
        <div>
          <h2>Upload Hasil Rikkes MCU</h2>

          <p>
            Akses khusus MCU RS Polri untuk mengunggah
            hasil pemeriksaan peserta ke aplikasi SATRIA.
          </p>
        </div>
      </div>

      {/* ERROR */}
      {error ? (
        <p className="error-text">
          {error}
        </p>
      ) : null}

      {/* SUCCESS */}
      {success ? (
        <p
          className="hint-box"
          style={{ marginTop: 0 }}
        >
          {success}
        </p>
      ) : null}

      <div className="form-grid">

        {/* =====================================
            1. PILIH PESERTA
        ====================================== */}
        <div className="field full">

          <label>Pilih Peserta</label>

          <select
            value={pesertaId}
            onChange={(e) =>
              setPesertaId(e.target.value)
            }
            required
          >

            {peserta.map((p) => (
              <option
                key={p.id}
                value={p.id}
              >
                {p.nama} — NRP {p.nrp} ({p.pangkat})
              </option>
            ))}

          </select>
{/* 
          {selected ? (
            <small
              style={{
                color: "var(--satria-muted)",
              }}
            >
              Satuan: {selected.satuan}
              {" · "}
              Status rikkes saat ini:{" "}
              {selected.statusRikkes}
            </small>
          ) : null} */}

        </div>

        {/* =====================================
            2. TANGGAL PEMERIKSAAN
        ====================================== */}
        <div className="field">

          <label>
            Tanggal Pemeriksaan
          </label>

          <input
            type="date"
            value={tanggalPemeriksaan}
            onChange={(e) =>
              setTanggalPemeriksaan(
                e.target.value
              )
            }
            required
          />

        </div>

        {/* =====================================
            3. FILE HASIL MCU
        ====================================== */}
        <div className="field full">

          <label>
            Berkas Hasil MCU (PDF/JPG/PNG)
          </label>

          <input
            type="file"
            accept=".pdf,image/jpeg,image/png,image/webp"
            onChange={(e) => {
              setFile(
                e.target.files?.[0] || null
              );
            }}
            required
          />

          {file ? (
            <small
              style={{
                color: "var(--satria-muted)",
              }}
            >
              File dipilih: {file.name}
            </small>
          ) : null}

        </div>

      </div>

      {/* BUTTON */}
      <div
        className="actions"
        style={{ marginTop: "1rem" }}
      >

        <button
          type="submit"
          className="btn-primary"
          style={{ width: "auto" }}
          disabled={loading}
        >
          {loading
            ? "Mengunggah..."
            : "Unggah ke SATRIA"}
        </button>

      </div>

    </form>
  );
}