import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getIzin, getPeserta, getRikkes } from "@/lib/db";
import { formatDate, labelKeperluan } from "@/lib/format";
import { IzinBadge, RikkesBadge } from "@/components/StatusBadge";

export default async function DashboardPage() {
  const session = await getSession();
  const [peserta, rikkes, izin] = await Promise.all([
    getPeserta(),
    getRikkes(),
    getIzin(),
  ]);

  const layak = peserta.filter((p) => p.statusRikkes === "LAYAK").length;
  const pending = peserta.filter((p) => p.statusRikkes === "PENDING").length;
  const izinAktif = izin.filter((i) =>
    ["DIAJUKAN", "VERIFIKASI"].includes(i.status),
  ).length;

  return (
    <div>
      <div className="grid-stats">
        <div className="stat">
          <span>Total Peserta</span>
          <strong>{peserta.length}</strong>
        </div>
        <div className="stat">
          <span>Hasil Rikkes Layak</span>
          <strong>{layak}</strong>
        </div>
        <div className="stat">
          <span>Menunggu MCU</span>
          <strong>{pending}</strong>
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
              <p>Data peserta yang terdaftar di SATRIA.</p>
            </div>
            <Link href="/peserta" className="btn-secondary">
              Lihat Semua
            </Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>NRP</th>
                  <th>Keperluan</th>
                  <th>Rikkes</th>
                </tr>
              </thead>
              <tbody>
                {peserta.slice(0, 5).map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link href={`/peserta/${p.id}`} className="linkish">
                        {p.nama}
                      </Link>
                      <div style={{ color: "var(--satria-muted)", fontSize: "0.8rem" }}>
                        {p.pangkat} · {p.satuan}
                      </div>
                    </td>
                    <td>{p.nrp}</td>
                    <td>{labelKeperluan(p.keperluan)}</td>
                    <td>
                      <RikkesBadge value={p.statusRikkes} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Upload MCU Terbaru</h2>
              <p>
                {session?.role === "mcu"
                  ? "Hasil rikkes yang Anda unggah ke SATRIA."
                  : "Hasil rikkes dari MCU RS Polri."}
              </p>
            </div>
            <Link href="/upload-mcu" className="btn-secondary">
              Upload
            </Link>
          </div>
          {rikkes.length === 0 ? (
            <div className="empty">Belum ada hasil MCU yang diunggah.</div>
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
                  {rikkes.slice(0, 6).map((r) => {
                    const p = peserta.find((x) => x.id === r.pesertaId);
                    return (
                      <tr key={r.id}>
                        <td>
                          {r.nomorSurat}
                          <div style={{ color: "var(--satria-muted)", fontSize: "0.8rem" }}>
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

      {session?.role === "admin" ? (
        <section className="panel" style={{ marginTop: "1rem" }}>
          <div className="panel-head">
            <div>
              <h2>Izin Senjata Api</h2>
              <p>Status permohonan izin yang terhubung dengan hasil rikkes.</p>
            </div>
            <Link href="/izin-senjata" className="btn-secondary">
              Kelola Izin
            </Link>
          </div>
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
                {izin.slice(0, 5).map((i) => {
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
        </section>
      ) : null}
    </div>
  );
}
