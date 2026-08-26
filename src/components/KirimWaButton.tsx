"use client";

type Props = {
  noHp?: string | null;
  nama?: string | null;
  nomorPermohonan?: string | null;
  rikkesId?: string | null;
  izinId: string;
  status: string;
};

export function KirimWaButton({
  noHp,
  nama,
  nomorPermohonan,
  rikkesId,
  izinId,
  status,
}: Props) {
  function kirimWA() {
    if (!noHp) {
      alert("Nomor HP peserta belum tersedia.");
      return;
    }

    /*
     * Bersihkan nomor HP
     * 0812xxxx -> 62812xxxx
     */
    let nomor = noHp.replace(/\D/g, "");

    if (nomor.startsWith("0")) {
      nomor = "62" + nomor.substring(1);
    } else if (!nomor.startsWith("62")) {
      nomor = "62" + nomor;
    }

    /*
     * URL aplikasi
     *
     * Jika sudah hosting, lebih baik gunakan:
     * const baseUrl = window.location.origin;
     */
    const baseUrl = window.location.origin;

    let linkHalaman = "";

    /*
     * ================================
     * JIKA DISETUJUI
     * ================================
     */
    if (status === "DISETUJUI") {
      if (!rikkesId) {
        alert("Data rikkes tidak ditemukan.");
        return;
      }

      linkHalaman = `${baseUrl}/skhpk/${rikkesId}`;
    }

    /*
     * ================================
     * JIKA DITOLAK
     * ================================
     */
    else if (status === "DITOLAK") {
      linkHalaman = `${baseUrl}/tidak-memenuhi-syarat/${izinId}`;
    }

    /*
     * Status lainnya
     */
    else {
      alert(
        "Surat belum dapat dikirim karena status izin belum disetujui atau ditolak."
      );
      return;
    }

    /*
     * ================================
     * PESAN WHATSAPP
     * ================================
     */

    let pesan = "";

    if (status === "DISETUJUI") {
      pesan =
        `Yth. ${nama || "Peserta"},\n\n` +
        `Sehubungan dengan pengajuan izin senjata api ` +
        `dengan Nomor Permohonan ${nomorPermohonan || "-"}, ` +
        `kami informasikan bahwa pengajuan Anda telah DISETUJUI.\n\n` +
        `Surat Keterangan Hasil Pemeriksaan Kesehatan (SKHPK) ` +
        `dapat dilihat melalui tautan berikut:\n\n` +
        `${linkHalaman}\n\n` +
        `Untuk membuka cetakan, gunakan NRP Anda sebagai kata sandi.\n\n` +
        `Demikian disampaikan. Terima kasih.`;
    }

    if (status === "DITOLAK") {
      pesan =
        `Yth. ${nama || "Peserta"},\n\n` +
        `Sehubungan dengan pengajuan izin senjata api ` +
        `dengan Nomor Permohonan ${nomorPermohonan || "-"}, ` +
        `kami informasikan bahwa pengajuan Anda dinyatakan ` +
        `TIDAK MEMENUHI SYARAT.\n\n` +
        `Untuk informasi lebih lanjut, silakan menghubungi ` +
        `Subbid Keslasus Bidkesmapta Rokespol Pusdokkes Polri.\n\n` +
        // `Informasi selengkapnya dapat dilihat melalui tautan berikut:\n\n` +
        // `${linkHalaman}\n\n` +
        `Demikian disampaikan. Terima kasih.`;
    }

    /*
     * Encode pesan supaya aman digunakan
     * pada URL WhatsApp
     */
    const url = `https://wa.me/${nomor}?text=${encodeURIComponent(
      pesan
    )}`;

    window.open(url, "_blank");
  }

  return (
    <button
      type="button"
      className="btn-secondary"
      onClick={kirimWA}
      style={{
        whiteSpace: "nowrap",
      }}
    >
      Kirim WA
    </button>
  );
}