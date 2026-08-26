"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Peserta } from "@/lib/types";
import { SearchableSelect } from "@/components/SearchableSelect";

export function UploadMcuForm({ peserta }: { peserta: Peserta[] }) {
  const router = useRouter();

  const [pesertaId, setPesertaId] = useState("");
  const [noHp, setNoHp] = useState("");
  const [tanggalPemeriksaan, setTanggalPemeriksaan] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const pesertaOptions = useMemo(
    () =>
      peserta.map((p) => ({
        value: p.id,
        label: `${p.nama} — NRP ${p.nrp} (${p.pangkat})`,
      })),
    [peserta]
  );

  function handlePesertaChange(id: string) {
    setPesertaId(id);
    const next = peserta.find((p) => p.id === id);
    setNoHp(next?.noHp || "");
  }

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

    if (!noHp) {
      setError("No. HP wajib diisi.");
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
    form.set("noHp", noHp);
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
        <SearchableSelect
          label="Pilih Peserta"
          value={pesertaId}
          options={pesertaOptions}
          placeholder="Ketik nama atau NRP..."
          required
          full
          onChange={handlePesertaChange}
        />

        {/* =====================================
            2. NO HP
        ====================================== */}
        <div className="field">
          <label>No. HP</label>
          <input
            type="tel"
            value={noHp}
            onChange={(e) => setNoHp(e.target.value)}
            placeholder="08xxxxxxxxxx"
            required
          />
        </div>

        {/* =====================================
            3. TANGGAL PEMERIKSAAN
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
            4. FILE HASIL MCU
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