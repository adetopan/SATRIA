"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { IzinSenjata, Peserta, Rikkes } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { SearchableSelect } from "@/components/SearchableSelect";

type Props = {
  peserta: Peserta[];
  rikkes: Rikkes[];
  editing: IzinSenjata | null;
  onCancelEdit: () => void;
};

export function IzinForm({ peserta, rikkes, editing, onCancelEdit }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [rikkesId, setRikkesId] = useState("");
  const [nomorPermohonan, setNomorPermohonan] = useState("");
  const [jenisSenjata, setJenisSenjata] = useState("Pistol Dinas");
  const [keperluan, setKeperluan] = useState("");
  const [tanggalPengajuan, setTanggalPengajuan] = useState("");
  const [kepadaYth, setKepadaYth] = useState("");
  const [catatan, setCatatan] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const mcuOptions = useMemo(() => {
    return [...rikkes]
      .sort((a, b) =>
        (b.tanggalPemeriksaan || "").localeCompare(a.tanggalPemeriksaan || ""),
      )
      .map((r) => {
        const p = peserta.find((x) => x.id === r.pesertaId);
        return {
          value: r.id,
          label: `${p?.nama || "Peserta"} — NRP ${p?.nrp || "-"} (${p?.pangkat || "-"}) — MCU ${formatDate(r.tanggalPemeriksaan)}`,
        };
      });
  }, [rikkes, peserta]);

  useEffect(() => {
    if (!editing) return;
    const linked =
      (editing.rikkesId &&
        rikkes.find((r) => r.id === editing.rikkesId)?.id) ||
      rikkes.find((r) => r.pesertaId === editing.pesertaId)?.id ||
      "";
    setRikkesId(linked);
    setNomorPermohonan(editing.nomorPermohonan);
    setJenisSenjata(editing.jenisSenjata);
    setKeperluan(editing.keperluan);
    setTanggalPengajuan(editing.tanggalPengajuan);
    setCatatan(editing.catatan);
    const linkedRikkes = rikkes.find((r) => r.id === linked);
    setKepadaYth(
      editing.ditujukanKepada ||
        linkedRikkes?.ditujukanKepada ||
        "",
    );
    setError("");
    setSuccess("");
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [editing, rikkes]);

  function resetForm() {
    setRikkesId("");
    setNomorPermohonan("");
    setJenisSenjata("Pistol Dinas");
    setKeperluan("");
    setTanggalPengajuan("");
    setKepadaYth("");
    setCatatan("");
  }

  function handleCancelEdit() {
    resetForm();
    setError("");
    setSuccess("");
    onCancelEdit();
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const selected = rikkes.find((r) => r.id === rikkesId);
    if (!selected) {
      setError("Silakan pilih peserta berdasarkan tanggal pemeriksaan MCU.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const payload: Record<string, string> = {
      pesertaId: selected.pesertaId,
      rikkesId: selected.id,
      nomorPermohonan,
      jenisSenjata,
      keperluan,
      tanggalPengajuan,
      ditujukanKepada: kepadaYth.trim(),
      catatan,
    };
    if (!editing) payload.status = "DIAJUKAN";

    const res = await fetch(editing ? `/api/izin/${editing.id}` : "/api/izin", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Gagal menyimpan permohonan izin.");
      return;
    }

    setSuccess(
      editing
        ? "Data izin senjata berhasil diperbarui."
        : "Permohonan izin berhasil disimpan."
    );
    resetForm();
    onCancelEdit();
    router.refresh();
  }

  if (peserta.length === 0) {
    return (
      <div className="panel">
        <div className="empty">Belum ada peserta untuk pengajuan izin.</div>
      </div>
    );
  }

  if (rikkes.length === 0) {
    return (
      <div className="panel">
        <div className="empty">
          Belum ada hasil MCU. Unggah hasil pemeriksaan di Upload MCU
          terlebih dahulu agar peserta bisa dipilih sesuai tanggal pemeriksaan.
        </div>
      </div>
    );
  }

  return (
    <form className="panel" onSubmit={onSubmit} ref={formRef}>
      <div className="panel-head">
        <div>
          <h2>
            {editing ? "Edit Izin Senjata Api" : "Ajukan Izin Senjata Api"}
          </h2>
          <p>
            {editing
              ? "Ubah data pengajuan, lalu simpan kembali. Status kelayakan tidak berubah dari tombol ini."
              : "Pilih peserta sesuai tanggal pemeriksaan MCU agar pengajuan terhubung ke hasil rikkes yang tepat. Status kelayakan mengikuti keputusan Setujui / Tolak pada daftar di bawah."}
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
          value={rikkesId}
          options={mcuOptions}
          placeholder="Ketik nama, NRP, atau tanggal MCU..."
          required
          full
          onChange={(id) => {
            setRikkesId(id);
            const selected = rikkes.find((r) => r.id === id);
            if (!kepadaYth.trim() && selected?.ditujukanKepada) {
              setKepadaYth(selected.ditujukanKepada);
            }
          }}
        />
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
          <label>Kepada Yth. (cetakan SKHPK)</label>
          <input
            value={kepadaYth}
            onChange={(e) => setKepadaYth(e.target.value)}
            placeholder="Contoh: As SDM Kapolri"
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
        <button
          type="submit"
          className="btn-primary"
          style={{ width: "auto" }}
          disabled={loading}
        >
          {loading
            ? "Menyimpan..."
            : editing
              ? "Simpan Perubahan"
              : "Simpan Pengajuan"}
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
