import { NextResponse } from "next/server";
import { recordActivity } from "@/lib/activity-log";
import { pesertaActivityLabel } from "@/lib/activity-labels";
import { requireSession } from "@/lib/auth";
import { STAFF_ADMIN_ROLES } from "@/lib/roles";
import { freezeSkhpkSignerOnSend, getPeserta, getRikkes } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const session = await requireSession(STAFF_ADMIN_ROLES);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const rikkesList = await getRikkes();
  const rikkes = rikkesList.find((r) => r.id === id);
  if (!rikkes) {
    return NextResponse.json(
      { error: "Data rikkes tidak ditemukan." },
      { status: 404 },
    );
  }

  const frozen = await freezeSkhpkSignerOnSend(id);
  if (!frozen) {
    return NextResponse.json(
      { error: "Data rikkes tidak ditemukan." },
      { status: 404 },
    );
  }

  if (!rikkes.signerSnapshot) {
    const pesertaList = await getPeserta();
    const peserta = pesertaList.find((p) => p.id === rikkes.pesertaId);
    await recordActivity(session, {
      action: "SKHPK_KIRIM_WA",
      module: "IZIN",
      targetId: rikkes.id,
      targetLabel: pesertaActivityLabel(peserta),
      detail: `${frozen.signerSnapshot?.nama || ""} · ${frozen.signerSnapshot?.pangkat || ""}`,
    });
  }

  return NextResponse.json({
    data: {
      frozen: true,
      waSentAt: frozen.waSentAt,
    },
  });
}
