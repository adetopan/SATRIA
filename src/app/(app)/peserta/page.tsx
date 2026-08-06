import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getPeserta } from "@/lib/db";
import { labelKeperluan } from "@/lib/format";
import { IzinBadge, RikkesBadge } from "@/components/StatusBadge";
import { PesertaForm } from "@/components/PesertaForm";

export default async function PesertaPage() {
  const session = await getSession();
  const peserta = await getPeserta();
  const isAdmin = session?.role === "admin";

  return (
    <div>
      {isAdmin ? <PesertaForm /> : null}

      <section className="panel" style={{ marginTop: isAdmin ? "1rem" : 0 }}>
        <div className="panel-head">
          <div>
            <h2>Daftar Peserta</h2>
            <p>
              Nama peserta terdaftar untuk proses rikkes dan izin senjata api.
            </p>
          </div>
        </div>

        {peserta.length === 0 ? (
          <div className="empty">Belum ada data peserta.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>NRP</th>
                  <th>Satuan</th>
                  <th>Keperluan</th>
                  <th>Rikkes</th>
                  <th>Izin</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {peserta.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.nama}</strong>
                      <div style={{ color: "var(--satria-muted)", fontSize: "0.8rem" }}>
                        {p.pangkat} · {p.jabatan}
                      </div>
                    </td>
                    <td>{p.nrp}</td>
                    <td>{p.satuan}</td>
                    <td>{labelKeperluan(p.keperluan)}</td>
                    <td>
                      <RikkesBadge value={p.statusRikkes} />
                    </td>
                    <td>
                      <IzinBadge value={p.statusIzin} />
                    </td>
                    <td>
                      <Link href={`/peserta/${p.id}`} className="linkish">
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
