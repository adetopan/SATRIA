import { PrintButton } from "@/components/PrintButton";
import { formatDateTime } from "@/lib/format";
import type { ManfaatBaris, ManfaatEfisiensiLaporan } from "@/lib/manfaat-efisiensi";

function badgeClass(nada?: ManfaatBaris["nada"]) {
  if (nada === "ok") return "badge badge-ok";
  if (nada === "bad") return "badge badge-bad";
  if (nada === "wait") return "badge badge-wait";
  return "badge badge-info";
}

function maxBar(values: number[]) {
  return Math.max(1, ...values);
}

export function ManfaatEfisiensiView({
  laporan,
}: {
  laporan: ManfaatEfisiensiLaporan;
}) {
  const funnelSegmen = [
    { key: "disetujui", label: "Disetujui", n: laporan.funnel.disetujui },
    { key: "ditolak", label: "Ditolak", n: laporan.funnel.ditolak },
    { key: "izin", label: "Izin berjalan", n: laporan.funnel.izinBerjalan },
    { key: "mcu", label: "MCU tanpa izin", n: laporan.funnel.mcuTanpaIzin },
    { key: "belum", label: "Belum MCU", n: laporan.funnel.belumMcu },
  ].filter((item) => item.n > 0);

  const totalFunnel = Math.max(
    laporan.peserta,
    funnelSegmen.reduce((sum, item) => sum + item.n, 0),
  );
  const maxAksi = maxBar(laporan.aksi.map((item) => item.n));
  const maxHarian = maxBar(laporan.harian.map((item) => item.n));

  return (
    <div className="manfaat-efisiensi">
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Manfaat &amp; Efisiensi</h2>
            <p>
              Angka dihitung langsung dari data SATRIA, tanpa identitas
              personel. Diperbarui {formatDateTime(laporan.dibuatPada)}.
            </p>
          </div>
          <div className="no-print">
            <PrintButton label="Cetak laporan" />
          </div>
        </div>
        <p className="manfaat-catatan">
              Halaman ini menampilkan bukti operasional: berapa peserta tercatat,
              berapa yang sudah MCU, berapa izin tertaut hasil periksa, dan jejak
              kerja petugas. Angka dihitung ulang setiap kali menu ini dibuka.
        </p>
      </section>

      <div className="grid-stats grid-stats-4">
        <div className="stat">
          <span>Peserta tercatat</span>
          <strong>{laporan.peserta}</strong>
        </div>
        <div className="stat">
          <span>Hasil MCU</span>
          <strong>{laporan.rikkes}</strong>
        </div>
        <div className="stat">
          <span>Berkas izin</span>
          <strong>{laporan.izin}</strong>
        </div>
        <div className="stat">
          <span>Jejak aksi petugas</span>
          <strong>{laporan.logs}</strong>
        </div>
      </div>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Alur kerja yang berjalan</h2>
            <p>
              {laporan.peserta} peserta dipetakan ke tahap MCU dan izin.
            </p>
          </div>
        </div>
        {totalFunnel === 0 ? (
          <p className="empty">Belum ada data peserta.</p>
        ) : (
          <>
            <div className="manfaat-funnel" aria-label="Funnel peserta">
              {funnelSegmen.map((item) => (
                <div
                  key={item.key}
                  className={`manfaat-funnel-seg manfaat-funnel-${item.key}`}
                  style={{ flexGrow: item.n, flexBasis: 0 }}
                  title={`${item.label}: ${item.n}`}
                >
                  {item.n}
                </div>
              ))}
            </div>
            <ul className="manfaat-legend">
              {funnelSegmen.map((item) => (
                <li key={item.key}>
                  <span className={`manfaat-dot manfaat-funnel-${item.key}`} />
                  {item.label}: {item.n}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Waktu respon layanan</h2>
            <p>
              {laporan.respon.catatan} Contoh: 4, 5, dan 11 hari → nilai
              tengahnya 5 hari.
            </p>
          </div>
        </div>

        <ol className="manfaat-respon-alur">
          <li>
            <span>1</span>
            <strong>Peserta terbit</strong>
            <small>Data masuk SATRIA</small>
          </li>
          <li className="manfaat-respon-panah" aria-hidden="true">
            {laporan.respon.pesertaKeMcu.n
              ? laporan.respon.pesertaKeMcu.median
              : "—"}
          </li>
          <li>
            <span>2</span>
            <strong>Hasil MCU</strong>
            <small>Pemeriksaan tercatat</small>
          </li>
          <li className="manfaat-respon-panah" aria-hidden="true">
            {laporan.respon.mcuKeIzin.n ? laporan.respon.mcuKeIzin.median : "—"}
          </li>
          <li>
            <span>3</span>
            <strong>Izin senjata</strong>
            <small>Disetujui atau ditolak</small>
          </li>
        </ol>

        <div className="grid-stats grid-stats-3">
          <div className="stat">
            <span>Peserta → MCU</span>
            <strong>{laporan.respon.pesertaKeMcu.median}</strong>
            <em>{laporan.respon.pesertaKeMcu.n} berkas · nilai tengah</em>
          </div>
          <div className="stat">
            <span>MCU → izin</span>
            <strong>{laporan.respon.mcuKeIzin.median}</strong>
            <em>{laporan.respon.mcuKeIzin.n} putusan · nilai tengah</em>
          </div>
          <div className="stat">
            <span>Peserta → izin</span>
            <strong>{laporan.respon.pesertaKeIzin.median}</strong>
            <em>{laporan.respon.pesertaKeIzin.n} siklus lengkap · nilai tengah</em>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tahap</th>
                <th>Berkas</th>
                <th>Nilai tengah</th>
                <th>Rata-rata</th>
                <th>Tercepat</th>
                <th>Terlama</th>
              </tr>
            </thead>
            <tbody>
              {[
                laporan.respon.pesertaKeMcu,
                laporan.respon.mcuKeIzin,
                laporan.respon.pesertaKeIzin,
              ].map((row) => (
                <tr key={row.tahap}>
                  <td>
                    {row.tahap}
                    <div className="manfaat-catatan">
                      {row.dari} → {row.ke}
                    </div>
                  </td>
                  <td>{row.n}</td>
                  <td>
                    <span className="badge badge-info">{row.median}</span>
                  </td>
                  <td>{row.rata}</td>
                  <td>{row.tercepat}</td>
                  <td>{row.terlama}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="manfaat-legend" style={{ marginTop: "1rem" }}>
          <li>{laporan.respon.menungguMcu}</li>
          <li>{laporan.respon.menungguIzin}</li>
        </ul>

        <div className="panel-head" style={{ marginTop: "1.2rem" }}>
          <div>
            <h2>Tanggal inputan</h2>
            <p>
              Tanggal dan jam data peserta diinput, hasil MCU masuk, dan
              izin diputus.
            </p>
          </div>
        </div>
        {laporan.respon.rincian.length === 0 ? (
          <p className="empty">Belum ada data peserta.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Peserta</th>
                  <th>Tgl & jam input peserta</th>
                  <th>Tgl & jam input MCU</th>
                  <th>Tgl & jam putusan izin</th>
                  <th>Peserta → MCU</th>
                  <th>MCU → izin</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {laporan.respon.rincian.map((row) => (
                  <tr key={row.id}>
                    <td>{row.nama}</td>
                    <td>{row.tglPeserta}</td>
                    <td>{row.tglMcu}</td>
                    <td>{row.tglIzin}</td>
                    <td>{row.hariPesertaKeMcu}</td>
                    <td>{row.hariMcuKeIzin}</td>
                    <td>{row.hariTotal}</td>
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
            <h2>Efisiensi yang terukur</h2>
            <p>{laporan.catatanJeda}</p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Indikator</th>
                <th>Nilai</th>
                <th>Arti</th>
              </tr>
            </thead>
            <tbody>
              {laporan.efisiensi.map((row) => (
                <tr key={row.indikator}>
                  <td>{row.indikator}</td>
                  <td>
                    <span className={badgeClass(row.nada)}>{row.nilai}</span>
                  </td>
                  <td>{row.arti}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Kelengkapan data</h2>
            <p>
              Celah input ikut ditampilkan. Itu bagian dari bukti otentik.
            </p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Kolom</th>
                <th>Terisi</th>
                <th>Catatan</th>
              </tr>
            </thead>
            <tbody>
              {laporan.kelengkapan.map((row) => (
                <tr key={row.indikator}>
                  <td>{row.indikator}</td>
                  <td>
                    <span className={badgeClass(row.nada)}>{row.nilai}</span>
                  </td>
                  <td>{row.arti}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="split-2">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Jenis aksi petugas</h2>
              <p>Dihitung dari log aktivitas.</p>
            </div>
          </div>
          {laporan.aksi.length === 0 ? (
            <p className="empty">Belum ada jejak aksi.</p>
          ) : (
            <ul className="manfaat-bars">
              {laporan.aksi.map((item) => (
                <li key={item.aksi}>
                  <div className="manfaat-bar-meta">
                    <span>{item.label}</span>
                    <strong>{item.n}</strong>
                  </div>
                  <div className="manfaat-bar-track">
                    <div
                      className="manfaat-bar-fill"
                      style={{ width: `${(item.n / maxAksi) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Aktivitas per hari</h2>
              <p>Zona waktu Asia/Jakarta.</p>
            </div>
          </div>
          {laporan.harian.length === 0 ? (
            <p className="empty">Belum ada aktivitas harian.</p>
          ) : (
            <ul className="manfaat-bars">
              {laporan.harian.map((item) => (
                <li key={item.hari}>
                  <div className="manfaat-bar-meta">
                    <span>{item.hari}</span>
                    <strong>{item.n}</strong>
                  </div>
                  <div className="manfaat-bar-track">
                    <div
                      className="manfaat-bar-fill"
                      style={{ width: `${(item.n / maxHarian) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
