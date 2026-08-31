import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { isStaffAdmin } from "@/lib/roles";
import { getIzin, getPeserta, getRikkes } from "@/lib/db";
import { formatDate, labelKeperluan } from "@/lib/format";
import { IzinBadge, RikkesBadge } from "@/components/StatusBadge";
import { PesertaForm } from "@/components/PesertaForm";
import { canPrintSkhpk } from "@/lib/skhpk";

type Params = { params: Promise<{ id: string }> };

export default async function PesertaDetailPage({ params }: Params) {
  const { id } = await params;
  const session = await getSession();
  const [pesertaList, rikkesAll, izinAll] = await Promise.all([
    getPeserta(),
    getRikkes(),
    getIzin(),
  ]);

  const peserta = pesertaList.find((p) => p.id === id);
  if (!peserta) notFound();

  const rikkes = rikkesAll.filter((r) => r.pesertaId === id);
  const izin = izinAll.filter((i) => i.pesertaId === id);

  return (
    <div>
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>{peserta.nama}</h2>
            <p>
              NRP {peserta.nrp} · {peserta.pangkat} · {peserta.satuan}
            </p>
          </div>
          <Link href="/peserta" className="btn-secondary">
            Kembali
          </Link>
        </div>

        <dl className="detail-list">
          <div>
            <dt>Jabatan</dt>
            <dd>{peserta.jabatan || "-"}</dd>
          </div>
          <div>
            <dt>Alamat Kantor</dt>
            <dd>{peserta.alamatKantor || "-"}</dd>
          </div>
          <div>
            <dt>Tanggal Lahir</dt>
            <dd>{formatDate(peserta.tanggalLahir)}</dd>
          </div>
          <div>
            <dt>Jenis Kelamin</dt>
            <dd>{peserta.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}</dd>
          </div>
          <div>
            <dt>No. HP</dt>
            <dd>{peserta.noHp || "-"}</dd>
          </div>
          <div>
            <dt>Keperluan</dt>
            <dd>{labelKeperluan(peserta.keperluan)}</dd>
          </div>
          {/* <div>
            <dt>Status Rikkes</dt>
            <dd>
              <RikkesBadge value={peserta.statusRikkes} />
            </dd>
          </div>
          <div>
            <dt>Status Izin</dt>
            <dd>
              <IzinBadge value={peserta.statusIzin} />
            </dd>
          </div> */}
        </dl>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Riwayat Hasil Rikkes</h2>
            <p>Dokumen dan hasil yang diunggah MCU RS Polri.</p>
          </div>
          <Link href="/upload-mcu" className="btn-secondary">
            Upload MCU
          </Link>
        </div>
        {rikkes.length === 0 ? (
          <div className="empty">Belum ada hasil rikkes untuk peserta ini.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nomor Surat</th>
                  <th>Tanggal</th>
                  <th>Dokter</th>
                  <th>Hasil</th>
                  <th>Berkas / SKHPK</th>
                </tr>
              </thead>
              <tbody>
                {rikkes.map((r) => (
                  <tr key={r.id}>
                    <td>
                      {r.nomorSurat}
                      <div style={{ color: "var(--satria-muted)", fontSize: "0.8rem" }}>
                        {r.rumahSakit}
                      </div>
                      {r.nomorSkhpk ? (
                        <div style={{ color: "var(--satria-muted)", fontSize: "0.8rem" }}>
                          {r.nomorSkhpk}
                        </div>
                      ) : null}
                    </td>
                    <td>{formatDate(r.tanggalPemeriksaan)}</td>
                    <td>{r.dokter}</td>
                    <td>
                      <RikkesBadge value={r.hasil} />
                    </td>
                    <td>
                      <div className="actions">
                        {r.filePath ? (
                          <a
                            href={r.filePath}
                            target="_blank"
                            rel="noreferrer"
                            className="linkish"
                          >
                            Berkas MCU
                          </a>
                        ) : null}
                        {r.hasil === "LAYAK" || canPrintSkhpk(r) ? (
                          <Link
                            href={`/skhpk/${r.id}`}
                            target="_blank"
                            className="btn-secondary"
                          >
                            Cetak SKHPK
                          </Link>
                        ) : (
                          <span style={{ color: "var(--satria-muted)" }}>
                            Belum disetujui
                          </span>
                        )}
                      </div>
                    </td>
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
            <h2>Izin Senjata Api</h2>
            <p>Permohonan yang terkait peserta ini.</p>
          </div>
        </div>
        {izin.length === 0 ? (
          <div className="empty">Belum ada pengajuan izin senjata api.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nomor</th>
                  <th>Jenis</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {izin.map((i) => {
                  const linkedRikkes = rikkes.find((r) => r.id === i.rikkesId);
                  const canCetak =
                    i.status === "DISETUJUI" &&
                    linkedRikkes &&
                    (linkedRikkes.hasil === "LAYAK" || canPrintSkhpk(linkedRikkes));

                  return (
                    <tr key={i.id}>
                      <td>{i.nomorPermohonan}</td>
                      <td>{i.jenisSenjata}</td>
                      <td>{formatDate(i.tanggalPengajuan)}</td>
                      <td>
                        <IzinBadge value={i.status} />
                      </td>
                      <td>
                        {canCetak && linkedRikkes ? (
                          <Link
                            href={`/skhpk/${linkedRikkes.id}`}
                            target="_blank"
                            className="btn-secondary"
                            style={{ whiteSpace: "nowrap" }}
                          >
                            Cetak SKHPK
                          </Link>
                        ) : (
                          <span style={{ color: "var(--satria-muted)" }}>
                            {i.status === "DISETUJUI"
                              ? "SKHPK belum tersedia"
                              : "—"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isStaffAdmin(session?.role) ? (
        <div style={{ marginTop: "1rem" }}>
          <PesertaForm
            initial={peserta}
            mode="edit"
            existingPeserta={pesertaList}
          />
        </div>
      ) : null}
    </div>
  );
}
