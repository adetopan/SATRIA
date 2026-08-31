"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signerTtdSrc } from "@/lib/skhpk";
import type { SkhpkSigner } from "@/lib/types";

type Props = {
  initial: SkhpkSigner;
};

export function PengaturanSkhpkForm({ initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [ttdFile, setTtdFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function set<K extends keyof SkhpkSigner>(key: K, value: SkhpkSigner[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const previewSrc = useMemo(() => {
    if (ttdFile) return URL.createObjectURL(ttdFile);
    return signerTtdSrc(form);
  }, [ttdFile, form]);

  useEffect(() => {
    if (!ttdFile) return;
    return () => URL.revokeObjectURL(previewSrc);
  }, [ttdFile, previewSrc]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const body = new FormData();
      body.append("atasNama", form.atasNama);
      body.append("jabatan", form.jabatan);
      body.append("nama", form.nama);
      body.append("pangkat", form.pangkat);
      body.append("nrp", form.nrp);
      body.append("jenisKelamin", form.jenisKelamin);
      body.append("satuan", form.satuan);
      body.append("status", form.status);
      if (ttdFile) body.append("ttdImage", ttdFile);

      const res = await fetch("/api/pengaturan/skhpk", {
        method: "PUT",
        body,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menyimpan pengaturan cetakan SKHPK.");
        return;
      }
      setForm(data.data);
      setTtdFile(null);
      setSuccess("Pengaturan cetakan SKHPK berhasil disimpan.");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan saat menyimpan pengaturan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="panel" onSubmit={onSubmit}>
      <div className="panel-head">
        <div>
          <h2>Pengaturan Cetakan SKHPK</h2>
          <p>
            Atur nama pejabat pada cetakan SKHPK dan data halaman specimen
            tanda tangan setelah QR code dipindai. Perubahan hanya berlaku
            untuk SKHPK yang belum dikirim via WhatsApp. Surat yang sudah
            dikirim tetap memakai data pejabat dan tanda tangan pada saat
            pengiriman.
          </p>
        </div>
      </div>

      {error ? <p className="error-text">{error}</p> : null}
      {success ? (
        <p className="hint-box" style={{ marginTop: 0 }}>
          {success}
        </p>
      ) : null}

      <h3 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>
        Cetakan SKHPK
      </h3>
      <div className="form-grid">
        <div className="field full">
          <label>Nama (setelah QR code)</label>
          <input
            value={form.nama}
            onChange={(e) => set("nama", e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label>Pangkat</label>
          <input
            value={form.pangkat}
            onChange={(e) => set("pangkat", e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label>Jabatan</label>
          <input
            value={form.jabatan}
            onChange={(e) => set("jabatan", e.target.value)}
            required
          />
        </div>
        <div className="field full">
          <label>a.n. (baris atas tanda tangan)</label>
          <input
            value={form.atasNama}
            onChange={(e) => set("atasNama", e.target.value)}
          />
        </div>
      </div>

      <h3 style={{ margin: "1.4rem 0 0.75rem", fontSize: "1rem" }}>
        Halaman QR / specimen tanda tangan
      </h3>
      <div className="form-grid">
        <div className="field">
          <label>NRP</label>
          <input
            value={form.nrp}
            onChange={(e) => set("nrp", e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label>Jenis Kelamin</label>
          <select
            value={form.jenisKelamin}
            onChange={(e) => set("jenisKelamin", e.target.value)}
          >
            <option value="LAKI-LAKI">LAKI-LAKI</option>
            <option value="PEREMPUAN">PEREMPUAN</option>
          </select>
        </div>
        <div className="field">
          <label>Satuan</label>
          <input
            value={form.satuan}
            onChange={(e) => set("satuan", e.target.value)}
            placeholder="Contoh: Pusdokkes Polri"
            required
          />
        </div>
        <div className="field">
          <label>Status Pegawai</label>
          <input
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
          />
        </div>
        <div className="field full">
          <label>Tanda tangan</label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
            onChange={(e) => setTtdFile(e.target.files?.[0] || null)}
          />
          <small style={{ color: "var(--satria-muted)" }}>
            {ttdFile
              ? `File dipilih: ${ttdFile.name}`
              : "Kosongkan jika tidak diganti. Format JPG, PNG, atau WEBP, maksimal 4 MB."}
          </small>
          {previewSrc ? (
            <div className="ttd-preview-box">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewSrc}
                alt="Pratinjau tanda tangan"
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="actions" style={{ marginTop: "1rem" }}>
        <button
          type="submit"
          className="btn-primary"
          style={{ width: "auto" }}
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Simpan Pengaturan"}
        </button>
      </div>
    </form>
  );
}
