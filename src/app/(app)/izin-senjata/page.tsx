import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { isStaffAdmin } from "@/lib/roles";
import { getIzin, getPeserta, getRikkes } from "@/lib/db";
import { IzinSenjataSection } from "@/components/IzinSenjataSection";

export default async function IzinSenjataPage() {
  const session = await getSession();

  if (!session || !isStaffAdmin(session.role)) {
    redirect("/dashboard");
  }

  const [izin, peserta, rikkes] = await Promise.all([
    getIzin(),
    getPeserta(),
    getRikkes(),
  ]);

  return (
    <IzinSenjataSection izin={izin} peserta={peserta} rikkes={rikkes} />
  );
}
