"use client";

import { useState } from "react";

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
  const [loading, setLoading] = useState(false);

  async function kirimWA() {
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

    const baseUrl = window.location.origin;
    let linkHalaman = "";

    if (status === "DISETUJUI") {
      if (!rikkesId) {
        alert("Data rikkes tidak ditemukan.");
        return;
      }

      linkHalaman = `${baseUrl}/skhpk/${rikkesId}`;
    } else if (status === "DITOLAK") {
      linkHalaman = `${baseUrl}/tidak-memenuhi-syarat/${izinId}`;
    } else {
      alert(
        "Surat belum dapat dikirim karena status izin belum disetujui atau ditolak.",
      );
      return;
    }

    if (status === "DISETUJUI" && rikkesId) {
      setLoading(true);
      try {
        const res = await fetch(`/api/skhpk/${rikkesId}/kirim-wa`, {
          method: "POST",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          alert(
            data.error ||
              "Gagal mengunci data cetakan SKHPK. Pengiriman WhatsApp dibatalkan.",
          );
          return;
        }
      } catch {
        alert(
          "Gagal mengunci data cetakan SKHPK. Pengiriman WhatsApp dibatalkan.",
        );
        return;
      } finally {
        setLoading(false);
      }
    }

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
        `Demikian disampaikan. Terima kasih.`;
    }

    const url = `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;
    window.open(url, "_blank");
  }

  return (
    <button
      type="button"
      className="btn-secondary"
      onClick={kirimWA}
      disabled={loading}
      title={
        status === "DISETUJUI"
          ? "Data pejabat cetakan SKHPK dikunci pada pengiriman pertama."
          : undefined
      }
      style={{
        whiteSpace: "nowrap",
      }}
    >
      {loading ? "Menyiapkan..." : "Kirim WA"}
    </button>
  );
}
