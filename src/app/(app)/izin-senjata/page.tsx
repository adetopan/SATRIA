import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import {
  getIzin,
  getPeserta,
  getRikkes,
} from "@/lib/db";

import { IzinForm } from "@/components/IzinForm";
import { RiwayatIzinSenjata } from "@/components/RiwayatIzinSenjata";

export default async function IzinSenjataPage() {
  const session =
    await getSession();

  if (
    !session ||
    session.role !== "admin"
  ) {
    redirect("/dashboard");
  }

  const [
    izin,
    peserta,
    rikkes,
  ] = await Promise.all([
    getIzin(),
    getPeserta(),
    getRikkes(),
  ]);

  return (
    <div>

      {/* =====================================
          FORM PENGAJUAN
      ====================================== */}

      <IzinForm
        peserta={peserta}
      />

      {/* =====================================
          RIWAYAT / DAFTAR IZIN
      ====================================== */}

      <RiwayatIzinSenjata
        izin={izin}
        peserta={peserta}
        rikkes={rikkes}
      />

    </div>
  );
}