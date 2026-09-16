import { redirect } from "next/navigation";
import { ManfaatEfisiensiView } from "@/components/ManfaatEfisiensiView";
import { getSession } from "@/lib/auth";
import { getActivityLogs, getIzin, getPeserta, getRikkes } from "@/lib/db";
import { buildManfaatEfisiensiLaporan } from "@/lib/manfaat-efisiensi";
import { isStaffAdmin } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function ManfaatEfisiensiPage() {
  const session = await getSession();
  if (!session || !isStaffAdmin(session.role)) {
    redirect("/dashboard");
  }

  const [peserta, rikkes, izin, logs] = await Promise.all([
    getPeserta(),
    getRikkes(),
    getIzin(),
    getActivityLogs(),
  ]);

  const laporan = buildManfaatEfisiensiLaporan(peserta, rikkes, izin, logs);
  return <ManfaatEfisiensiView laporan={laporan} />;
}
