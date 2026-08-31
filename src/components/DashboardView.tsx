"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatDate } from "@/lib/format";
import { IzinBadge, RikkesBadge } from "@/components/StatusBadge";
import type { IzinSenjata, Peserta, Rikkes, Role } from "@/lib/types";

type Props = {
  role: Role;
  peserta: Peserta[];
  rikkes: Rikkes[];
  izin: IzinSenjata[];
};

function inDateRange(dateStr: string, from: string, to: string) {
  if (!dateStr) return false;
  const day = dateStr.slice(0, 10);
  if (from && day < from) return false;
  if (to && day > to) return false;
  return true;
}

function includesText(value: string | undefined, query: string) {
  if (!query) return true;
  return (value || "").toLowerCase().includes(query);
}

export function DashboardView({
  role,
  peserta,
  rikkes,
  izin,
}: Props) {
  const [nama, setNama] = useState("");
  const [satuan, setSatuan] = useState("");
  const [dariTanggal, setDariTanggal] = useState("");
  const [sampaiTanggal, setSampaiTanggal] = useState("");
  const [nomorPermohonan, setNomorPermohonan] = useState("");
  const [statusRikkes, setStatusRikkes] = useState("");

  const daftarNama = useMemo(
    () =>
      Array.from(new Set(peserta.map((p) => p.nama).filter(Boolean))).sort(
        (a, b) => a.localeCompare(b, "id"),
      ),
    [peserta],
  );

  const daftarSatuan = useMemo(
    () =>
      Array.from(new Set(peserta.map((p) => p.satuan).filter(Boolean))).sort(
        (a, b) => a.localeCompare(b, "id"),
      ),
    [peserta],
  );

  const queryNama = nama.trim().toLowerCase();
  const querySatuan = satuan.trim().toLowerCase();
  const queryNomor = nomorPermohonan.trim().toLowerCase();
  const hasFilter = Boolean(
    queryNama ||
      querySatuan ||
      dariTanggal ||
      sampaiTanggal ||
      queryNomor ||
      statusRikkes,
  );

  const filteredPeserta = useMemo(() => {
    return peserta.filter((p) => {
      if (!includesText(p.nama, queryNama)) return false;
      if (!includesText(p.satuan, querySatuan)) return false;
      if (statusRikkes === "LAYAK") {
        const punyaIzinDisetujui = izin.some(
          (i) => i.pesertaId === p.id && i.status === "DISETUJUI",
        );
        if (!punyaIzinDisetujui) return false;
      } else if (statusRikkes === "TIDAK_LAYAK") {
        const punyaIzinDitolak = izin.some(
          (i) => i.pesertaId === p.id && i.status === "DITOLAK",
        );
        if (!punyaIzinDitolak) return false;
      }

      if (dariTanggal || sampaiTanggal) {
        const punyaPemeriksaan = rikkes.some(
          (r) =>
            r.pesertaId === p.id &&
            inDateRange(r.tanggalPemeriksaan, dariTanggal, sampaiTanggal),
        );
        if (!punyaPemeriksaan) return false;
      }

      if (queryNomor) {
        const punyaPermohonan = izin.some(
          (i) =>
            i.pesertaId === p.id &&
            includesText(i.nomorPermohonan, queryNomor),
        );
        if (!punyaPermohonan) return false;
      }

      return true;
    });
  }, [
    peserta,
    rikkes,
    izin,
    queryNama,
    querySatuan,
    dariTanggal,
    sampaiTanggal,
    queryNomor,
    statusRikkes,
  ]);

  const filteredIds = useMemo(
    () => new Set(filteredPeserta.map((p) => p.id)),
    [filteredPeserta],
  );

  const filteredRikkes = useMemo(() => {
    return rikkes.filter((r) => {
      if (!filteredIds.has(r.pesertaId)) return false;
      if (dariTanggal || sampaiTanggal) {
        return inDateRange(r.tanggalPemeriksaan, dariTanggal, sampaiTanggal);
      }
      return true;
    });
  }, [rikkes, filteredIds, dariTanggal, sampaiTanggal]);

  const filteredIzin = useMemo(() => {
    return izin.filter((i) => {
      if (!filteredIds.has(i.pesertaId)) return false;
      if (queryNomor && !includesText(i.nomorPermohonan, queryNomor)) {
        return false;
      }
      if (statusRikkes === "LAYAK" && i.status !== "DISETUJUI") return false;
      if (statusRikkes === "TIDAK_LAYAK" && i.status !== "DITOLAK") {
        return false;
      }
      return true;
    });
  }, [izin, filteredIds, queryNomor, statusRikkes]);

  const pesertaTampil = hasFilter ? filteredPeserta : peserta.slice(0, 5);
  const rikkesTampil = hasFilter ? filteredRikkes : rikkes.slice(0, 6);
  const izinTampil = hasFilter ? filteredIzin : izin.slice(0, 5);

  const layak = filteredIzin.filter((i) => i.status === "DISETUJUI").length;
  const tidakLayak = filteredIzin.filter((i) => i.status === "DITOLAK").length;
  const totalPengajuIzin = filteredIzin.length;
  const izinAktif = filteredIzin.filter((i) =>
    ["DIAJUKAN", "VERIFIKASI"].includes(i.status),
  ).length;

  function resetFilter() {
    setNama("");
    setSatuan("");
    setDariTanggal("");
    setSampaiTanggal("");
    setNomorPermohonan("");
    setStatusRikkes("");
  }

  return (
    <div>
      <section className="panel dashboard-filter-panel">
        <div className="panel-head">
          <div>
            <h2>Filter Dashboard</h2>
            <p>
              Cari data berdasarkan nama, satuan, tanggal pemeriksaan, status
              kelayakan izin, dan nomor permohonan.
            </p>
          </div>
        </div>

        <div className="dashboard-filter">
          <div className="field">
            <label htmlFor="filter-nama">Nama</label>
            <input
              id="filter-nama"
              type="text"
              list="dashboard-nama"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Ketik nama peserta..."
            />
            <datalist id="dashboard-nama">
              {daftarNama.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </div>

          <div className="field">
            <label htmlFor="filter-satuan">Satuan</label>
            <input
              id="filter-satuan"
              type="text"
              list="dashboard-satuan"
              value={satuan}
              onChange={(e) => setSatuan(e.target.value)}
              placeholder="Ketik satuan..."
            />
            <datalist id="dashboard-satuan">
              {daftarSatuan.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </div>

          <div className="field">
            <label htmlFor="filter-dari">Dari tanggal pemeriksaan</label>
            <input
              id="filter-dari"
              type="date"
              value={dariTanggal}
              onChange={(e) => setDariTanggal(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="filter-sampai">Sampai tanggal pemeriksaan</label>
            <input
              id="filter-sampai"
              type="date"
              value={sampaiTanggal}
              onChange={(e) => setSampaiTanggal(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="filter-nomor">Nomor permohonan</label>
            <input
              id="filter-nomor"
              type="text"
              value={nomorPermohonan}
              onChange={(e) => setNomorPermohonan(e.target.value)}
              placeholder="Ketik nomor permohonan..."
            />
          </div>

          <div className="field">
            <label htmlFor="filter-status">Status kelayakan</label>
            <select
              id="filter-status"
              value={statusRikkes}
              onChange={(e) => setStatusRikkes(e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="LAYAK">Disetujui</option>
              <option value="TIDAK_LAYAK">Ditolak</option>
            </select>
          </div>

          <button
            type="button"
            className="btn-secondary dashboard-filter-reset"
            onClick={resetFilter}
          >
            Reset Filter
          </button>
        </div>
      </section>

      <div className="grid-stats">
        <div className="stat">
          <span>Total Peserta</span>
          <strong>{totalPengajuIzin}</strong>
        </div>
        <div className="stat">
          <span>Izin Senjata Api Disetujui</span>
          <strong>{layak}</strong>
        </div>
        <div className="stat">
          <span>Izin Senjata Api Ditolak</span>
          <strong>{tidakLayak}</strong>
        </div>
        <div className="stat">
          <span>Izin Dalam Proses</span>
          <strong>{izinAktif}</strong>
        </div>
      </div>

      <div className="split-2">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Peserta Terbaru</h2>
              <p>
                {hasFilter
                  ? `${filteredPeserta.length} peserta sesuai filter.`
                  : "Data peserta yang terdaftar di SATRIA."}
              </p>
            </div>
            <Link href="/peserta" className="btn-secondary">
              Lihat Semua
            </Link>
          </div>
          {pesertaTampil.length === 0 ? (
            <div className="empty">Tidak ada peserta sesuai filter.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>NRP</th>
                    <th>Satuan</th>
                  </tr>
                </thead>
                <tbody>
                  {pesertaTampil.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <Link href={`/peserta/${p.id}`} className="linkish">
                          {p.nama}
                        </Link>
                        <div
                          style={{
                            color: "var(--satria-muted)",
                            fontSize: "0.8rem",
                          }}
                        >
                          {p.pangkat} · {p.satuan}
                        </div>
                      </td>
                      <td>{p.nrp}</td>
                      <td>{p.satuan || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Upload MCU Terbaru</h2>
              <p>
                {hasFilter
                  ? `${filteredRikkes.length} hasil MCU sesuai filter.`
                  : role === "mcu"
                    ? "Hasil rikkes yang Anda unggah ke SATRIA."
                    : "Hasil rikkes dari MCU RS Polri."}
              </p>
            </div>
            <Link href="/upload-mcu" className="btn-secondary">
              Upload
            </Link>
          </div>
          {rikkesTampil.length === 0 ? (
            <div className="empty">
              {hasFilter
                ? "Tidak ada hasil MCU sesuai filter."
                : "Belum ada hasil MCU yang diunggah."}
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nomor Surat</th>
                    <th>Tanggal</th>
                    <th>Hasil</th>
                  </tr>
                </thead>
                <tbody>
                  {rikkesTampil.map((r) => {
                    const p = peserta.find((x) => x.id === r.pesertaId);
                    return (
                      <tr key={r.id}>
                        <td>
                          {r.nomorSurat}
                          <div
                            style={{
                              color: "var(--satria-muted)",
                              fontSize: "0.8rem",
                            }}
                          >
                            {p?.nama || "-"}
                          </div>
                        </td>
                        <td>{formatDate(r.tanggalPemeriksaan)}</td>
                        <td>
                          <RikkesBadge value={r.hasil} />
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

      {role === "admin" ? (
        <section className="panel" style={{ marginTop: "1rem" }}>
          <div className="panel-head">
            <div>
              <h2>Izin Senjata Api</h2>
              <p>
                {hasFilter
                  ? `${filteredIzin.length} permohonan sesuai filter.`
                  : "Status permohonan izin yang terhubung dengan hasil rikkes."}
              </p>
            </div>
            <Link href="/izin-senjata" className="btn-secondary">
              Kelola Izin
            </Link>
          </div>
          {izinTampil.length === 0 ? (
            <div className="empty">Tidak ada permohonan sesuai filter.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nomor</th>
                    <th>Peserta</th>
                    <th>Jenis</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {izinTampil.map((i) => {
                    const p = peserta.find((x) => x.id === i.pesertaId);
                    return (
                      <tr key={i.id}>
                        <td>{i.nomorPermohonan}</td>
                        <td>{p?.nama || "-"}</td>
                        <td>{i.jenisSenjata}</td>
                        <td>
                          <IzinBadge value={i.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
