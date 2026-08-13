"use client";

import { useMemo, useState, useEffect } from "react";
import { formatDate } from "@/lib/format";
import type { Peserta, Rikkes } from "@/lib/types";

type Props = {
  peserta: Peserta[];
  rikkes: Rikkes[];
};

export function RiwayatUploadMcu({
  peserta,
  rikkes,
}: Props) {
  // ==========================================
  // STATE FILTER
  // ==========================================
  const [searchPeserta, setSearchPeserta] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [hasil, setHasil] = useState("");

  // ==========================================
  // STATE PAGINATION
  // ==========================================
  const [currentPage, setCurrentPage] = useState(1);

  // Jumlah data per halaman
  const itemsPerPage = 10;

  // ==========================================
  // FILTER DATA
  // ==========================================
  const filteredRikkes = useMemo(() => {
    return rikkes.filter((r) => {
      const p = peserta.find(
        (x) => x.id === r.pesertaId
      );

      // ========================================
      // FILTER PESERTA
      // Nama atau NRP
      // ========================================
      const keyword = searchPeserta
        .toLowerCase()
        .trim();

      const cocokPeserta =
        !keyword ||
        p?.nama
          ?.toLowerCase()
          .includes(keyword) ||
        p?.nrp
          ?.toLowerCase()
          .includes(keyword);

      // ========================================
      // FILTER TANGGAL
      // ========================================
      const cocokTanggal =
        !tanggal ||
        r.tanggalPemeriksaan === tanggal;

      // ========================================
      // FILTER HASIL
      // ========================================
      const cocokHasil =
        !hasil ||
        r.hasil === hasil;

      return (
        cocokPeserta &&
        cocokTanggal &&
        cocokHasil
      );
    });
  }, [
    rikkes,
    peserta,
    searchPeserta,
    tanggal,
    hasil,
  ]);

  // ==========================================
  // JUMLAH HALAMAN
  // ==========================================
  const totalPages = Math.ceil(
    filteredRikkes.length / itemsPerPage
  );

  // ==========================================
  // DATA YANG DITAMPILKAN PADA HALAMAN AKTIF
  // ==========================================
  const paginatedRikkes = useMemo(() => {
    const startIndex =
      (currentPage - 1) * itemsPerPage;

    const endIndex =
      startIndex + itemsPerPage;

    return filteredRikkes.slice(
      startIndex,
      endIndex
    );
  }, [
    filteredRikkes,
    currentPage,
  ]);

  // ==========================================
  // KEMBALI KE HALAMAN 1 SAAT FILTER BERUBAH
  // ==========================================
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchPeserta,
    tanggal,
    hasil,
  ]);

  // ==========================================
  // RESET FILTER
  // ==========================================
  function resetFilter() {
    setSearchPeserta("");
    setTanggal("");
    setHasil("");
    setCurrentPage(1);
  }

  // ==========================================
  // HALAMAN SEBELUMNYA
  // ==========================================
  function previousPage() {
    if (currentPage > 1) {
      setCurrentPage(
        currentPage - 1
      );
    }
  }

  // ==========================================
  // HALAMAN BERIKUTNYA
  // ==========================================
  function nextPage() {
    if (
      currentPage < totalPages
    ) {
      setCurrentPage(
        currentPage + 1
      );
    }
  }

  // ==========================================
  // PINDAH KE HALAMAN TERTENTU
  // ==========================================
  function goToPage(page: number) {
    setCurrentPage(page);
  }

  return (
    <section
      className="panel"
      style={{
        marginTop: "1rem",
      }}
    >

      {/* ======================================
          HEADER
      ======================================= */}
      <div className="panel-head">
        <div>
          <h2>Riwayat Upload MCU</h2>

          <p>
            Semua hasil rikkes yang sudah masuk
            ke SATRIA.
          </p>
        </div>
      </div>


      {/* ======================================
          FILTER
          1 BARIS
      ======================================= */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "2fr 1.5fr 1.5fr 1fr",
          gap: "1rem",
          alignItems: "end",
          marginBottom: "1rem",
        }}
      >

        {/* ==================================
            CARI PESERTA
        =================================== */}
        <div className="field">
          <label>
            Cari Peserta
          </label>

          <input
            type="text"
            value={searchPeserta}
            onChange={(e) =>
              setSearchPeserta(
                e.target.value
              )
            }
            placeholder="Nama atau NRP..."
          />
        </div>


        {/* ==================================
            TANGGAL PEMERIKSAAN
        =================================== */}
        <div className="field">
          <label>
            Tanggal Pemeriksaan
          </label>

          <input
            type="date"
            value={tanggal}
            onChange={(e) =>
              setTanggal(
                e.target.value
              )
            }
          />
        </div>


        {/* ==================================
            HASIL RIKKES
        =================================== */}
        <div className="field">
          <label>
            Hasil Rikkes
          </label>

          <select
            value={hasil}
            onChange={(e) =>
              setHasil(
                e.target.value
              )
            }
          >
            <option value="">
              Semua Hasil
            </option>

            <option value="LAYAK">
              Layak
            </option>

            <option value="TIDAK_LAYAK">
              Tidak Layak
            </option>

            <option value="PENDING">
              Menunggu
            </option>
          </select>
        </div>


        {/* ==================================
            RESET FILTER
        =================================== */}
        <div className="field">

          <button
            type="button"
            className="btn-secondary"
            onClick={resetFilter}
            style={{
              width: "100%",
              minHeight: "50px",
            }}
          >
            Reset Filter
          </button>

        </div>

      </div>


      {/* ======================================
          JUMLAH DATA
      ======================================= */}
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
          {filteredRikkes.length === 0
            ? 0
            : (currentPage - 1) *
                itemsPerPage +
              1}
        </strong>
        {" - "}
        <strong>
          {Math.min(
            currentPage *
              itemsPerPage,
            filteredRikkes.length
          )}
        </strong>
        {" dari "}
        <strong>
          {filteredRikkes.length}
        </strong>{" "}
        data rikkes.
      </div>


      {/* ======================================
          JIKA DATA TIDAK ADA
      ======================================= */}
      {filteredRikkes.length === 0 ? (

        <div className="empty">
          Data rikkes tidak ditemukan
          berdasarkan filter yang dipilih.
        </div>

      ) : (

        <>
          {/* ====================================
              TABEL
          ===================================== */}
          <div className="table-wrap">

            <table>

              {/* ================================
                  HEADER TABEL
              ================================= */}
              <thead>

                <tr>

                  <th>
                    Peserta
                  </th>

                  <th>
                    Tanggal Pemeriksaan
                  </th>

                  <th>
                    Diunggah Oleh
                  </th>

                  <th>
                    Berkas
                  </th>

                </tr>

              </thead>


              {/* ================================
                  BODY TABEL
              ================================= */}
              <tbody>

                {paginatedRikkes.map(
                  (r) => {

                    const p =
                      peserta.find(
                        (x) =>
                          x.id ===
                          r.pesertaId
                      );

                    return (

                      <tr
                        key={r.id}
                      >

                        {/* ====================
                            PESERTA
                        ===================== */}
                        <td>

                          <strong>
                            {p?.nama ||
                              "-"}
                          </strong>

                          <div
                            style={{
                              color:
                                "var(--satria-muted)",
                              fontSize:
                                "0.8rem",
                              marginTop:
                                "3px",
                            }}
                          >
                            NRP{" "}
                            {p?.nrp ||
                              "-"}
                          </div>

                        </td>


                        {/* ====================
                            TANGGAL
                        ===================== */}
                        <td>

                          {formatDate(
                            r.tanggalPemeriksaan
                          )}

                        </td>


                        {/* ====================
                            UPLOADER
                        ===================== */}
                        <td>

                          {r.uploadedByName ||
                            "-"}

                        </td>


                        {/* ====================
                            BERKAS
                        ===================== */}
                        <td>

                          <div
                            className="actions"
                          >

                            {r.filePath ? (

                              <a
                                href={
                                  r.filePath
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="linkish"
                              >
                                {r.fileName ||
                                  "Berkas"}
                              </a>

                            ) : (

                              <span>
                                -
                              </span>

                            )}

                          </div>

                        </td>

                      </tr>

                    );
                  }
                )}

              </tbody>

            </table>

          </div>


          {/* ====================================
              PAGINATION
          ===================================== */}
          {totalPages > 1 && (

            <div
              style={{
                display: "flex",
                justifyContent:
                  "center",
                alignItems:
                  "center",
                gap: "0.5rem",
                marginTop:
                  "1.5rem",
                flexWrap:
                  "wrap",
              }}
            >

              {/* ================================
                  SEBELUMNYA
              ================================= */}
              <button
                type="button"
                className="btn-secondary"
                onClick={
                  previousPage
                }
                disabled={
                  currentPage === 1
                }
                style={{
                  width: "auto",
                  minWidth: "110px",
                }}
              >
                ← Sebelumnya
              </button>


              {/* ================================
                  NOMOR HALAMAN
              ================================= */}
              <div
                style={{
                  display:
                    "flex",
                  gap:
                    "0.35rem",
                  alignItems:
                    "center",
                }}
              >

                {Array.from(
                  {
                    length:
                      totalPages,
                  },
                  (_, index) => {
                    const page =
                      index + 1;

                    return (

                      <button
                        key={page}
                        type="button"
                        onClick={() =>
                          goToPage(
                            page
                          )
                        }
                        className={
                          currentPage ===
                          page
                            ? "btn-primary"
                            : "btn-secondary"
                        }
                        style={{
                          width:
                            "40px",
                          height:
                            "40px",
                          padding:
                            0,
                        }}
                      >
                        {page}
                      </button>

                    );
                  }
                )}

              </div>


              {/* ================================
                  BERIKUTNYA
              ================================= */}
              <button
                type="button"
                className="btn-secondary"
                onClick={
                  nextPage
                }
                disabled={
                  currentPage ===
                  totalPages
                }
                style={{
                  width: "auto",
                  minWidth: "110px",
                }}
              >
                Berikutnya →
              </button>

            </div>

          )}

        </>

      )}

    </section>
  );
}