import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getIzin, getPeserta } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { IzinBadge, RikkesBadge } from "@/components/StatusBadge";
import { IzinForm } from "@/components/IzinForm";
import { IzinStatusActions } from "@/components/IzinStatusActions";

export default async function IzinSenjataPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/dashboard");

  const [izin, peserta] = await Promise.all([getIzin(), getPeserta()]);

  return (
    <div>
      <IzinForm peserta={peserta} />

      <section className="panel" style={{ marginTop: "1rem" }}>
        <div className="panel-head">
          <div>
            <h2>Daftar Izin Senjata Api</h2>
            <p>
              Status izin mengikuti kelengkapan dan hasil rikkes peserta.
            </p>
          </div>
        </div>

        {izin.length === 0 ? (
          <div className="empty">Belum ada data izin senjata api.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nomor</th>
                  <th>Peserta</th>
                  <th>Jenis</th>
                  <th>Rikkes</th>
                  <th>Status Izin</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {izin.map((i) => {
                  const p = peserta.find((x) => x.id === i.pesertaId);
                  return (
                    <tr key={i.id}>
                      <td>
                        {i.nomorPermohonan}
                        <div style={{ color: "var(--satria-muted)", fontSize: "0.8rem" }}>
                          {formatDate(i.tanggalPengajuan)}
                        </div>
                      </td>
                      <td>
                        <strong>{p?.nama || "-"}</strong>
                        <div style={{ color: "var(--satria-muted)", fontSize: "0.8rem" }}>
                          {p?.satuan || "-"}
                        </div>
                      </td>
                      <td>
                        {i.jenisSenjata}
                        <div style={{ color: "var(--satria-muted)", fontSize: "0.8rem" }}>
                          {i.keperluan}
                        </div>
                      </td>
                      <td>
                        <RikkesBadge value={p?.statusRikkes || "PENDING"} />
                      </td>
                      <td>
                        <IzinBadge value={i.status} />
                      </td>
                      <td>
                        <IzinStatusActions id={i.id} status={i.status} />
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
