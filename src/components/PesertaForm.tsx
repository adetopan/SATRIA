"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { Peserta } from "@/lib/types";
import { SearchableSelect } from "@/components/SearchableSelect";

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

// ===============================
// DAFTAR PANGKAT POLRI
// ===============================
const PANGKAT_POLRI = [
  "Jenderal Polisi",
  "Komjen Pol",
  "Irjen Pol",
  "Brigjen Pol",
  "Kombes Pol",
  "AKBP",
  "Kompol",
  "AKP",
  "Iptu",
  "Ipda",
  "Aiptu",
  "Aipda",
  "Bripka",
  "Brigpol",
  "Briptu",
  "Bripda",
  "Abrip",
  "Abriptu",
  "Abripda",
  "Bharaka",
  "Bharatu",
  "Bharada",
];

// ===============================
// DAFTAR SATUAN POLRI
// ===============================
const SATUAN_POLRI = [
  "Mabes Polri",
  "Polda",
  "Polres",
  "Polsek",
  "Brimob",
  "Propam",
  "Intelkam",
  "Reskrim",
  "Lantas",
  "Samapta",
  "Binmas",
  "Polairud",
  "Dokkes",
  "Humas",
  "SDM",
  "Logistik",
  "TIK",
  "Srena",
  "Itwasda",
  "SPN",
  "Satbrimob",
  "Ditreskrimum",
  "Ditreskrimsus",
  "Ditresnarkoba",
  "Ditlantas",
  "Ditsamapta",
  "Ditbinmas",
  "Ditpolairud",
  "Bidpropam",
  "Bidkum",
  "Bidkeu",
  "Bidhumas",
  "Bid TIK",
  "Biddokkes",
  "Biro SDM",
  "Biro Logistik",
  "Biro Rena",
];

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

  function set<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        mode === "edit" && initial
          ? `/api/peserta/${initial.id}`
          : "/api/peserta",
        {
          method: mode === "edit" ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Gagal menyimpan peserta.");
        return;
      }

      router.push(`/peserta/${data.data.id}`);
      router.refresh();
    } catch (error) {
      setLoading(false);
      setError("Terjadi kesalahan saat menyimpan data peserta.");
    }
  }

  return (
    <form className="panel" onSubmit={onSubmit}>
      {/* =============================== */}
      {/* HEADER */}
      {/* =============================== */}

      <div className="panel-head">
        <div>
          <h2>
            {mode === "edit"
              ? "Ubah Data Peserta"
              : "Tambah Peserta"}
          </h2>

          <p>
            Isi identitas peserta untuk proses rikkes dan
            izin senjata api.
          </p>
        </div>
      </div>

      {/* =============================== */}
      {/* ERROR */}
      {/* =============================== */}

      {error ? (
        <p className="error-text">
          {error}
        </p>
      ) : null}

      <div className="form-grid">

        {/* =============================== */}
        {/* NRP */}
        {/* =============================== */}

        <div className="field">
          <label>NRP</label>

          <input
            value={form.nrp}
            onChange={(e) =>
              set("nrp", e.target.value)
            }
            placeholder="Masukkan NRP"
            required
          />
        </div>

        {/* =============================== */}
        {/* NAMA */}
        {/* =============================== */}

        <div className="field">
          <label>Nama Lengkap</label>

          <input
            value={form.nama}
            onChange={(e) =>
              set("nama", e.target.value)
            }
            placeholder="Masukkan nama lengkap"
            required
          />
        </div>

        {/* =============================== */}
        {/* PANGKAT */}
        {/* =============================== */}

        <SearchableSelect
          label="Pangkat"
          value={form.pangkat}
          options={PANGKAT_POLRI}
          placeholder="Ketik pangkat untuk mencari..."
          required
          onChange={(value) => set("pangkat", value)}
        />

        {/* =============================== */}
        {/* JABATAN */}
        {/* =============================== */}

        <div className="field">
          <label>Jabatan</label>

          <input
            value={form.jabatan}
            onChange={(e) =>
              set("jabatan", e.target.value)
            }
            placeholder="Masukkan jabatan"
          />
        </div>

        {/* =============================== */}
        {/* SATUAN */}
        {/* =============================== */}

        <div className="field full">
          <SearchableSelect
            label="Satuan"
            value={form.satuan}
            options={SATUAN_POLRI}
            placeholder="Ketik nama satuan untuk mencari..."
            required
            onChange={(value) => set("satuan", value)}
          />
        </div>

        {/* =============================== */}
        {/* ALAMAT KANTOR */}
        {/* =============================== */}

        <div className="field full">
          <label>Alamat Kantor</label>

          <input
            value={form.alamatKantor || ""}
            onChange={(e) =>
              set(
                "alamatKantor",
                e.target.value
              )
            }
            placeholder="Alamat kantor untuk cetakan SKHPK"
          />
        </div>

        {/* =============================== */}
        {/* TANGGAL LAHIR */}
        {/* =============================== */}

        <div className="field">
          <label>Tanggal Lahir</label>

          <input
            type="date"
            value={form.tanggalLahir}
            onChange={(e) =>
              set(
                "tanggalLahir",
                e.target.value
              )
            }
          />
        </div>

        {/* =============================== */}
        {/* JENIS KELAMIN */}
        {/* =============================== */}

        <div className="field">
          <label>Jenis Kelamin</label>

          <select
            value={form.jenisKelamin}
            onChange={(e) =>
              set(
                "jenisKelamin",
                e.target.value as "L" | "P"
              )
            }
          >
            <option value="L">
              Laki-laki
            </option>

            <option value="P">
              Perempuan
            </option>
          </select>
        </div>

        {/* =============================== */}
        {/* KEPERLUAN */}
        {/* =============================== */}

        <div className="field">
          <label>Keperluan</label>

          <select
            value={form.keperluan}
            onChange={(e) =>
              set(
                "keperluan",
                e.target.value as Peserta["keperluan"]
              )
            }
          >
            <option value="IZIN_SENJATA">
              Izin Senjata Api
            </option>

            <option value="RIKKES_BERKALA">
              Rikkes Berkala
            </option>

            <option value="LAINNYA">
              Lainnya
            </option>
          </select>
        </div>

      </div>

      {/* =============================== */}
      {/* BUTTON */}
      {/* =============================== */}

      <div
        className="actions"
        style={{
          marginTop: "1rem",
        }}
      >
        <button
          type="submit"
          className="btn-primary"
          style={{
            width: "auto",
          }}
          disabled={loading}
        >
          {loading
            ? "Menyimpan..."
            : "Simpan Peserta"}
        </button>
      </div>
    </form>
  );
}