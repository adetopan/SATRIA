import { getSession } from "@/lib/auth";
import { getIzin, getPeserta, getRikkes } from "@/lib/db";
import { DashboardView } from "@/components/DashboardView";

export default async function DashboardPage() {
  const session = await getSession();
  const [peserta, rikkes, izin] = await Promise.all([
    getPeserta(),
    getRikkes(),
    getIzin(),
  ]);

  return (
    <DashboardView
      role={session?.role === "mcu" ? "mcu" : "admin"}
      peserta={peserta}
      rikkes={rikkes}
      izin={izin}
    />
  );
}
