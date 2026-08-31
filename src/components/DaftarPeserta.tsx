"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatDate } from "@/lib/format";
import type { Peserta } from "@/lib/types";

type Props = {
  peserta: Peserta[];
};

const DATA_PER_PAGE = 10;

export function DaftarPeserta({ peserta }: Props) {
  const [searchNama, setSearchNama] = useState("");
  const [searchSatuan, setSearchSatuan] = useState("");

  const [page, setPage] = useState(1);

  // =====================================================
  // DAFTAR NAMA UNIK
  // =====================================================
  const daftarNama = useMemo(() => {
    return Array.from(
      new Set(
        peserta
          .map((p) => p.nama)
          .filter(Boolean)
      )
    ).sort((a, b) =>
      a.localeCompare(b, "id")
    );
  }, [peserta]);

  // =====================================================
  // DAFTAR SATUAN UNIK
  // =====================================================
  const daftarSatuan = useMemo(() => {
    return Array.from(
      new Set(
        peserta
          .map((p) => p.satuan)
          .filter(Boolean)
      )
    ).sort((a, b) =>
      a.localeCompare(b, "id")
    );
  }, [peserta]);

  // =====================================================
  // FILTER DATA
  // =====================================================
  const filteredPeserta = useMemo(() => {
    return peserta.filter((p) => {
      const cocokNama =
        !searchNama ||
        p.nama
          ?.toLowerCase()
          .includes(searchNama.toLowerCase());

      const cocokSatuan =
        !searchSatuan ||
        p.satuan === searchSatuan;

      return cocokNama && cocokSatuan;
    });
  }, [
    peserta,
    searchNama,
    searchSatuan,
  ]);

  // =====================================================
  // JUMLAH HALAMAN
  // =====================================================
  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredPeserta.length /
        DATA_PER_PAGE
    )
  );

  // =====================================================
  // RESET PAGE KETIKA FILTER BERUBAH
  // =====================================================
  useEffect(() => {
    setPage(1);
  }, [searchNama, searchSatuan]);

  // =====================================================
  // PASTIKAN PAGE TIDAK MELEBIHI TOTAL
  // =====================================================
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  // =====================================================
  // DATA YANG DITAMPILKAN
  // =====================================================
  const paginatedPeserta = useMemo(() => {
    const start =
      (page - 1) *
      DATA_PER_PAGE;

    const end =
      start +
      DATA_PER_PAGE;

    return filteredPeserta.slice(
      start,
      end
    );
  }, [
    filteredPeserta,
    page,
  ]);

  // =====================================================
  // RANGE DATA
  // =====================================================
  const startData =
    filteredPeserta.length === 0
      ? 0
      : (page - 1) *
          DATA_PER_PAGE +
        1;

  const endData = Math.min(
    page * DATA_PER_PAGE,
    filteredPeserta.length
  );

  // =====================================================
  // RESET FILTER
  // =====================================================
  function resetFilter() {
    setSearchNama("");
    setSearchSatuan("");
    setPage(1);
  }

  // =====================================================
  // GENERATE NOMOR HALAMAN
  // =====================================================
  function getPageNumbers() {
    const pages: (
      number | string
    )[] = [];

    if (totalPages <= 7) {
      for (
        let i = 1;
        i <= totalPages;
        i++
      ) {
        pages.push(i);
      }

      return pages;
    }

    pages.push(1);

    if (page > 4) {
      pages.push("...");
    }

    const start = Math.max(
      2,
      page - 1
    );

    const end = Math.min(
      totalPages - 1,
      page + 1
    );

    for (
      let i = start;
      i <= end;
      i++
    ) {
      pages.push(i);
    }

    if (page < totalPages - 3) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  }

  return (
    <section
      className="panel"
      style={{
        marginTop: "1rem",
      }}
    >
      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="panel-head">
        <div>
          <h2>Daftar Peserta</h2>

          <p>
            Nama peserta terdaftar
            untuk proses rikkes dan
            izin senjata api.
          </p>
        </div>
      </div>

      {/* =====================================================
          FILTER
      ====================================================== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr auto",
          gap: "1rem",
          alignItems: "end",
          marginBottom: "1rem",
        }}
      >
        {/* ================================
            SEARCHABLE NAMA
        ================================= */}
        <div className="field">
          <label>
            Cari Nama Peserta
          </label>

          <input
            type="text"
            list="daftar-nama"
            value={searchNama}
            onChange={(e) =>
              setSearchNama(
                e.target.value
              )
            }
            placeholder="Ketik nama peserta..."
          />

          <datalist id="daftar-nama">
            {daftarNama.map(
              (nama) => (
                <option
                  key={nama}
                  value={nama}
                />
              )
            )}
          </datalist>
        </div>

        {/* ================================
            SEARCHABLE SATUAN
        ================================= */}
        <div className="field">
          <label>
            Cari Satuan
          </label>

          <input
            type="text"
            list="daftar-satuan"
            value={searchSatuan}
            onChange={(e) =>
              setSearchSatuan(
                e.target.value
              )
            }
            placeholder="Ketik satuan..."
          />

          <datalist id="daftar-satuan">
            {daftarSatuan.map(
              (satuan) => (
                <option
                  key={satuan}
                  value={satuan}
                />
              )
            )}
          </datalist>
        </div>

        {/* ================================
            RESET
        ================================= */}
        <button
          type="button"
          className="btn-secondary"
          onClick={resetFilter}
          style={{
            minHeight: "46px",
            whiteSpace: "nowrap",
          }}
        >
          Reset Filter
        </button>
      </div>

      {/* =====================================================
          INFORMASI JUMLAH DATA
      ====================================================== */}
      <div
        style={{
          marginBottom: "1rem",
          color:
            "var(--satria-muted)",
          fontSize: "0.9rem",
        }}
      >
        Menampilkan{" "}
        <strong>
          {startData}
        </strong>{" "}
        -{" "}
        <strong>
          {endData}
        </strong>{" "}
        dari{" "}
        <strong>
          {filteredPeserta.length}
        </strong>{" "}
        peserta
        {searchNama ||
        searchSatuan
          ? " (hasil filter)"
          : ""}
      </div>

      {/* =====================================================
          TABEL
      ====================================================== */}
      {filteredPeserta.length ===
      0 ? (
        <div className="empty">
          Data peserta tidak
          ditemukan berdasarkan
          filter yang dipilih.
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>NRP</th>
                  <th>Pangkat</th>
                  <th>Jabatan</th>
                  <th>Satuan</th>
                  <th>Alamat Kantor</th>
                  <th>Tanggal Lahir</th>
                  <th>Jenis Kelamin</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {paginatedPeserta.map(
                  (p) => (
                    <tr
                      key={p.id}
                    >
                      {/* NAMA */}
                      <td>
                        <strong>
                          {p.nama}
                        </strong>
                      </td>

                      <td>{p.nrp}</td>
                      <td>{p.pangkat || "-"}</td>
                      <td>{p.jabatan || "-"}</td>
                      <td>{p.satuan || "-"}</td>
                      <td>{p.alamatKantor || "-"}</td>
                      <td>{formatDate(p.tanggalLahir)}</td>
                      <td>
                        {p.jenisKelamin === "P"
                          ? "Perempuan"
                          : p.jenisKelamin === "L"
                            ? "Laki-laki"
                            : "-"}
                      </td>

                      {/* DETAIL */}
                      <td>
                        <Link
                          href={`/peserta/${p.id}`}
                          className="linkish"
                        >
                          Detail
                        </Link>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* =================================================
              PAGINATION
          ================================================== */}
          {totalPages > 1 ? (
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                marginTop: "1rem",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              {/* INFO */}
              <div
                style={{
                  color:
                    "var(--satria-muted)",
                  fontSize:
                    "0.85rem",
                }}
              >
                Halaman{" "}
                <strong>
                  {page}
                </strong>{" "}
                dari{" "}
                <strong>
                  {totalPages}
                </strong>
              </div>

              {/* BUTTON PAGINATION */}
              <div
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  gap:
                    "0.35rem",
                }}
              >
                {/* SEBELUMNYA */}
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={
                    page === 1
                  }
                  onClick={() =>
                    setPage(
                      (prev) =>
                        Math.max(
                          1,
                          prev - 1
                        )
                    )
                  }
                  style={{
                    width:
                      "auto",
                  }}
                >
                  ‹ Sebelumnya
                </button>

                {/* NOMOR HALAMAN */}
                {getPageNumbers().map(
                  (
                    item,
                    index
                  ) =>
                    item ===
                    "..." ? (
                      <span
                        key={`dots-${index}`}
                        style={{
                          padding:
                            "0 0.4rem",
                          color:
                            "var(--satria-muted)",
                        }}
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={
                          item
                        }
                        type="button"
                        className={
                          item ===
                          page
                            ? "btn-primary"
                            : "btn-secondary"
                        }
                        onClick={() =>
                          setPage(
                            item as number
                          )
                        }
                        style={{
                          width:
                            "40px",
                          minWidth:
                            "40px",
                          padding:
                            "0.5rem",
                        }}
                      >
                        {
                          item
                        }
                      </button>
                    )
                )}

                {/* BERIKUTNYA */}
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={
                    page ===
                    totalPages
                  }
                  onClick={() =>
                    setPage(
                      (prev) =>
                        Math.min(
                          totalPages,
                          prev + 1
                        )
                    )
                  }
                  style={{
                    width:
                      "auto",
                  }}
                >
                  Berikutnya ›
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}