import type { ReactNode } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getRikkes, resolveSkhpkSigner } from "@/lib/db";
import { formatShortDateId, signerTtdSrc } from "@/lib/skhpk";
import "./ttd.css";

type Params = { params: Promise<{ id: string }> };

function Field({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="ttd-field">
      <span>{label}</span>
      <span>:</span>
      <div>{value}</div>
    </div>
  );
}

export default async function SpecimenTtdPage({ params }: Params) {
  const { id } = await params;
  const rikkesList = await getRikkes();
  const rikkes = rikkesList.find((r) => r.id === id);
  if (!rikkes) notFound();

  const signer = await resolveSkhpkSigner(rikkes);
  const tanggal =
    rikkes.tanggalTerbit || rikkes.tanggalPemeriksaan;

  return (
    <main className="ttd-page">
      <section className="ttd-card">
        <header className="ttd-header">
          <Image
            src="/polri-logo.png"
            alt="Logo Polri"
            width={72}
            height={72}
            className="ttd-logo"
            priority
          />

          <div className="ttd-header-text">
            <p>MARKAS BESAR</p>
            <p>KEPOLISIAN NEGARA REPUBLIK INDONESIA</p>
            <p>PUSAT KEDOKTERAN DAN KESEHATAN</p>
          </div>
        </header>

        <div className="ttd-grid">
          <div className="ttd-col">
            <Field label="NRP" value={signer.nrp} />
            <Field label="Nama Pegawai" value={signer.nama} />
            <Field label="Pangkat" value={signer.pangkat} />
            <Field label="Satuan" value={signer.satuan} />
            <Field
              label="Tanda Tangan"
              value={
                <div className="ttd-sign-box">
                  <Image
                    src={signerTtdSrc(signer)}
                    alt={`Specimen tanda tangan ${signer.nama}`}
                    width={160}
                    height={90}
                    className="ttd-sign-image"
                    unoptimized
                    priority
                  />
                </div>
              }
            />
          </div>

          <div className="ttd-col">
            <Field label="Jabatan" value={signer.jabatan} />
            <Field
              label="Jenis Kelamin"
              value={signer.jenisKelamin}
            />
            <Field
              label="Status Pegawai"
              value={signer.status}
            />
            <Field
              label="Nomor SKHPK"
              value={rikkes.nomorSkhpk || "-"}
            />
          </div>
        </div>

        <p className="ttd-footer">
          SURAT KETERANGAN HASIL PEMERIKSAAN KESEHATAN INI
          DITANDA TANGANI OLEH {signer.nama} DI MARKAS BESAR
          KEPOLISIAN NEGARA REPUBLIK INDONESIA, PUSAT KEDOKTERAN
          DAN KESEHATAN, JAKARTA. PADA TANGGAL{" "}
          {formatShortDateId(tanggal)}.
        </p>
      </section>
    </main>
  );
}
