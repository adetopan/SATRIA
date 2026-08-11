import Link from "next/link";
import { getPeserta, getRikkes } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { RikkesBadge } from "@/components/StatusBadge";
import { UploadMcuForm } from "@/components/UploadMcuForm";

export default async function UploadMcuPage() {
  const [peserta, rikkes] = await Promise.all([getPeserta(), getRikkes()]);

  return (
    <div>
      <UploadMcuForm peserta={peserta} />

      <section className="panel" style={{ marginTop: "1rem" }}>
        <div className="panel-head">
          <div>
            <h2>Riwayat Upload MCU</h2>
            <p>
              Data pemeriksaan yang diunggah MCU. Status Layak / Tidak Layak
              ditentukan di menu Izin Senjata Api.
            </p>
          </div>
        </div>

        {rikkes.length === 0 ? (
          <div className="empty">Belum ada unggahan hasil MCU.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Peserta</th>
                  <th>Nomor Surat</th>
                  <th>Tanggal</th>
                  <th>Hasil</th>
                  <th>Diunggah Oleh</th>
                  <th>Berkas / SKHPK</th>
                </tr>
              </thead>
              <tbody>
                {rikkes.map((r) => {
                  const p = peserta.find((x) => x.id === r.pesertaId);
                  return (
                    <tr key={r.id}>
                      <td>
                        <strong>{p?.nama || "-"}</strong>
                        <div style={{ color: "var(--satria-muted)", fontSize: "0.8rem" }}>
                          NRP {p?.nrp || "-"}
                        </div>
                      </td>
                      <td>
                        {r.nomorSurat}
                        {r.nomorSkhpk ? (
                          <div style={{ color: "var(--satria-muted)", fontSize: "0.8rem" }}>
                            {r.nomorSkhpk}
                          </div>
                        ) : null}
                      </td>
                      <td>{formatDate(r.tanggalPemeriksaan)}</td>
                      <td>
                        <RikkesBadge value={r.hasil} />
                      </td>
                      <td>{r.uploadedByName}</td>
                      <td>
                        <div className="actions">
                          {r.filePath ? (
                            <a
                              href={r.filePath}
                              target="_blank"
                              rel="noreferrer"
                              className="linkish"
                            >
                              {r.fileName || "Berkas"}
                            </a>
                          ) : null}
                          {r.hasil === "LAYAK" ? (
                            <Link
                              href={`/skhpk/${r.id}`}
                              target="_blank"
                              className="btn-secondary"
                            >
                              Cetak SKHPK
                            </Link>
                          ) : null}
                        </div>
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
