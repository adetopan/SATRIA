import { notFound } from "next/navigation";
import { SkhpkUnlockForm } from "@/components/SkhpkUnlockForm";
import { getSession } from "@/lib/auth";
import { getIzin } from "@/lib/db";
import { hasSkhpkAccess } from "@/lib/skhpk-access";

type Params = { params: Promise<{ id: string }> };

function isImageBerkas(path: string) {
  return /\.(jpe?g|png|webp)$/i.test(path);
}

export default async function SkhpkBerkasPage({ params }: Params) {
  const { id } = await params;
  const [session, izinList] = await Promise.all([getSession(), getIzin()]);
  const izin = izinList.find((item) => item.id === id);
  if (!izin?.skhpkFilePath) notFound();

  const unlocked = session ? true : await hasSkhpkAccess(id);
  if (!unlocked) {
    return (
      <SkhpkUnlockForm
        unlockUrl={`/api/skhpk-berkas/${id}/unlock`}
        title="Berkas SKHPK"
        description="Masukkan NRP Anda untuk membuka file Surat Keterangan Hasil Pemeriksaan Kesehatan."
      />
    );
  }

  const storedSrc = izin.skhpkFilePath;
  const fileSrc = session ? storedSrc : `/api/skhpk-berkas/${id}/file`;
  const isImage = isImageBerkas(storedSrc) || isImageBerkas(izin.skhpkFileName || "");

  return (
    <div className="skhpk-page" style={{ padding: "1.2rem" }}>
      <div
        className="panel"
        style={{ maxWidth: "210mm", margin: "0 auto 1rem" }}
      >
        <div className="panel-head">
          <div>
            <h2>Berkas SKHPK</h2>
            <p>{izin.skhpkFileName || "File SKHPK yang diunggah."}</p>
          </div>
          <a href={fileSrc} className="btn-secondary" target="_blank" rel="noreferrer">
            Unduh
          </a>
        </div>
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fileSrc}
            alt={izin.skhpkFileName || "SKHPK"}
            style={{ width: "100%", display: "block" }}
          />
        ) : (
          <iframe
            src={`${fileSrc}#toolbar=1`}
            title={izin.skhpkFileName || "SKHPK"}
            style={{
              width: "100%",
              height: "85vh",
              border: 0,
              background: "#f4f4f4",
            }}
          />
        )}
      </div>
    </div>
  );
}
