import { getPeserta, getRikkes } from "@/lib/db";
import { UploadMcuForm } from "@/components/UploadMcuForm";
import { RiwayatUploadMcu } from "@/components/RiwayatUploadMcu";

export default async function UploadMcuPage() {

  // ==========================================
  // AMBIL DATA PESERTA DAN RIKKES
  // ==========================================
  const [peserta, rikkes] =
    await Promise.all([
      getPeserta(),
      getRikkes(),
    ]);

  return (
    <div>

      {/* ======================================
          FORM UPLOAD MCU
      ======================================= */}
      <UploadMcuForm
        peserta={peserta}
      />


      {/* ======================================
          RIWAYAT UPLOAD + FILTER
      ======================================= */}
      <RiwayatUploadMcu
        peserta={peserta}
        rikkes={rikkes}
      />

    </div>
  );
}