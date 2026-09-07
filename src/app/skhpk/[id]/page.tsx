import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/PrintButton";
import { QrCode } from "@/components/QrCode";
import { SkhpkUnlockForm } from "@/components/SkhpkUnlockForm";
import { SkhpkWatermark } from "@/components/SkhpkWatermark";
import { getAppOrigin } from "@/lib/app-url";
import { getSession } from "@/lib/auth";
import { getIzin, getPeserta, getRikkes, resolveSkhpkSigner } from "@/lib/db";
import { hasSkhpkAccess } from "@/lib/skhpk-access";
import {
  SKHPK_DASAR,
  canPrintSkhpk,
  formatLongDateId,
  memenuhiSyarat,
} from "@/lib/skhpk";
import "./skhpk.css";

type Params = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tanpaTtd?: string | string[]; mcu?: string | string[] }>;
};

function isFlagParam(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return ["1", "true", "ya"].includes(String(raw || "").toLowerCase());
}

function isImageBerkas(path: string) {
  return /\.(jpe?g|png|webp)$/i.test(path);
}

export default async function SkhpkPage({ params, searchParams }: Params) {
  const { id } = await params;
  const query = await searchParams;
  const tanpaTtd = isFlagParam(query.tanpaTtd);
  const tampilkanMcu = isFlagParam(query.mcu);
  const [session, rikkesList, pesertaList, izinList] = await Promise.all([
    getSession(),
    getRikkes(),
    getPeserta(),
    getIzin(),
  ]);

  const rikkes = rikkesList.find((r) => r.id === id);
  if (!rikkes) {
    notFound();
  }

  const unlocked = session ? true : await hasSkhpkAccess(id);
  if (!unlocked) {
    return <SkhpkUnlockForm rikkesId={id} />;
  }

  const peserta = pesertaList.find((p) => p.id === rikkes.pesertaId);

  if (!peserta) {
    notFound();
  }

  const bolehLihatSkhpk =
    canPrintSkhpk(rikkes) ||
    rikkes.hasil === "LAYAK" ||
    Boolean(tanpaTtd && session);

  if (!bolehLihatSkhpk) {
    return (
      <div className="skhpk-guard">
        <p>
          SKHPK hanya dapat dicetak jika hasil rikkes sudah disetujui
          (Layak / Memenuhi Syarat).
        </p>

        {session ? (
          <Link href={`/peserta/${peserta.id}`}>
            Kembali ke data peserta
          </Link>
        ) : null}
      </div>
    );
  }

  const nomor =
    rikkes.nomorSkhpk ||
    `SKHPK/ DRAFT /${new Date().getFullYear()}/DOKKES`;

  const tanggalTerbit =
    rikkes.tanggalTerbit || rikkes.tanggalPemeriksaan;

  const signer = await resolveSkhpkSigner(rikkes);
  const origin = await getAppOrigin();
  const qrUrl = `${origin}/ttd/${rikkes.id}`;

  const lulus = memenuhiSyarat(rikkes.hasil);

  const izin =
    izinList.find((item) => item.rikkesId === rikkes.id) ||
    izinList
      .filter((item) => item.pesertaId === rikkes.pesertaId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

  const ditujukan =
    izin?.ditujukanKepada?.trim() ||
    rikkes.ditujukanKepada?.trim() ||
    "As SDM Kapolri";

  const rujukanB = izin?.nomorPermohonan?.trim() || "-";

  return (
    <div className="skhpk-page">

      {/* ================= TOOLBAR ================= */}
      <div className="skhpk-toolbar no-print">
        <div className="skhpk-toolbar-copy">
          <p className="eyebrow">
            {tampilkanMcu ? "SKHPK & Berkas MCU" : "Cetakan Resmi SATRIA"}
          </p>

          <h1>
            {tampilkanMcu
              ? "Surat Keterangan Hasil Pemeriksaan Kesehatan dan Berkas MCU"
              : "Surat Keterangan Hasil Pemeriksaan Kesehatan"}
          </h1>

          <p>
            {tampilkanMcu
              ? "SKHPK ditampilkan lebih dulu, lalu berkas hasil MCU di halaman berikutnya."
              : tanpaTtd
                ? "Pratinjau SKHPK tanpa tanda tangan digital (QR)."
                : session
                  ? "TTD diganti QR code specimen tanda tangan."
                  : "Gunakan tombol Cetak untuk menyimpan atau mencetak surat."}
          </p>
        </div>

        <div className="actions">
          {session ? (
            <Link
              href={`/peserta/${peserta.id}`}
              className="btn-secondary"
            >
              Kembali
            </Link>
          ) : null}

          <PrintButton
            label={tanpaTtd ? "Cetak tanpa TTD" : "Cetak SKHPK"}
          />
        </div>
      </div>

      {/* ================= SURAT ================= */}
      <div className="skhpk-preview">
        <div className="skhpk-stage">
          <article className="skhpk-sheet">
        <SkhpkWatermark />

        {/* ================= KOP ================= */}
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
            <div className="skhpk-number">1.</div>
            <div className="skhpk-content">
              <p>Rujukan:</p>
              <div className="skhpk-rujukan">
                <div className="skhpk-rujukan-item">
                  <span>a.</span>
                  <p>{SKHPK_DASAR}</p>
                </div>
                <div className="skhpk-rujukan-item">
                  <span>b.</span>
                  <p>{rujukanB}</p>
                </div>
              </div>
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

            {/* <p>
              di
            </p>

            <p>
              Jakarta
            </p> */}

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
              {signer.atasNama}
            </p>

            <p className="skhpk-sign-position">
              {signer.jabatan}
            </p>

            {/* QR SPECIMEN TTD — disembunyikan pada pratinjau tanpa TTD */}
            <div
              className={
                tanpaTtd
                  ? "skhpk-qr-box skhpk-qr-box-empty"
                  : "skhpk-qr-box"
              }
            >
              {tanpaTtd ? null : (
                <QrCode
                  value={qrUrl}
                  className="skhpk-qr"
                  size={108}
                />
              )}
            </div>

            {/* NAMA */}
            <p className="skhpk-signer-name">
              {signer.nama}
            </p>

            <p className="skhpk-signer-rank">
              {signer.pangkat}
            </p>

          </div>

        </div>

      </article>
        </div>
      </div>

      {tampilkanMcu ? (
        <section className="skhpk-mcu-panel no-print">
          <div className="skhpk-mcu-panel-head">
            <h2>Berkas MCU</h2>
            <p>
              {rikkes.fileName
                ? rikkes.fileName
                : "Hasil pemeriksaan yang diunggah di Upload MCU."}
            </p>
          </div>
          {rikkes.filePath ? (
            isImageBerkas(rikkes.filePath) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={rikkes.filePath}
                alt={rikkes.fileName || "Berkas MCU"}
                className="skhpk-mcu-image"
              />
            ) : (
              <iframe
                src={rikkes.filePath}
                title={rikkes.fileName || "Berkas MCU"}
                className="skhpk-mcu-frame"
              />
            )
          ) : (
            <div className="empty">Berkas MCU belum diunggah.</div>
          )}
        </section>
      ) : null}

    </div>
  );
}