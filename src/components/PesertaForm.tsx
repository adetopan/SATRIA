"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { Peserta } from "@/lib/types";
import { isValidNrp, normalizeNrp } from "@/lib/format";
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
  nomorPermohonan: "",
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
  const [nrpError, setNrpError] = useState(() =>
    initial?.nrp && !isValidNrp(initial.nrp)
      ? "NRP harus 8 digit angka."
      : "",
  );
  const [loading, setLoading] = useState(false);

  const nrpValid8Digit = isValidNrp(form.nrp);

  function pesanNrp(value: string) {
    const nrp = normalizeNrp(value);
    if (!nrp) return "";
    if (!isValidNrp(nrp)) {
      return "NRP harus 8 digit angka.";
    }
    return "";
  }

  function set<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) {
    const nextValue =
      key === "nrp"
        ? (String(value).replace(/\D/g, "").slice(0, 8) as (typeof form)[K])
        : value;

    setForm((prev) => ({
      ...prev,
      [key]: nextValue,
    }));

    if (key === "nrp") {
      setNrpError(pesanNrp(String(nextValue)));
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    if (!isValidNrp(form.nrp)) {
      const pesan = "NRP harus 8 digit angka.";
      setNrpError(pesan);
      setError(pesan);
      return;
    }

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
          <label htmlFor="peserta-nrp">NRP</label>

          <input
            id="peserta-nrp"
            value={form.nrp}
            onChange={(e) =>
              set("nrp", e.target.value)
            }
            placeholder="8 digit, contoh 85010234"
            inputMode="numeric"
            pattern="\d{8}"
            maxLength={8}
            required
            aria-invalid={nrpError ? true : undefined}
            style={
              nrpError
                ? { borderColor: "var(--satria-danger)" }
                : undefined
            }
          />

          {nrpError ? (
            <p className="error-text" style={{ margin: "0.35rem 0 0" }}>
              {nrpError}
            </p>
          ) : null}
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
        {/* NOMOR PERMOHONAN */}
        {/* =============================== */}

        <div className="field">
          <label>Nomor Permohonan</label>

          <input
            value={form.nomorPermohonan || ""}
            onChange={(e) =>
              set("nomorPermohonan", e.target.value)
            }
            placeholder="Contoh: ISA/SSDM/082/2026"
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
          disabled={loading || !nrpValid8Digit}
        >
          {loading
            ? "Menyimpan..."
            : "Simpan Peserta"}
        </button>
      </div>
    </form>
  );
}