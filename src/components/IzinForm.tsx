"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { Peserta } from "@/lib/types";
import { labelHasil } from "@/lib/format";

export function IzinForm({ peserta }: { peserta: Peserta[] }) {
  const router = useRouter();
  const [pesertaId, setPesertaId] = useState(peserta[0]?.id || "");
  const [nomorPermohonan, setNomorPermohonan] = useState("");
  const [jenisSenjata, setJenisSenjata] = useState("Pistol Dinas");
  const [keperluan, setKeperluan] = useState("");
  const [tanggalPengajuan, setTanggalPengajuan] = useState("");
  const [catatan, setCatatan] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/izin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pesertaId,
        nomorPermohonan,
        jenisSenjata,
        keperluan,
        tanggalPengajuan,
        catatan,
        status: "DIAJUKAN",
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Gagal membuat permohonan izin.");
      return;
    }

    setNomorPermohonan("");
    setKeperluan("");
    setTanggalPengajuan("");
    setCatatan("");
    router.refresh();
  }

  if (peserta.length === 0) {
    return (
      <div className="panel">
        <div className="empty">Belum ada peserta untuk pengajuan izin.</div>
      </div>
    );
  }

  return (
    <form className="panel" onSubmit={onSubmit}>
      <div className="panel-head">
        <div>
          <h2>Ajukan Izin Senjata Api</h2>
          <p>
            Pengajuan terhubung dengan data peserta dan hasil MCU. Status
            kelayakan mengikuti keputusan Setujui / Tolak pada daftar di bawah.
          </p>
        </div>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="form-grid">
        <div className="field full">
          <label>Peserta</label>
          <select
            value={pesertaId}
            onChange={(e) => setPesertaId(e.target.value)}
            required
          >
            {peserta.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Nomor Permohonan</label>
          <input
            value={nomorPermohonan}
            onChange={(e) => setNomorPermohonan(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label>Jenis Senjata</label>
          <input
            value={jenisSenjata}
            onChange={(e) => setJenisSenjata(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label>Tanggal Pengajuan</label>
          <input
            type="date"
            value={tanggalPengajuan}
            onChange={(e) => setTanggalPengajuan(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label>Keperluan</label>
          <input
            value={keperluan}
            onChange={(e) => setKeperluan(e.target.value)}
            required
          />
        </div>
        <div className="field full">
          <label>Catatan</label>
          <textarea
            rows={3}
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
          />
        </div>
      </div>

      <div className="actions" style={{ marginTop: "1rem" }}>
        <button className="btn-primary" style={{ width: "auto" }} disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan Pengajuan"}
        </button>
      </div>
    </form>
  );
}
