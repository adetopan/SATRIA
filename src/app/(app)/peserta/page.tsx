import { getSession } from "@/lib/auth";
import { getPeserta } from "@/lib/db";
import { PesertaForm } from "@/components/PesertaForm";
import { DaftarPeserta } from "@/components/DaftarPeserta";

export default async function PesertaPage() {
  const session = await getSession();

  const peserta = await getPeserta();

  const isAdmin =
    session?.role === "admin";

  return (
    <div>
      {/* =====================================
          FORM TAMBAH PESERTA
      ====================================== */}

      {isAdmin ? (
        <PesertaForm />
      ) : null}

      {/* =====================================
          DAFTAR PESERTA
      ====================================== */}

      <DaftarPeserta
        peserta={peserta}
      />
    </div>
  );
}