"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { IzinBadge, RikkesBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/format";
import type { IzinSenjata, Peserta, Rikkes } from "@/lib/types";

type Props = {
  role: "admin" | "mcu";
  peserta: Peserta[];
  rikkes: Rikkes[];
  izin: IzinSenjata[];
};

function latestRikkes(rikkes: Rikkes[], pesertaId: string) {
  return rikkes
    .filter((item) => item.pesertaId === pesertaId)
    .sort((a, b) =>
      (b.tanggalPemeriksaan || "").localeCompare(a.tanggalPemeriksaan || ""),
    )[0];
}

function latestIzin(izin: IzinSenjata[], pesertaId: string) {
  return izin
    .filter((item) => item.pesertaId === pesertaId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}

export function DashboardView({ role, peserta, rikkes, izin }: Props) {
  const [search, setSearch] = useState("");
  const [satuan, setSatuan] = useState("");
  const [tanggalDari, setTanggalDari] = useState("");
  const [tanggalSampai, setTanggalSampai] = useState("");
  const [statusRikkes, setStatusRikkes] = useState("");
  const [statusIzin, setStatusIzin] = useState("");

  const satuanOptions = useMemo(
    () =>
      Array.from(new Set(peserta.map((p) => p.satuan).filter(Boolean))).sort(
        (a, b) => a.localeCompare(b, "id"),
      ),
    [peserta],
  );

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return peserta.filter((p) => {
      const r = latestRikkes(rikkes, p.id);
      const i = latestIzin(izin, p.id);
      const examDate = r?.tanggalPemeriksaan || "";

      const cocokCari =
        !keyword ||
        p.nama.toLowerCase().includes(keyword) ||
        p.nrp.toLowerCase().includes(keyword);

      const cocokSatuan = !satuan || p.satuan === satuan;
      const cocokDari = !tanggalDari || examDate >= tanggalDari;
      const cocokSampai = !tanggalSampai || examDate <= tanggalSampai;
      const cocokRikkes = !statusRikkes || p.statusRikkes === statusRikkes;
      const cocokIzin = !statusIzin || p.statusIzin === statusIzin;

      return (
        cocokCari &&
        cocokSatuan &&
        cocokDari &&
        cocokSampai &&
        cocokRikkes &&
        cocokIzin
      );
    });
  }, [
    peserta,
    rikkes,
    izin,
    search,
    satuan,
    tanggalDari,
    tanggalSampai,
    statusRikkes,
    statusIzin,
  ]);

  const stats = [
    { label: "Peserta terdaftar", value: peserta.length },
    { label: "Hasil MCU", value: rikkes.length },
    {
      label: role === "mcu" ? "MCU menunggu" : "Izin diajukan",
      value:
        role === "mcu"
          ? rikkes.filter((r) => r.hasil === "PENDING").length
          : izin.filter((i) => i.status === "DIAJUKAN" || i.status === "VERIFIKASI")
              .length,
    },
    {
      label: role === "mcu" ? "MCU layak" : "Izin disetujui",
      value:
        role === "mcu"
          ? rikkes.filter((r) => r.hasil === "LAYAK").length
          : izin.filter((i) => i.status === "DISETUJUI").length,
    },
  ];

  function resetFilter() {
    setSearch("");
    setSatuan("");
    setTanggalDari("");
    setTanggalSampai("");
    setStatusRikkes("");
    setStatusIzin("");
  }

  return (
    <div>
      <div className="grid-stats">
        {stats.map((item) => (
          <article key={item.label} className="stat">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </div>

      <section className="panel dashboard-filter-panel">
        <div className="panel-head">
          <div>
            <h2>Ringkasan data SATRIA</h2>
            <p>
              {role === "mcu"
                ? "Pantau peserta dan hasil rikkes yang sudah diunggah."
                : "Pantau peserta, hasil MCU, dan status izin senjata api."}
            </p>
          </div>
        </div>

        <div className="dashboard-filter">
          <div className="field">
            <label>Cari peserta</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nama atau NRP..."
            />
          </div>
          <div className="field">
            <label>Satuan</label>
            <select value={satuan} onChange={(e) => setSatuan(e.target.value)}>
              <option value="">Semua satuan</option>
              {satuanOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>MCU dari</label>
            <input
              type="date"
              value={tanggalDari}
              onChange={(e) => setTanggalDari(e.target.value)}
            />
          </div>
          <div className="field">
            <label>MCU sampai</label>
            <input
              type="date"
              value={tanggalSampai}
              onChange={(e) => setTanggalSampai(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Status rikkes</label>
            <select
              value={statusRikkes}
              onChange={(e) => setStatusRikkes(e.target.value)}
            >
              <option value="">Semua</option>
              <option value="PENDING">Menunggu</option>
              <option value="LAYAK">Layak</option>
              <option value="TIDAK_LAYAK">Tidak layak</option>
            </select>
          </div>
          {role === "admin" ? (
            <div className="field">
              <label>Status izin</label>
              <select
                value={statusIzin}
                onChange={(e) => setStatusIzin(e.target.value)}
              >
                <option value="">Semua</option>
                <option value="BELUM">Belum</option>
                <option value="DIAJUKAN">Diajukan</option>
                <option value="DISETUJUI">Disetujui</option>
                <option value="DITOLAK">Ditolak</option>
              </select>
            </div>
          ) : null}
          <button
            type="button"
            className="btn-secondary dashboard-filter-reset"
            onClick={resetFilter}
          >
            Reset Filter
          </button>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Daftar peserta</h2>
            <p>
              Menampilkan {filtered.length} dari {peserta.length} peserta
              {search || satuan || tanggalDari || tanggalSampai || statusRikkes || statusIzin
                ? " (hasil filter)"
                : ""}
              .
            </p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty">Data peserta tidak ditemukan berdasarkan filter.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Peserta</th>
                  <th>Satuan</th>
                  <th>MCU terakhir</th>
                  <th>Status rikkes</th>
                  {role === "admin" ? <th>Status izin</th> : null}
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 20).map((p) => {
                  const r = latestRikkes(rikkes, p.id);
                  const i = latestIzin(izin, p.id);
                  return (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.nama}</strong>
                        <div
                          style={{
                            color: "var(--satria-muted)",
                            fontSize: "0.8rem",
                          }}
                        >
                          NRP {p.nrp} · {p.pangkat}
                        </div>
                      </td>
                      <td>{p.satuan || "-"}</td>
                      <td>{formatDate(r?.tanggalPemeriksaan)}</td>
                      <td>
                        <RikkesBadge value={p.statusRikkes} />
                      </td>
                      {role === "admin" ? (
                        <td>
                          <IzinBadge value={i?.status || p.statusIzin} />
                        </td>
                      ) : null}
                      <td>
                        <Link href={`/peserta/${p.id}`} className="linkish">
                          Lihat detail
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
