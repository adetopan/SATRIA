import { getSession } from "@/lib/auth";
import { isStaffAdmin } from "@/lib/roles";
import { getPeserta } from "@/lib/db";
import { PesertaForm } from "@/components/PesertaForm";
import { DaftarPeserta } from "@/components/DaftarPeserta";

export default async function PesertaPage() {
  const session = await getSession();

  const peserta = await getPeserta();

  const isAdmin = isStaffAdmin(session?.role);

  return (
    <div>
      {/* =====================================
          FORM TAMBAH PESERTA
      ====================================== */}

      {isAdmin ? (
        <PesertaForm existingPeserta={peserta} />
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