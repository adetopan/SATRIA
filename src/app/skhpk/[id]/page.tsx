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
  if (!session) redirect("/login");

  const { id } = await params;
  const [rikkesList, pesertaList] = await Promise.all([
    getRikkes(),
    getPeserta(),
  ]);

  const rikkes = rikkesList.find((r) => r.id === id);
  if (!rikkes) notFound();

  const peserta = pesertaList.find((p) => p.id === rikkes.pesertaId);
  if (!peserta) notFound();

  if (!canPrintSkhpk(rikkes) && rikkes.hasil !== "LAYAK") {
    return (
      <div className="skhpk-guard">
        <p>
          SKHPK hanya dapat dicetak jika hasil rikkes sudah disetujui
          (Layak / Memenuhi Syarat).
        </p>
        <Link href={`/peserta/${peserta.id}`}>Kembali ke data peserta</Link>
      </div>
    );
  }

  const nomor =
    rikkes.nomorSkhpk ||
    `SKHPK/ DRAFT /${new Date().getFullYear()}/DOKKES`;
  const tanggalTerbit = rikkes.tanggalTerbit || rikkes.tanggalPemeriksaan;
  const barcode =
    rikkes.barcodeValue || buildBarcodeValue(rikkes, peserta);
  const lulus = memenuhiSyarat(rikkes.hasil);
  const ditujukan = rikkes.ditujukanKepada || "As SDM Kapolri";

  return (
    <div className="skhpk-page">
      <div className="skhpk-toolbar no-print">
        <div>
          <p className="eyebrow">Cetakan Resmi SATRIA</p>
          <h1>Surat Keterangan Hasil Pemeriksaan Kesehatan</h1>
          <p>TTD diganti barcode verifikasi digital.</p>
        </div>
        <div className="actions">
          <Link href={`/peserta/${peserta.id}`} className="btn-secondary">
            Kembali
          </Link>
          <PrintButton />
        </div>
      </div>

      <article className="skhpk-sheet">
        <header className="skhpk-header">
          <div className="skhpk-header-text">
            <p>MARKAS BESAR</p>
            <p>KEPOLISIAN NEGARA REPUBLIK INDONESIA</p>
            <p>PUSAT KEDOKTERAN DAN KESEHATAN</p>
          </div>
          <Image
            src="/polri-logo.png"
            alt="Logo Polri"
            width={88}
            height={88}
            className="skhpk-logo"
            priority
          />
        </header>

        <div className="skhpk-title-block">
          <h2>SURAT KETERANGAN HASIL PEMERIKSAAN KESEHATAN</h2>
          <p>NOMOR: {nomor}</p>
        </div>

        <ol className="skhpk-body">
          <li>
            <span className="skhpk-point">1.</span>
            <p>
              Dasar: {SKHPK_DASAR}
            </p>
          </li>

          <li>
            <span className="skhpk-point">2.</span>
            <div>
              <p>Berdasarkan hasil pemeriksaan kesehatan terhadap:</p>
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
                    <td>{peserta.jabatan || "-"}</td>
                  </tr>
                  <tr>
                    <td>e.</td>
                    <td>kesatuan</td>
                    <td>:</td>
                    <td>{peserta.satuan || "-"}</td>
                  </tr>
                  <tr>
                    <td>f.</td>
                    <td>alamat kantor</td>
                    <td>:</td>
                    <td>{peserta.alamatKantor || "-"}</td>
                  </tr>
                </tbody>
              </table>

              <p className="skhpk-result">
                {lulus ? (
                  <>
                    <strong>Memenuhi</strong>/
                    <span className="strike">Tidak Memenuhi</span> Syarat untuk
                    memperoleh Surat Izin Pinjam Pakai Senjata Api.
                  </>
                ) : (
                  <>
                    <span className="strike">Memenuhi</span>/
                    <strong>Tidak Memenuhi</strong> Syarat untuk memperoleh
                    Surat Izin Pinjam Pakai Senjata Api.
                  </>
                )}
              </p>
            </div>
          </li>

          <li>
            <span className="skhpk-point">3.</span>
            <p>
              Surat Keterangan Hasil Pemeriksaan Kesehatan ini berlaku selama 1
              (satu) tahun sejak tanggal pemeriksaan.
            </p>
          </li>
        </ol>

        <div className="skhpk-closing">
          <p>
            Demikian surat keterangan ini dibuat untuk dipergunakan sebagaimana
            mestinya.
          </p>
        </div>

        <div className="skhpk-footer">
          <div className="skhpk-tujuan">
            <p>Kepada Yth.</p>
            <p>{ditujukan}</p>
            <p>di</p>
            <p>Jakarta</p>
          </div>

          <div className="skhpk-sign">
            <p>Jakarta, {formatLongDateId(tanggalTerbit)}</p>
            <p>{SKHPK_SIGNER.atasNama}</p>
            <p>{SKHPK_SIGNER.jabatan}</p>

            <div className="skhpk-barcode-box">
              <Barcode value={barcode} className="skhpk-barcode" />
              <p className="skhpk-barcode-caption">
                Tanda tangan elektronik / barcode verifikasi SATRIA
              </p>
            </div>

            <p className="skhpk-signer-name">{SKHPK_SIGNER.nama}</p>
            <p>{SKHPK_SIGNER.pangkat}</p>
          </div>
        </div>
      </article>
    </div>
  );
}
