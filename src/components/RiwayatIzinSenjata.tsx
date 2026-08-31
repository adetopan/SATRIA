"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/format";
import { IzinBadge } from "@/components/StatusBadge";
import { IzinStatusActions } from "@/components/IzinStatusActions";
import { KirimWaButton } from "@/components/KirimWaButton";
import type { IzinSenjata, Peserta, Rikkes } from "@/lib/types";

type Props = {
  izin: IzinSenjata[];
  peserta: Peserta[];
  rikkes: Rikkes[];
  editingId?: string;
  onEdit: (izin: IzinSenjata) => void;
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

export function RiwayatIzinSenjata({
  izin,
  peserta,
  rikkes,
  editingId,
  onEdit,
  onCancelEdit,
}: Props) {
  // ==========================================
  // FILTER
  // ==========================================
  const [searchPeserta, setSearchPeserta] = useState("");
  const [searchNomor, setSearchNomor] = useState("");
  const [tanggalDari, setTanggalDari] = useState("");
  const [tanggalSampai, setTanggalSampai] = useState("");
  const [status, setStatus] = useState("");
  const [pendingDelete, setPendingDelete] = useState<IzinSenjata | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const router = useRouter();

  // ==========================================
  // PAGINATION
  // ==========================================
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  // ==========================================
  // FILTER DATA
  // ==========================================
  const filteredIzin = useMemo(() => {
    return izin.filter((i) => {
      const p = peserta.find(
        (x) => x.id === i.pesertaId
      );

      // ========================================
      // FILTER PESERTA
      // Nama / NRP
      // ========================================
      const keywordPeserta =
        searchPeserta.toLowerCase().trim();

      const cocokPeserta =
        !keywordPeserta ||
        p?.nama
          ?.toLowerCase()
          .includes(keywordPeserta) ||
        p?.nrp
          ?.toLowerCase()
          .includes(keywordPeserta);

      // ========================================
      // FILTER NOMOR PERMOHONAN
      // ========================================
      const keywordNomor =
        searchNomor.toLowerCase().trim();

      const cocokNomor =
        !keywordNomor ||
        i.nomorPermohonan
          ?.toLowerCase()
          .includes(keywordNomor);

      // ========================================
      // FILTER TANGGAL DARI
      // ========================================
      const cocokTanggalDari =
        !tanggalDari ||
        i.tanggalPengajuan >= tanggalDari;

      // ========================================
      // FILTER TANGGAL SAMPAI
      // ========================================
      const cocokTanggalSampai =
        !tanggalSampai ||
        i.tanggalPengajuan <= tanggalSampai;

      // ========================================
      // FILTER STATUS
      // ========================================
      const cocokStatus =
        !status ||
        i.status === status;

      return (
        cocokPeserta &&
        cocokNomor &&
        cocokTanggalDari &&
        cocokTanggalSampai &&
        cocokStatus
      );
    });
  }, [
    izin,
    peserta,
    searchPeserta,
    searchNomor,
    tanggalDari,
    tanggalSampai,
    status,
  ]);

  // ==========================================
  // PAGINATION
  // ==========================================
  const totalPages = Math.ceil(
    filteredIzin.length / itemsPerPage
  );

  const startIndex =
    (currentPage - 1) * itemsPerPage;

  const endIndex =
    startIndex + itemsPerPage;

  const currentData =
    filteredIzin.slice(
      startIndex,
      endIndex
    );

  // ==========================================
  // RESET FILTER
  // ==========================================
  function resetFilter() {
    setSearchPeserta("");
    setSearchNomor("");
    setTanggalDari("");
    setTanggalSampai("");
    setStatus("");
    setCurrentPage(1);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/izin/${pendingDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setDeleteError(data.error || "Gagal menghapus data izin.");
        return;
      }
      if (editingId === pendingDelete.id) {
        onCancelEdit();
      }
      setPendingDelete(null);
      router.refresh();
    } catch {
      setDeleteError("Terjadi kesalahan saat menghapus data izin.");
    } finally {
      setDeleting(false);
    }
  }

  // ==========================================
  // FILTER PESERTA BERUBAH
  // ==========================================
  function handleSearchPeserta(
    value: string
  ) {
    setSearchPeserta(value);
    setCurrentPage(1);
  }

  // ==========================================
  // FILTER NOMOR BERUBAH
  // ==========================================
  function handleSearchNomor(
    value: string
  ) {
    setSearchNomor(value);
    setCurrentPage(1);
  }

  // ==========================================
  // TANGGAL DARI
  // ==========================================
  function handleTanggalDari(
    value: string
  ) {
    setTanggalDari(value);
    setCurrentPage(1);
  }

  // ==========================================
  // TANGGAL SAMPAI
  // ==========================================
  function handleTanggalSampai(
    value: string
  ) {
    setTanggalSampai(value);
    setCurrentPage(1);
  }

  // ==========================================
  // STATUS
  // ==========================================
  function handleStatus(
    value: string
  ) {
    setStatus(value);
    setCurrentPage(1);
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
          <h2>
            Daftar Izin Senjata Api
          </h2>

          <p>
            Daftar pengajuan izin senjata api
            peserta.
          </p>
        </div>
      </div>

      {/* ======================================
          FILTER
      ======================================= */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1.5fr 1.5fr 1fr 1fr 1.2fr 1fr",
          gap: "1rem",
          alignItems: "end",
          marginBottom: "1rem",
        }}
      >
        {/* PESERTA */}
        <div className="field">
          <label>
            Cari Peserta
          </label>

          <input
            type="text"
            value={searchPeserta}
            onChange={(e) =>
              handleSearchPeserta(
                e.target.value
              )
            }
            placeholder="Nama / NRP..."
          />
        </div>

        {/* NOMOR PERMOHONAN */}
        <div className="field">
          <label>
            Nomor Permohonan
          </label>

          <input
            type="text"
            value={searchNomor}
            onChange={(e) =>
              handleSearchNomor(
                e.target.value
              )
            }
            placeholder="Nomor permohonan..."
          />
        </div>

        {/* TANGGAL DARI */}
        <div className="field">
          <label>
            Dari Tanggal
          </label>

          <input
            type="date"
            value={tanggalDari}
            onChange={(e) =>
              handleTanggalDari(
                e.target.value
              )
            }
          />
        </div>

        {/* TANGGAL SAMPAI */}
        <div className="field">
          <label>
            Sampai Tanggal
          </label>

          <input
            type="date"
            value={tanggalSampai}
            onChange={(e) =>
              handleTanggalSampai(
                e.target.value
              )
            }
          />
        </div>

        {/* STATUS */}
        <div className="field">
          <label>
            Status Izin
          </label>

          <select
            value={status}
            onChange={(e) =>
              handleStatus(
                e.target.value
              )
            }
          >
            <option value="">
              Semua Status
            </option>

            <option value="PENDING">
              Menunggu
            </option>

            <option value="DISETUJUI">
              Disetujui
            </option>

            <option value="DITOLAK">
              Ditolak
            </option>
          </select>
        </div>

        {/* RESET */}
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
          color: "var(--satria-muted)",
          fontSize: "0.9rem",
        }}
      >
        Menampilkan{" "}
        <strong>
          {filteredIzin.length === 0
            ? 0
            : startIndex + 1}
          -
          {Math.min(
            endIndex,
            filteredIzin.length
          )}
        </strong>{" "}
        dari{" "}
        <strong>
          {filteredIzin.length}
        </strong>{" "}
        data.
      </div>

      {/* ======================================
          TABEL
      ======================================= */}
      {filteredIzin.length === 0 ? (
        <div className="empty">
          Data izin tidak ditemukan
          berdasarkan filter yang dipilih.
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>
                  Nomor Permohonan
                </th>

                <th>
                  Peserta
                </th>

                <th>
                  Jenis
                </th>

                <th>
                  Berkas MCU
                </th>

                <th>
                  Status Izin
                </th>

                <th>
                  Aksi
                </th>

                <th>
                  Edit / Hapus
                </th>

                <th>
                  Kirim WA
                </th>
              </tr>
            </thead>

            <tbody>
              {currentData.map((i) => {
                const p =
                  peserta.find(
                    (x) =>
                      x.id ===
                      i.pesertaId
                  );

                const r =
                  (i.rikkesId
                    ? rikkes.find(
                        (x) =>
                          x.id ===
                          i.rikkesId
                      )
                    : undefined) ||
                  rikkes.find(
                    (x) =>
                      x.pesertaId ===
                      i.pesertaId
                  );

                return (
                  <tr
                    key={i.id}
                    className={
                      editingId === i.id ? "row-editing" : undefined
                    }
                  >
                    {/* NOMOR */}
                    <td>
                      {i.nomorPermohonan}

                      <div
                        style={{
                          color:
                            "var(--satria-muted)",
                          fontSize:
                            "0.8rem",
                        }}
                      >
                        {formatDate(
                          i.tanggalPengajuan
                        )}
                      </div>
                    </td>

                    {/* PESERTA */}
                    <td>
                      <strong>
                        {p?.nama || "-"}
                      </strong>

                      <div
                        style={{
                          color:
                            "var(--satria-muted)",
                          fontSize:
                            "0.8rem",
                        }}
                      >
                        {p?.satuan || "-"}
                      </div>

                      <div
                        style={{
                          color:
                            "var(--satria-muted)",
                          fontSize:
                            "0.8rem",
                        }}
                      >
                        HP:{" "}
                        {p?.noHp || "-"}
                      </div>
                    </td>

                    {/* JENIS */}
                    <td>
                      {i.jenisSenjata}

                      <div
                        style={{
                          color:
                            "var(--satria-muted)",
                          fontSize:
                            "0.8rem",
                        }}
                      >
                        {i.keperluan}
                      </div>
                    </td>

                    {/* MCU */}
                    <td>
                      {r?.filePath ? (
                        <a
                          href={
                            r.filePath
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="linkish"
                        >
                          {r.fileName ||
                            "Lihat berkas"}
                        </a>
                      ) : (
                        <span
                          style={{
                            color:
                              "var(--satria-muted)",
                          }}
                        >
                          Belum ada
                        </span>
                      )}
                    </td>

                    {/* STATUS */}
                    <td>
                      <IzinBadge
                        value={i.status}
                      />
                    </td>

                    {/* AKSI */}
                    <td>
                      <IzinStatusActions
                        id={i.id}
                        status={i.status}
                      />
                    </td>

                    {/* EDIT / HAPUS */}
                    <td>
                      <div className="actions">
                        <button
                          type="button"
                          className="icon-btn"
                          title="Edit"
                          aria-label={`Edit izin ${p?.nama || ""}`}
                          onClick={() => onEdit(i)}
                        >
                          <IconEdit />
                        </button>
                        <button
                          type="button"
                          className="icon-btn icon-btn-danger"
                          title="Hapus"
                          aria-label={`Hapus izin ${p?.nama || ""}`}
                          onClick={() => {
                            setDeleteError("");
                            setPendingDelete(i);
                          }}
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </td>

                    {/* KIRIM WA */}
                    <td>
                      <KirimWaButton
                        noHp={p?.noHp}
                        nama={p?.nama}
                        nomorPermohonan={
                          i.nomorPermohonan
                        }
                        rikkesId={r?.id}
                        izinId={i.id}
                        status={i.status}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ======================================
          PAGINATION
      ======================================= */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent:
              "center",
            alignItems: "center",
            gap: "0.5rem",
            marginTop: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          {/* PREVIOUS */}
          <button
            type="button"
            className="btn-secondary"
            disabled={
              currentPage === 1
            }
            onClick={() =>
              setCurrentPage(
                (prev) =>
                  Math.max(
                    1,
                    prev - 1
                  )
              )
            }
          >
            ‹ Sebelumnya
          </button>

          {/* NOMOR HALAMAN */}
          {Array.from(
            { length: totalPages },
            (_, index) =>
              index + 1
          ).map((page) => (
            <button
              key={page}
              type="button"
              className={
                page === currentPage
                  ? "btn-primary"
                  : "btn-secondary"
              }
              onClick={() =>
                setCurrentPage(page)
              }
              style={{
                minWidth: "42px",
              }}
            >
              {page}
            </button>
          ))}

          {/* NEXT */}
          <button
            type="button"
            className="btn-secondary"
            disabled={
              currentPage ===
              totalPages
            }
            onClick={() =>
              setCurrentPage(
                (prev) =>
                  Math.min(
                    totalPages,
                    prev + 1
                  )
              )
            }
          >
            Berikutnya ›
          </button>
        </div>
      )}

      {pendingDelete ? (
        <div
          className="confirm-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="hapus-izin-title"
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
            <h3 id="hapus-izin-title">Hapus data izin?</h3>
            <p>
              Data izin{" "}
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