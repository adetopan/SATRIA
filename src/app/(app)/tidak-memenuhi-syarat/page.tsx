import { notFound } from "next/navigation";
import { getIzin, getPeserta } from "@/lib/db";
import { formatDate } from "@/lib/format";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TidakMemenuhiSyaratPage({
  params,
}: Props) {
  const { id } = await params;

  /*
   * Ambil seluruh data izin
   */
  const izinList = await getIzin();

  const izin = izinList.find(
    (item) => item.id === id
  );

  if (!izin) {
    notFound();
  }

  /*
   * Ambil data peserta
   */
  const pesertaList = await getPeserta();

  const peserta = pesertaList.find(
    (item) => item.id === izin.pesertaId
  );

  if (!peserta) {
    notFound();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "#f5f7fa",
      }}
    >
      <div
        className="panel"
        style={{
          width: "100%",
          maxWidth: "700px",
          textAlign: "center",
        }}
      >
        {/* ===============================
            HEADER
        ================================ */}

        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            margin: "0 auto 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fee2e2",
            color: "#dc2626",
            fontSize: "2.5rem",
            fontWeight: "bold",
          }}
        >
          !
        </div>

        <h1
          style={{
            marginBottom: "0.75rem",
            color: "#b91c1c",
          }}
        >
          TIDAK MEMENUHI SYARAT
        </h1>

        <p
          style={{
            color: "var(--satria-muted)",
            lineHeight: 1.7,
            marginBottom: "1.5rem",
          }}
        >
          Berdasarkan hasil pemeriksaan dan proses
          pengajuan izin senjata api, peserta dinyatakan
          <strong> tidak memenuhi syarat </strong>
          untuk pengajuan izin senjata api.
        </p>

        {/* ===============================
            DATA PESERTA
        ================================ */}

        <div
          style={{
            textAlign: "left",
            background: "#f8fafc",
            borderRadius: "10px",
            padding: "1.25rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              marginBottom: "0.75rem",
              fontWeight: 700,
              fontSize: "1.1rem",
            }}
          >
            Data Peserta
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "160px 1fr",
              gap: "0.6rem",
            }}
          >
            <span>Nama</span>
            <strong>
              {peserta.nama || "-"}
            </strong>

            <span>NRP</span>
            <strong>
              {peserta.nrp || "-"}
            </strong>

            <span>Pangkat</span>
            <strong>
              {peserta.pangkat || "-"}
            </strong>

            <span>Satuan</span>
            <strong>
              {peserta.satuan || "-"}
            </strong>

            <span>Nomor Permohonan</span>
            <strong>
              {izin.nomorPermohonan || "-"}
            </strong>

            <span>Tanggal Pengajuan</span>
            <strong>
              {formatDate(
                izin.tanggalPengajuan
              )}
            </strong>

            <span>Status</span>
            <strong
              style={{
                color: "#dc2626",
              }}
            >
              DITOLAK
            </strong>
          </div>
        </div>

        {/* ===============================
            INFORMASI
        ================================ */}

        <div
          style={{
            padding: "1rem",
            borderRadius: "8px",
            background: "#fff7ed",
            border: "1px solid #fed7aa",
            color: "#9a3412",
            lineHeight: 1.6,
            marginBottom: "1.5rem",
          }}
        >
          Untuk informasi lebih lanjut mengenai hasil
          pengajuan dan proses selanjutnya, silakan
          menghubungi <strong>Bagian Samapta</strong>.
        </div>

        {/* ===============================
            FOOTER
        ================================ */}

        <p
          style={{
            fontSize: "0.85rem",
            color: "var(--satria-muted)",
          }}
        >
          Dokumen ini diterbitkan melalui sistem SATRIA.
        </p>
      </div>
    </main>
  );
}