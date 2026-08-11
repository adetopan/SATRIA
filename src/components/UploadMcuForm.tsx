"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Peserta } from "@/lib/types";
import { labelHasil } from "@/lib/format";

export function UploadMcuForm({ peserta }: { peserta: Peserta[] }) {
  const router = useRouter();
  const [pesertaId, setPesertaId] = useState(peserta[0]?.id || "");
  const [nomorSurat, setNomorSurat] = useState("");
  const [tanggalPemeriksaan, setTanggalPemeriksaan] = useState("");
  const [rumahSakit, setRumahSakit] = useState(
    "RS Bhayangkara / MCU RS Polri",
  );
  const [dokter, setDokter] = useState("");
  const [tekananDarah, setTekananDarah] = useState("");
  const [denyutNadi, setDenyutNadi] = useState("");
  const [tinggiBadan, setTinggiBadan] = useState("");
  const [beratBadan, setBeratBadan] = useState("");
  const [visus, setVisus] = useState("");
  const [catatan, setCatatan] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const selected = useMemo(
    () => peserta.find((p) => p.id === pesertaId),
    [peserta, pesertaId],
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const form = new FormData();
    form.set("pesertaId", pesertaId);
    form.set("nomorSurat", nomorSurat);
    form.set("tanggalPemeriksaan", tanggalPemeriksaan);
    form.set("rumahSakit", rumahSakit);
    form.set("dokter", dokter);
    form.set("tekananDarah", tekananDarah);
    form.set("denyutNadi", denyutNadi);
    form.set("tinggiBadan", tinggiBadan);
    form.set("beratBadan", beratBadan);
    form.set("visus", visus);
    form.set("catatan", catatan);
    if (file) form.set("file", file);

    const res = await fetch("/api/rikkes", {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Gagal mengunggah hasil MCU.");
      return;
    }

    setSuccess(
      "Hasil MCU berhasil diunggah. Status kelayakan ditentukan di menu Izin Senjata Api.",
    );
    setNomorSurat("");
    setTanggalPemeriksaan("");
    setDokter("");
    setTekananDarah("");
    setDenyutNadi("");
    setTinggiBadan("");
    setBeratBadan("");
    setVisus("");
    setCatatan("");
    setFile(null);
    router.refresh();
  }

  if (peserta.length === 0) {
    return (
      <div className="panel">
        <div className="empty">
          Belum ada peserta. Admin perlu mendaftarkan peserta terlebih dahulu.
        </div>
      </div>
    );
  }

  return (
    <form className="panel" onSubmit={onSubmit}>
      <div className="panel-head">
        <div>
          <h2>Upload Hasil Rikkes MCU</h2>
          <p>
            Akses khusus MCU RS Polri untuk mengunggah data pemeriksaan peserta.
            Penentuan Layak / Tidak Layak dilakukan admin di menu Izin Senjata
            Api.
          </p>
        </div>
      </div>

      {error ? <p className="error-text">{error}</p> : null}
      {success ? (
        <p className="hint-box" style={{ marginTop: 0 }}>
          {success}
        </p>
      ) : null}

      <div className="form-grid">
        <div className="field full">
          <label>Pilih Peserta</label>
          <select
            value={pesertaId}
            onChange={(e) => setPesertaId(e.target.value)}
            required
          >
            {peserta.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama} — NRP {p.nrp} ({p.pangkat})
              </option>
            ))}
          </select>
          {selected ? (
            <small style={{ color: "var(--satria-muted)" }}>
              Satuan: {selected.satuan} · Status kelayakan saat ini:{" "}
              {labelHasil(selected.statusRikkes)}
            </small>
          ) : null}
        </div>

        <div className="field">
          <label>Nomor Surat MCU</label>
          <input
            value={nomorSurat}
            onChange={(e) => setNomorSurat(e.target.value)}
            placeholder="MCU/RS.POLRI/..."
            required
          />
        </div>
        <div className="field">
          <label>Tanggal Pemeriksaan</label>
          <input
            type="date"
            value={tanggalPemeriksaan}
            onChange={(e) => setTanggalPemeriksaan(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label>Rumah Sakit / Unit MCU</label>
          <input
            value={rumahSakit}
            onChange={(e) => setRumahSakit(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label>Dokter Pemeriksa</label>
          <input
            value={dokter}
            onChange={(e) => setDokter(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label>Tekanan Darah</label>
          <input
            value={tekananDarah}
            onChange={(e) => setTekananDarah(e.target.value)}
            placeholder="120/80"
          />
        </div>
        <div className="field">
          <label>Denyut Nadi</label>
          <input
            value={denyutNadi}
            onChange={(e) => setDenyutNadi(e.target.value)}
            placeholder="78"
          />
        </div>
        <div className="field">
          <label>Tinggi Badan (cm)</label>
          <input
            value={tinggiBadan}
            onChange={(e) => setTinggiBadan(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Berat Badan (kg)</label>
          <input
            value={beratBadan}
            onChange={(e) => setBeratBadan(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Visus</label>
          <input
            value={visus}
            onChange={(e) => setVisus(e.target.value)}
            placeholder="6/6"
          />
        </div>
        <div className="field full">
          <label>Catatan Medis</label>
          <textarea
            rows={3}
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
          />
        </div>
        <div className="field full">
          <label>Berkas Hasil MCU (PDF/JPG/PNG)</label>
          <input
            type="file"
            accept=".pdf,image/jpeg,image/png,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>
      </div>

      <div className="actions" style={{ marginTop: "1rem" }}>
        <button className="btn-primary" style={{ width: "auto" }} disabled={loading}>
          {loading ? "Mengunggah..." : "Unggah ke SATRIA"}
        </button>
      </div>
    </form>
  );
}
