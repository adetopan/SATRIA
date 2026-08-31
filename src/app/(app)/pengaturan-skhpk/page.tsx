import { redirect } from "next/navigation";
import { PengaturanSkhpkForm } from "@/components/PengaturanSkhpkForm";
import { getSession } from "@/lib/auth";
import { isSuperadmin } from "@/lib/roles";
import { getSkhpkSigner } from "@/lib/db";

export default async function PengaturanSkhpkPage() {
  const session = await getSession();
  if (!session || !isSuperadmin(session.role)) {
    redirect("/dashboard");
  }

  const signer = await getSkhpkSigner();
  return <PengaturanSkhpkForm initial={signer} />;
}
