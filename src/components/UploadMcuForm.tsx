"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Peserta, Rikkes } from "@/lib/types";
import { SearchableSelect } from "@/components/SearchableSelect";
import {
  duplicateMcuDateMessage,
  findDuplicateMcuDate,
} from "@/lib/format";

type Props = {
  peserta: Peserta[];
  rikkes: Rikkes[];
  editing: Rikkes | null;
  onCancelEdit: () => void;
};

export function UploadMcuForm({
  peserta,
  rikkes,
  editing,
  onCancelEdit,
}: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

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

  const duplicateTanggal = useMemo(
    () =>
      findDuplicateMcuDate(
        rikkes,
        pesertaId,
        tanggalPemeriksaan,
        editing?.id,
      ),
    [rikkes, pesertaId, tanggalPemeriksaan, editing?.id],
  );

  useEffect(() => {
    if (!editing) return;
    const next = peserta.find((p) => p.id === editing.pesertaId);
    setPesertaId(editing.pesertaId);
    setNoHp(next?.noHp || "");
    setTanggalPemeriksaan(editing.tanggalPemeriksaan);
    setFile(null);
    setError("");
    setSuccess("");
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [editing, peserta]);

  function resetForm() {
    setPesertaId("");
    setNoHp("");
    setTanggalPemeriksaan("");
    setFile(null);
  }

  function handlePesertaChange(id: string) {
    setPesertaId(id);
    const next = peserta.find((p) => p.id === id);
    setNoHp(next?.noHp || "");
  }

  function handleCancelEdit() {
    resetForm();
    setError("");
    setSuccess("");
    onCancelEdit();
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

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

    if (!tanggalPemeriksaan) {
      setError("Tanggal pemeriksaan wajib diisi.");
      setLoading(false);
      return;
    }

    if (findDuplicateMcuDate(rikkes, pesertaId, tanggalPemeriksaan, editing?.id)) {
      setError(duplicateMcuDateMessage(tanggalPemeriksaan));
      setLoading(false);
      return;
    }

    if (!editing && !file) {
      setError("Berkas hasil MCU wajib dipilih.");
      setLoading(false);
      return;
    }

    const form = new FormData();
    form.set("pesertaId", pesertaId);
    form.set("tanggalPemeriksaan", tanggalPemeriksaan);
    form.set("noHp", noHp);
    if (file) form.set("file", file);

    try {
      const res = await fetch(
        editing ? `/api/rikkes/${editing.id}` : "/api/rikkes",
        {
          method: editing ? "PUT" : "POST",
          body: form,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal menyimpan hasil MCU.");
        return;
      }

      setSuccess(
        editing
          ? "Data MCU berhasil diperbarui."
          : "Hasil rikkes berhasil diunggah ke SATRIA."
      );
      resetForm();
      onCancelEdit();
      router.refresh();
    } catch {
      setError("Terjadi kesalahan saat menyimpan hasil MCU.");
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
    <form className="panel" onSubmit={onSubmit} ref={formRef}>
      <div className="panel-head">
        <div>
          <h2>
            {editing ? "Edit Hasil Rikkes MCU" : "Upload Hasil Rikkes MCU"}
          </h2>
          <p>
            {editing
              ? "Ubah data pemeriksaan, lalu simpan kembali. Berkas cukup diisi jika ingin diganti."
              : "Akses khusus MCU RS Polri untuk mengunggah hasil pemeriksaan peserta ke aplikasi SATRIA."}
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
        <SearchableSelect
          label="Pilih Peserta"
          value={pesertaId}
          options={pesertaOptions}
          placeholder="Ketik nama atau NRP..."
          required
          full
          onChange={handlePesertaChange}
        />

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

        <div className="field">
          <label>Tanggal Pemeriksaan</label>
          <input
            type="date"
            value={tanggalPemeriksaan}
            onChange={(e) => setTanggalPemeriksaan(e.target.value)}
            required
            aria-invalid={Boolean(duplicateTanggal)}
          />
          {duplicateTanggal ? (
            <small className="error-text" style={{ display: "block" }}>
              {duplicateMcuDateMessage(tanggalPemeriksaan)}
            </small>
          ) : null}
        </div>

        <div className="field full">
          <label>
            {editing
              ? "Berkas Hasil MCU (kosongkan jika tidak diganti)"
              : "Berkas Hasil MCU (PDF/JPG/PNG)"}
          </label>
          <input
            key={editing?.id || "create"}
            type="file"
            accept=".pdf,image/jpeg,image/png,image/webp"
            required={!editing}
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
            }}
          />
          {file ? (
            <small style={{ color: "var(--satria-muted)" }}>
              File dipilih: {file.name}
            </small>
          ) : editing?.fileName ? (
            <small style={{ color: "var(--satria-muted)" }}>
              Berkas saat ini: {editing.fileName}
            </small>
          ) : null}
        </div>
      </div>

      <div className="actions" style={{ marginTop: "1rem" }}>
        <button
          type="submit"
          className="btn-primary"
          style={{ width: "auto" }}
          disabled={loading || Boolean(duplicateTanggal)}
        >
          {loading
            ? "Menyimpan..."
            : editing
              ? "Simpan Perubahan"
              : "Unggah ke SATRIA"}
        </button>
        {editing ? (
          <button
            type="button"
            className="btn-secondary"
            style={{ width: "auto" }}
            onClick={handleCancelEdit}
            disabled={loading}
          >
            Batal
          </button>
        ) : null}
      </div>
    </form>
  );
}
