"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatDate, labelKeperluan } from "@/lib/format";
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

const DATA_PER_PAGE = 10;

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
  const [page, setPage] = useState(1);

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

  const sudahMcuIds = useMemo(
    () => new Set(rikkes.map((r) => r.pesertaId)),
    [rikkes],
  );

  const filteredPeserta = useMemo(() => {
    function cocokStatus(p: Peserta) {
      if (!statusRikkes) return true;
      if (statusRikkes === "BELUM_MCU") return !sudahMcuIds.has(p.id);
      if (statusRikkes === "SUDAH_MCU") return sudahMcuIds.has(p.id);
      if (statusRikkes === "LAYAK") {
        return izin.some(
          (i) => i.pesertaId === p.id && i.status === "DISETUJUI",
        );
      }
      if (statusRikkes === "TIDAK_LAYAK") {
        return izin.some(
          (i) => i.pesertaId === p.id && i.status === "DITOLAK",
        );
      }
      return true;
    }

    function cocokTanggalMcu(p: Peserta) {
      if (!dariTanggal && !sampaiTanggal) return true;
      if (statusRikkes === "BELUM_MCU") return true;
      return rikkes.some(
        (r) =>
          r.pesertaId === p.id &&
          inDateRange(r.tanggalPemeriksaan, dariTanggal, sampaiTanggal),
      );
    }

    return peserta.filter((p) => {
      if (!includesText(p.nama, queryNama)) return false;
      if (!includesText(p.satuan, querySatuan)) return false;
      if (queryNomor && !includesText(p.nomorPermohonan, queryNomor)) {
        return false;
      }
      if (!cocokStatus(p)) return false;
      if (!cocokTanggalMcu(p)) return false;
      return true;
    });
  }, [
    peserta,
    rikkes,
    izin,
    sudahMcuIds,
    queryNama,
    querySatuan,
    dariTanggal,
    sampaiTanggal,
    queryNomor,
    statusRikkes,
  ]);

  const pesertaUntukSaran = useMemo(() => {
    function cocokLainnya(
      p: Peserta,
      skip: "nama" | "satuan" | "nomor",
    ) {
      if (skip !== "nama" && !includesText(p.nama, queryNama)) return false;
      if (skip !== "satuan" && !includesText(p.satuan, querySatuan)) {
        return false;
      }
      if (
        skip !== "nomor" &&
        queryNomor &&
        !includesText(p.nomorPermohonan, queryNomor)
      ) {
        return false;
      }
      if (statusRikkes === "BELUM_MCU" && sudahMcuIds.has(p.id)) return false;
      if (statusRikkes === "SUDAH_MCU" && !sudahMcuIds.has(p.id)) return false;
      if (statusRikkes === "LAYAK") {
        const punyaIzinDisetujui = izin.some(
          (i) => i.pesertaId === p.id && i.status === "DISETUJUI",
        );
        if (!punyaIzinDisetujui) return false;
      }
      if (statusRikkes === "TIDAK_LAYAK") {
        const punyaIzinDitolak = izin.some(
          (i) => i.pesertaId === p.id && i.status === "DITOLAK",
        );
        if (!punyaIzinDitolak) return false;
      }
      if (
        (dariTanggal || sampaiTanggal) &&
        statusRikkes !== "BELUM_MCU"
      ) {
        const punyaPemeriksaan = rikkes.some(
          (r) =>
            r.pesertaId === p.id &&
            inDateRange(r.tanggalPemeriksaan, dariTanggal, sampaiTanggal),
        );
        if (!punyaPemeriksaan) return false;
      }
      return true;
    }

    return {
      nama: peserta.filter((p) => cocokLainnya(p, "nama")),
      satuan: peserta.filter((p) => cocokLainnya(p, "satuan")),
      nomor: peserta.filter((p) => cocokLainnya(p, "nomor")),
    };
  }, [
    peserta,
    rikkes,
    izin,
    sudahMcuIds,
    queryNama,
    querySatuan,
    queryNomor,
    dariTanggal,
    sampaiTanggal,
    statusRikkes,
  ]);

  const daftarNama = useMemo(
    () =>
      Array.from(
        new Set(pesertaUntukSaran.nama.map((p) => p.nama).filter(Boolean)),
      ).sort((a, b) => a.localeCompare(b, "id")),
    [pesertaUntukSaran],
  );

  const daftarSatuan = useMemo(
    () =>
      Array.from(
        new Set(pesertaUntukSaran.satuan.map((p) => p.satuan).filter(Boolean)),
      ).sort((a, b) => a.localeCompare(b, "id")),
    [pesertaUntukSaran],
  );

  const daftarNomorPermohonan = useMemo(
    () =>
      Array.from(
        new Set(
          pesertaUntukSaran.nomor
            .map((p) => p.nomorPermohonan)
            .filter((value) => Boolean(value?.trim())),
        ),
      ).sort((a, b) => a.localeCompare(b, "id")),
    [pesertaUntukSaran],
  );

  const mcuTerbaruByPeserta = useMemo(() => {
    const map = new Map<string, Rikkes>();
    const kandidat =
      dariTanggal || sampaiTanggal
        ? rikkes.filter((r) =>
            inDateRange(r.tanggalPemeriksaan, dariTanggal, sampaiTanggal),
          )
        : rikkes;
    for (const r of kandidat) {
      const existing = map.get(r.pesertaId);
      if (
        !existing ||
        r.tanggalPemeriksaan > existing.tanggalPemeriksaan ||
        (r.tanggalPemeriksaan === existing.tanggalPemeriksaan &&
          r.createdAt > existing.createdAt)
      ) {
        map.set(r.pesertaId, r);
      }
    }
    return map;
  }, [rikkes, dariTanggal, sampaiTanggal]);

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
      if (statusRikkes === "LAYAK" && i.status !== "DISETUJUI") return false;
      if (statusRikkes === "TIDAK_LAYAK" && i.status !== "DITOLAK") {
        return false;
      }
      if (statusRikkes === "BELUM_MCU") return false;
      return true;
    });
  }, [izin, filteredIds, statusRikkes]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPeserta.length / DATA_PER_PAGE),
  );

  useEffect(() => {
    setPage(1);
  }, [
    queryNama,
    querySatuan,
    dariTanggal,
    sampaiTanggal,
    queryNomor,
    statusRikkes,
  ]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pesertaTampil = useMemo(() => {
    const start = (page - 1) * DATA_PER_PAGE;
    return filteredPeserta.slice(start, start + DATA_PER_PAGE);
  }, [filteredPeserta, page]);

  const startData =
    filteredPeserta.length === 0 ? 0 : (page - 1) * DATA_PER_PAGE + 1;
  const endData = Math.min(page * DATA_PER_PAGE, filteredPeserta.length);

  function getPageNumbers() {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (page > 4) pages.push("...");
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 3) pages.push("...");
    pages.push(totalPages);
    return pages;
  }

  const jumlahBelumMcu = filteredPeserta.filter(
    (p) => !sudahMcuIds.has(p.id),
  ).length;
  const jumlahSudahMcu = filteredPeserta.filter((p) =>
    sudahMcuIds.has(p.id),
  ).length;

  const layak = filteredIzin.filter((i) => i.status === "DISETUJUI").length;
  const tidakLayak = filteredIzin.filter((i) => i.status === "DITOLAK").length;
  const totalPeserta = filteredPeserta.length;
  const izinAktif = filteredIzin.filter((i) =>
    ["DIAJUKAN", "VERIFIKASI"].includes(i.status),
  ).length;
  const rikkesTampil = hasFilter ? filteredRikkes : rikkes.slice(0, 6);
  const izinTampil = hasFilter ? filteredIzin : izin.slice(0, 5);

  function resetFilter() {
    setNama("");
    setSatuan("");
    setDariTanggal("");
    setSampaiTanggal("");
    setNomorPermohonan("");
    setStatusRikkes("");
    setPage(1);
  }

  return (
    <div>
      <section className="panel dashboard-filter-panel">
        <div className="panel-head">
          <div>
            <h2>Filter Dashboard</h2>
            <p>
              Semua filter berlaku bersama. Kartu ringkasan dan tabel
              memakai data peserta yang sama.
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
              list="dashboard-nomor"
              value={nomorPermohonan}
              onChange={(e) => setNomorPermohonan(e.target.value)}
              placeholder="Ketik nomor permohonan..."
            />
            <datalist id="dashboard-nomor">
              {daftarNomorPermohonan.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </div>

          <div className="field">
            <label htmlFor="filter-status">Status kelayakan</label>
            <select
              id="filter-status"
              value={statusRikkes}
              onChange={(e) => setStatusRikkes(e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="BELUM_MCU">Belum MCU</option>
              <option value="SUDAH_MCU">Sudah MCU</option>
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
          <strong>{totalPeserta}</strong>
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
        <div className="stat">
          <span>Peserta Belum MCU</span>
          <strong>{jumlahBelumMcu}</strong>
        </div>
        <div className="stat">
          <span>Peserta Sudah MCU</span>
          <strong>{jumlahSudahMcu}</strong>
        </div>
      </div>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Daftar Peserta</h2>
            <p>
              {hasFilter
                ? `${filteredPeserta.length} peserta sesuai filter.`
                : "Data peserta yang terdaftar di SATRIA."}{" "}
              {filteredPeserta.length > 0
                ? `Menampilkan ${startData}–${endData} dari ${filteredPeserta.length}.`
                : ""}
            </p>
          </div>
          <Link href="/peserta" className="btn-secondary">
            Lihat Semua
          </Link>
        </div>
        {pesertaTampil.length === 0 ? (
          <div className="empty">Tidak ada peserta sesuai filter.</div>
        ) : (
          <>
            <div className="table-wrap">
              <table style={{ minWidth: 1680 }}>
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>NRP</th>
                    <th>Pangkat</th>
                    <th>Jabatan</th>
                    <th>Satuan</th>
                    <th>Alamat Kantor</th>
                    <th>Nomor Permohonan</th>
                    <th>Status MCU</th>
                    <th>Tanggal MCU</th>
                    <th>Hasil MCU</th>
                    <th>Tanggal Lahir</th>
                    <th>Jenis Kelamin</th>
                    <th>No. HP</th>
                    <th>Keperluan</th>
                  </tr>
                </thead>
                <tbody>
                  {pesertaTampil.map((p) => {
                    const mcu = mcuTerbaruByPeserta.get(p.id);
                    return (
                    <tr key={p.id}>
                      <td>
                        <Link href={`/peserta/${p.id}`} className="linkish">
                          {p.nama}
                        </Link>
                      </td>
                      <td>{p.nrp}</td>
                      <td>{p.pangkat || "-"}</td>
                      <td>{p.jabatan || "-"}</td>
                      <td>{p.satuan || "-"}</td>
                      <td>{p.alamatKantor || "-"}</td>
                      <td>{p.nomorPermohonan || "-"}</td>
                      <td>
                        {mcu ? (
                          <span className="badge badge-info">Sudah MCU</span>
                        ) : (
                          <span className="badge badge-muted">Belum MCU</span>
                        )}
                      </td>
                      <td>{mcu ? formatDate(mcu.tanggalPemeriksaan) : "-"}</td>
                      <td>
                        {mcu ? <RikkesBadge value={mcu.hasil} /> : "-"}
                      </td>
                      <td>{formatDate(p.tanggalLahir)}</td>
                      <td>
                        {p.jenisKelamin === "P"
                          ? "Perempuan"
                          : p.jenisKelamin === "L"
                            ? "Laki-laki"
                            : "-"}
                      </td>
                      <td>{p.noHp || "-"}</td>
                      <td>{labelKeperluan(p.keperluan)}</td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {totalPages > 1 ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "1rem",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    color: "var(--satria-muted)",
                    fontSize: "0.85rem",
                  }}
                >
                  Halaman <strong>{page}</strong> dari{" "}
                  <strong>{totalPages}</strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                  }}
                >
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={page === 1}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    style={{ width: "auto" }}
                  >
                    ‹ Sebelumnya
                  </button>
                  {getPageNumbers().map((item, index) =>
                    item === "..." ? (
                      <span
                        key={`dots-${index}`}
                        style={{
                          padding: "0 0.4rem",
                          color: "var(--satria-muted)",
                        }}
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        className={
                          item === page ? "btn-primary" : "btn-secondary"
                        }
                        onClick={() => setPage(item as number)}
                        style={{
                          width: "40px",
                          minWidth: "40px",
                          padding: "0.5rem",
                        }}
                      >
                        {item}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={page === totalPages}
                    onClick={() =>
                      setPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    style={{ width: "auto" }}
                  >
                    Berikutnya ›
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </section>

      <section className="panel" style={{ marginTop: "1rem" }}>
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
