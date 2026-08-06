"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { Peserta } from "@/lib/types";

const empty = {
  nrp: "",
  nama: "",
  pangkat: "",
  satuan: "",
  jabatan: "",
  alamatKantor: "",
  tanggalLahir: "",
  jenisKelamin: "L",
  noHp: "",
  keperluan: "IZIN_SENJATA",
};

export function PesertaForm({
  initial,
  mode = "create",
}: {
  initial?: Peserta;
  mode?: "create" | "edit";
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial || empty);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(
      mode === "edit" && initial ? `/api/peserta/${initial.id}` : "/api/peserta",
      {
        method: mode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      },
    );

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Gagal menyimpan peserta.");
      return;
    }

    router.push(`/peserta/${data.data.id}`);
    router.refresh();
  }

  return (
    <form className="panel" onSubmit={onSubmit}>
      <div className="panel-head">
        <div>
          <h2>{mode === "edit" ? "Ubah Data Peserta" : "Tambah Peserta"}</h2>
          <p>Isi identitas peserta untuk proses rikkes dan izin senjata api.</p>
        </div>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

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
          <label>Nama Lengkap</label>
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
          />
        </div>
        <div className="field">
          <label>Jabatan</label>
          <input
            value={form.jabatan}
            onChange={(e) => set("jabatan", e.target.value)}
          />
        </div>
        <div className="field full">
          <label>Satuan</label>
          <input
            value={form.satuan}
            onChange={(e) => set("satuan", e.target.value)}
          />
        </div>
        <div className="field full">
          <label>Alamat Kantor</label>
          <input
            value={form.alamatKantor || ""}
            onChange={(e) => set("alamatKantor", e.target.value)}
            placeholder="Alamat kantor untuk cetakan SKHPK"
          />
        </div>
        <div className="field">
          <label>Tanggal Lahir</label>
          <input
            type="date"
            value={form.tanggalLahir}
            onChange={(e) => set("tanggalLahir", e.target.value)}
          />
        </div>
        <div className="field">
          <label>Jenis Kelamin</label>
          <select
            value={form.jenisKelamin}
            onChange={(e) => set("jenisKelamin", e.target.value as "L" | "P")}
          >
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>
        </div>
        <div className="field">
          <label>No. HP</label>
          <input
            value={form.noHp}
            onChange={(e) => set("noHp", e.target.value)}
          />
        </div>
        <div className="field">
          <label>Keperluan</label>
          <select
            value={form.keperluan}
            onChange={(e) =>
              set("keperluan", e.target.value as Peserta["keperluan"])
            }
          >
            <option value="IZIN_SENJATA">Izin Senjata Api</option>
            <option value="RIKKES_BERKALA">Rikkes Berkala</option>
            <option value="LAINNYA">Lainnya</option>
          </select>
        </div>
      </div>

      <div className="actions" style={{ marginTop: "1rem" }}>
        <button className="btn-primary" style={{ width: "auto" }} disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan Peserta"}
        </button>
      </div>
    </form>
  );
}
