"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/format";
import type { Peserta, Rikkes } from "@/lib/types";

type Props = {
  peserta: Peserta[];
  rikkes: Rikkes[];
  editingId?: string;
  onEdit: (rikkes: Rikkes) => void;
  onCancelEdit: () => void;
};

function IconEdit() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 20h4.5L19.2 9.3a1.5 1.5 0 0 0 0-2.1L16.8 4.8a1.5 1.5 0 0 0-2.1 0L6 14.5V20Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 6.5 17.5 10.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 7h14M10 11v6M14 11v6M9 7l1-2h4l1 2M7 7l1 13h8l1-13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RiwayatUploadMcu({
  peserta,
  rikkes,
  editingId,
  onEdit,
  onCancelEdit,
}: Props) {
  // ==========================================
  // STATE FILTER
  // ==========================================
  const router = useRouter();
  const [searchPeserta, setSearchPeserta] = useState("");
  const [tanggalDari, setTanggalDari] = useState("");
  const [tanggalSampai, setTanggalSampai] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Rikkes | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

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
      const cocokTanggalDari =
        !tanggalDari ||
        r.tanggalPemeriksaan >= tanggalDari;

      const cocokTanggalSampai =
        !tanggalSampai ||
        r.tanggalPemeriksaan <= tanggalSampai;

      return (
        cocokPeserta &&
        cocokTanggalDari &&
        cocokTanggalSampai
      );
    });
  }, [
    rikkes,
    peserta,
    searchPeserta,
    tanggalDari,
    tanggalSampai,
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
    tanggalDari,
    tanggalSampai,
  ]);

  // ==========================================
  // RESET FILTER
  // ==========================================
  function resetFilter() {
    setSearchPeserta("");
    setTanggalDari("");
    setTanggalSampai("");
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

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/rikkes/${pendingDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setDeleteError(data.error || "Gagal menghapus data MCU.");
        return;
      }
      if (editingId === pendingDelete.id) {
        onCancelEdit();
      }
      setPendingDelete(null);
      router.refresh();
    } catch {
      setDeleteError("Terjadi kesalahan saat menghapus data MCU.");
    } finally {
      setDeleting(false);
    }
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
            "2fr 1.3fr 1.3fr 1fr",
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
            DARI TANGGAL PEMERIKSAAN
        =================================== */}
        <div className="field">
          <label>
            Dari Tanggal Pemeriksaan
          </label>

          <input
            type="date"
            value={tanggalDari}
            onChange={(e) =>
              setTanggalDari(
                e.target.value
              )
            }
          />
        </div>


        {/* ==================================
            SAMPAI TANGGAL PEMERIKSAAN
        =================================== */}
        <div className="field">
          <label>
            Sampai Tanggal Pemeriksaan
          </label>

          <input
            type="date"
            value={tanggalSampai}
            onChange={(e) =>
              setTanggalSampai(
                e.target.value
              )
            }
          />
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
                    Nomor Telepon
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

                  <th>
                    Aksi
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
                        className={
                          editingId === r.id
                            ? "row-editing"
                            : undefined
                        }
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
                            NOMOR TELEPON
                        ===================== */}
                        <td>
                          {p?.noHp || "-"}
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

                        <td>
                          <div className="actions">
                            <button
                              type="button"
                              className="icon-btn"
                              title="Edit"
                              aria-label={`Edit MCU ${p?.nama || ""}`}
                              onClick={() => onEdit(r)}
                            >
                              <IconEdit />
                            </button>
                            <button
                              type="button"
                              className="icon-btn icon-btn-danger"
                              title="Hapus"
                              aria-label={`Hapus MCU ${p?.nama || ""}`}
                              onClick={() => {
                                setDeleteError("");
                                setPendingDelete(r);
                              }}
                            >
                              <IconTrash />
                            </button>
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

      {pendingDelete ? (
        <div
          className="confirm-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="hapus-mcu-title"
          onClick={() => {
            if (deleting) return;
            setPendingDelete(null);
            setDeleteError("");
          }}
        >
          <div
            className="confirm-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="hapus-mcu-title">Hapus data MCU?</h3>
            <p>
              Data MCU{" "}
              <strong>
                {peserta.find((p) => p.id === pendingDelete.pesertaId)
                  ?.nama || "peserta ini"}
              </strong>{" "}
              akan dihapus. Tindakan ini tidak dapat dibatalkan.
            </p>
            {deleteError ? (
              <p className="error-text">{deleteError}</p>
            ) : null}
            <div className="actions">
              <button
                type="button"
                className="btn-secondary"
                style={{ width: "auto" }}
                onClick={() => {
                  if (deleting) return;
                  setPendingDelete(null);
                  setDeleteError("");
                }}
                disabled={deleting}
              >
                Tidak
              </button>
              <button
                type="button"
                className="btn-danger"
                style={{ width: "auto" }}
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? "Menghapus..." : "Ya"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

    </section>
  );
}