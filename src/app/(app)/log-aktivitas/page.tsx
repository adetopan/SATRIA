import { redirect } from "next/navigation";
import { LogAktivitas } from "@/components/LogAktivitas";
import { getSession } from "@/lib/auth";
import { isSuperadmin } from "@/lib/roles";
import { getActivityLogs } from "@/lib/db";

export default async function LogAktivitasPage() {
  const session = await getSession();
  if (!session || !isSuperadmin(session.role)) {
    redirect("/dashboard");
  }

  const logs = await getActivityLogs();
  return <LogAktivitas logs={logs} />;
}
