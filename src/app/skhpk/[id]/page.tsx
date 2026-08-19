import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Barcode } from "@/components/Barcode";
import { PrintButton } from "@/components/PrintButton";
import { getSession } from "@/lib/auth";
import { getPeserta, getRikkes } from "@/lib/db";
import {
  SKHPK_DASAR,
  SKHPK_SIGNER,
  buildBarcodeValue,
  canPrintSkhpk,
  formatLongDateId,
  memenuhiSyarat,
} from "@/lib/skhpk";
import "./skhpk.css";

type Params = { params: Promise<{ id: string }> };

export default async function SkhpkPage({ params }: Params) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

  const [rikkesList, pesertaList] = await Promise.all([
    getRikkes(),
    getPeserta(),
  ]);

  const rikkes = rikkesList.find((r) => r.id === id);

  if (!rikkes) {
    notFound();
  }

  const peserta = pesertaList.find((p) => p.id === rikkes.pesertaId);

  if (!peserta) {
    notFound();
  }

  if (!canPrintSkhpk(rikkes) && rikkes.hasil !== "LAYAK") {
    return (
      <div className="skhpk-guard">
        <p>
          SKHPK hanya dapat dicetak jika hasil rikkes sudah disetujui
          (Layak / Memenuhi Syarat).
        </p>

        <Link href={`/peserta/${peserta.id}`}>
          Kembali ke data peserta
        </Link>
      </div>
    );
  }

  const nomor =
    rikkes.nomorSkhpk ||
    `SKHPK/ DRAFT /${new Date().getFullYear()}/DOKKES`;

  const tanggalTerbit =
    rikkes.tanggalTerbit || rikkes.tanggalPemeriksaan;

  const barcode =
    rikkes.barcodeValue ||
    buildBarcodeValue(rikkes, peserta);

  const lulus = memenuhiSyarat(rikkes.hasil);

  const ditujukan =
    rikkes.ditujukanKepada || "As SDM Kapolri";

  return (
    <div className="skhpk-page">

      {/* ================= TOOLBAR ================= */}
      <div className="skhpk-toolbar no-print">
        <div>
          <p className="eyebrow">Cetakan Resmi SATRIA</p>

          <h1>
            Surat Keterangan Hasil Pemeriksaan Kesehatan
          </h1>

          <p>
            TTD diganti barcode verifikasi digital.
          </p>
        </div>

        <div className="actions">
          <Link
            href={`/peserta/${peserta.id}`}
            className="btn-secondary"
          >
            Kembali
          </Link>

          <PrintButton />
        </div>
      </div>

      {/* ================= SURAT ================= */}
      <article className="skhpk-sheet">

        {/* ================= KOP ================= */}
        {/* <header className="skhpk-header">
          <div className="skhpk-header-text">
            <p>MARKAS BESAR</p>
            <p>KEPOLISIAN NEGARA REPUBLIK INDONESIA</p>
            <p>PUSAT KEDOKTERAN DAN KESEHATAN</p>
          </div>

        </header> */}

        <header className="skhpk-header">

          <div className="skhpk-header-text">
            <p>MARKAS BESAR</p>
            <p>KEPOLISIAN NEGARA REPUBLIK INDONESIA</p>
            <p>PUSAT KEDOKTERAN DAN KESEHATAN</p>
          </div>
        </header>

        

        {/* ================= JUDUL ================= */}
        <div className="skhpk-title-block">
          <div className="skhpk-logo-wrapper">
            <Image
              src="/polri-logo.png"
              alt="Logo Polri"
              width={70}
              height={70}
              className="skhpk-logo"
              priority
            />
          </div>
          <h2>
            SURAT KETERANGAN HASIL PEMERIKSAAN KESEHATAN
          </h2>

          <p>
            NOMOR: {nomor}
          </p>

        </div>

        {/* ================= ISI SURAT ================= */}
        <div className="skhpk-body">

          {/* POINT 1 */}
          <div className="skhpk-row">

            <div className="skhpk-number">
              1.
            </div>

            <div className="skhpk-content">

              <p>
                {SKHPK_DASAR}
              </p>

            </div>

          </div>

          {/* POINT 2 */}
          <div className="skhpk-row">

            <div className="skhpk-number">
              2.
            </div>

            <div className="skhpk-content">

              <p>
                Dengan ini menerangkan bahwa hasil pemeriksaan
                terhadap:
              </p>

              <table className="skhpk-bio">
                <tbody>

                  <tr>
                    <td>a.</td>
                    <td>nama</td>
                    <td>:</td>
                    <td>{peserta.nama}</td>
                  </tr>

                  <tr>
                    <td>b.</td>
                    <td>jenis kelamin</td>
                    <td>:</td>
                    <td>
                      {peserta.jenisKelamin === "L"
                        ? "Laki - Laki"
                        : "Perempuan"}
                    </td>
                  </tr>

                  <tr>
                    <td>c.</td>
                    <td>pangkat/NRP</td>
                    <td>:</td>
                    <td>
                      {peserta.pangkat}/{peserta.nrp}
                    </td>
                  </tr>

                  <tr>
                    <td>d.</td>
                    <td>jabatan</td>
                    <td>:</td>
                    <td>
                      {peserta.jabatan || "-"}
                    </td>
                  </tr>

                  <tr>
                    <td>e.</td>
                    <td>kesatuan</td>
                    <td>:</td>
                    <td>
                      {peserta.satuan || "-"}
                    </td>
                  </tr>

                  <tr>
                    <td>f.</td>
                    <td>alamat kantor</td>
                    <td>:</td>
                    <td>
                      {peserta.alamatKantor || "-"}
                    </td>
                  </tr>

                </tbody>
              </table>

              <p className="skhpk-dinyatakan">
                Yang bersangkutan dinyatakan:
              </p>

              <p className="skhpk-result">

                {lulus ? (
                  <>
                    <strong>Memenuhi</strong>
                    <span> / </span>
                    <span className="strike">
                      Tidak Memenuhi
                    </span>
                  </>
                ) : (
                  <>
                    <span className="strike">
                      Memenuhi
                    </span>
                    <span> / </span>
                    <strong>Tidak Memenuhi</strong>
                  </>
                )}

                {" "}Syarat untuk mendapatkan Surat Izin Pinjam
                Pakai Senjata Api / Surat Izin Pakai dan Membawa
                Senjata Api.

              </p>

            </div>

          </div>

          {/* POINT 3 */}
          <div className="skhpk-row">

            <div className="skhpk-number">
              3.
            </div>

            <div className="skhpk-content">

              <p>
                Hasil pemeriksaan kesehatan ini berlaku selama
                1 (satu) tahun sejak dilakukan pemeriksaan,
                apabila di kemudian hari ternyata terdapat
                kekeliruan, surat keterangan hasil penelitian
                ini akan dicabut.
              </p>

            </div>

          </div>

        </div>

        {/* ================= PENUTUP ================= */}
        <div className="skhpk-closing">

          <p>
            Demikian surat keterangan ini dibuat untuk
            dipergunakan sebagaimana mestinya.
          </p>

        </div>

        {/* ================= FOOTER ================= */}
        <div className="skhpk-footer">

          {/* KEPADA */}
          <div className="skhpk-tujuan">

            <p>
              Kepada Yth.:
            </p>

            <p>
              {ditujukan}
            </p>

            <p>
              di
            </p>

            <p>
              Jakarta
            </p>

          </div>

          {/* TANDA TANGAN */}
          <div className="skhpk-sign">

            <p className="skhpk-place">
              Dikeluarkan di: Jakarta
            </p>

            <p>
              pada tanggal: {formatLongDateId(tanggalTerbit)}
            </p>

            <p className="skhpk-sign-title">
              a.n. KEPALA PUSAT KEDOKTERAN DAN KESEHATAN POLRI
            </p>

            <p className="skhpk-sign-position">
              KAROKESPOL
            </p>

            {/* BARCODE */}
            <div className="skhpk-barcode-box">

              <Barcode
                value={barcode}
                className="skhpk-barcode"
              />

              <p className="skhpk-barcode-caption">
                Tanda tangan elektronik / barcode verifikasi SATRIA
              </p>

            </div>

            {/* NAMA */}
            <p className="skhpk-signer-name">
              {SKHPK_SIGNER.nama}
            </p>

            <p className="skhpk-signer-rank">
              {SKHPK_SIGNER.pangkat}
            </p>

          </div>

        </div>

      </article>

    </div>
  );
}