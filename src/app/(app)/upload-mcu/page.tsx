import { getPeserta, getRikkes } from "@/lib/db";
import { UploadMcuSection } from "@/components/UploadMcuSection";

export default async function UploadMcuPage() {
  const [peserta, rikkes] = await Promise.all([getPeserta(), getRikkes()]);

  return <UploadMcuSection peserta={peserta} rikkes={rikkes} />;
}
