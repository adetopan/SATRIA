import { NextResponse } from "next/server";
import { grantSkhpkAccess, nrpMatches } from "@/lib/skhpk-access";
import { getPeserta, getRikkes } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const nrp = String(body.nrp || "");

  if (!nrp.trim()) {
    return NextResponse.json(
      { error: "NRP wajib diisi." },
      { status: 400 },
    );
  }

  const [rikkesList, pesertaList] = await Promise.all([
    getRikkes(),
    getPeserta(),
  ]);

  const rikkes = rikkesList.find((r) => r.id === id);
  if (!rikkes) {
    return NextResponse.json(
      { error: "Cetakan tidak ditemukan." },
      { status: 404 },
    );
  }

  const peserta = pesertaList.find((p) => p.id === rikkes.pesertaId);
  if (!peserta || !nrpMatches(nrp, peserta.nrp)) {
    return NextResponse.json(
      { error: "NRP tidak sesuai." },
      { status: 401 },
    );
  }

  await grantSkhpkAccess(id);
  return NextResponse.json({ ok: true });
}
