"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ACTIVITY_ACTION_LABEL,
  ACTIVITY_MODULE_LABEL,
} from "@/lib/activity-labels";
import { formatDateTime } from "@/lib/format";
import type { ActivityAction, ActivityLog } from "@/lib/types";
import { roleLabel } from "@/lib/roles";

type Props = {
  logs: ActivityLog[];
};

const DATA_PER_PAGE = 10;

const ACTION_OPTIONS: { value: ActivityAction | ""; label: string }[] = [
  { value: "", label: "Semua aktivitas" },
  { value: "PESERTA_TAMBAH", label: ACTIVITY_ACTION_LABEL.PESERTA_TAMBAH },
  { value: "MCU_UPLOAD", label: ACTIVITY_ACTION_LABEL.MCU_UPLOAD },
  { value: "MCU_EDIT", label: ACTIVITY_ACTION_LABEL.MCU_EDIT },
  { value: "MCU_HAPUS", label: ACTIVITY_ACTION_LABEL.MCU_HAPUS },
  { value: "IZIN_TAMBAH", label: ACTIVITY_ACTION_LABEL.IZIN_TAMBAH },
  { value: "IZIN_EDIT", label: ACTIVITY_ACTION_LABEL.IZIN_EDIT },
  { value: "IZIN_SETUJUI", label: ACTIVITY_ACTION_LABEL.IZIN_SETUJUI },
  { value: "IZIN_TOLAK", label: ACTIVITY_ACTION_LABEL.IZIN_TOLAK },
  { value: "IZIN_HAPUS", label: ACTIVITY_ACTION_LABEL.IZIN_HAPUS },
  { value: "PENGATURAN_SKHPK", label: ACTIVITY_ACTION_LABEL.PENGATURAN_SKHPK },
  { value: "SKHPK_KIRIM_WA", label: ACTIVITY_ACTION_LABEL.SKHPK_KIRIM_WA },
];

export function LogAktivitas({ logs }: Props) {
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [dariTanggal, setDariTanggal] = useState("");
  const [sampaiTanggal, setSampaiTanggal] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return logs.filter((item) => {
      if (action && item.action !== action) return false;
      const day = item.createdAt.slice(0, 10);
      if (dariTanggal && day < dariTanggal) return false;
      if (sampaiTanggal && day > sampaiTanggal) return false;
      if (!keyword) return true;
      const haystack = [
        item.userName,
        item.targetLabel,
        item.detail,
        ACTIVITY_ACTION_LABEL[item.action] || item.action,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(keyword);
    });
  }, [logs, search, action, dariTanggal, sampaiTanggal]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / DATA_PER_PAGE));

  useEffect(() => {
    setPage(1);
  }, [search, action, dariTanggal, sampaiTanggal]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginated = filtered.slice(
    (page - 1) * DATA_PER_PAGE,
    page * DATA_PER_PAGE,
  );

  const startData = filtered.length === 0 ? 0 : (page - 1) * DATA_PER_PAGE + 1;
  const endData = Math.min(page * DATA_PER_PAGE, filtered.length);

  function resetFilter() {
    setSearch("");
    setAction("");
    setDariTanggal("");
    setSampaiTanggal("");
    setPage(1);
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Log Aktivitas</h2>
          <p>
            Catatan aktivitas pengguna: peserta, upload MCU, dan izin senjata
            api.
          </p>
        </div>
      </div>

      <div className="dashboard-filter" style={{ marginBottom: "1rem" }}>
        <div className="field">
          <label htmlFor="log-cari">Cari</label>
          <input
            id="log-cari"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nama pengguna atau peserta..."
          />
        </div>
        <div className="field">
          <label htmlFor="log-aksi">Aktivitas</label>
          <select
            id="log-aksi"
            value={action}
            onChange={(e) => setAction(e.target.value)}
          >
            {ACTION_OPTIONS.map((item) => (
              <option key={item.value || "all"} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="log-dari">Dari tanggal</label>
          <input
            id="log-dari"
            type="date"
            value={dariTanggal}
            onChange={(e) => setDariTanggal(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="log-sampai">Sampai tanggal</label>
          <input
            id="log-sampai"
            type="date"
            value={sampaiTanggal}
            onChange={(e) => setSampaiTanggal(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="btn-secondary dashboard-filter-reset"
          onClick={resetFilter}
        >
          Reset Filter
        </button>
      </div>

      <p className="user-meta" style={{ marginBottom: "0.8rem" }}>
        {filtered.length === 0
          ? "Tidak ada log sesuai filter."
          : `Menampilkan ${startData} - ${endData} dari ${filtered.length} log.`}
      </p>

      {paginated.length === 0 ? (
        <div className="empty">Belum ada log aktivitas.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Pengguna</th>
                <th>Aktivitas</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((item) => (
                <tr key={item.id}>
                  <td>{formatDateTime(item.createdAt)}</td>
                  <td>
                    <strong>{item.userName}</strong>
                    <div
                      style={{
                        color: "var(--satria-muted)",
                        fontSize: "0.8rem",
                      }}
                    >
                      {roleLabel(item.userRole)}
                    </div>
                  </td>
                  <td>
                    {ACTIVITY_ACTION_LABEL[item.action] || item.action}
                    <div
                      style={{
                        color: "var(--satria-muted)",
                        fontSize: "0.8rem",
                      }}
                    >
                      {ACTIVITY_MODULE_LABEL[item.module] || item.module}
                    </div>
                  </td>
                  <td>
                    {item.targetLabel}
                    {item.detail ? (
                      <div
                        style={{
                          color: "var(--satria-muted)",
                          fontSize: "0.8rem",
                        }}
                      >
                        {item.detail}
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 ? (
        <div className="actions" style={{ marginTop: "1rem" }}>
          <button
            type="button"
            className="btn-secondary"
            disabled={page === 1}
            onClick={() => setPage((n) => Math.max(1, n - 1))}
            style={{ width: "auto" }}
          >
            ← Sebelumnya
          </button>
          <span className="user-meta">
            Halaman {page} / {totalPages}
          </span>
          <button
            type="button"
            className="btn-secondary"
            disabled={page === totalPages}
            onClick={() => setPage((n) => Math.min(totalPages, n + 1))}
            style={{ width: "auto" }}
          >
            Berikutnya →
          </button>
        </div>
      ) : null}
    </section>
  );
}
