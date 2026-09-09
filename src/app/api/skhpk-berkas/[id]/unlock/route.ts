import { NextResponse } from "next/server";
import { grantSkhpkAccess, nrpMatches } from "@/lib/skhpk-access";
import { getIzin, getPeserta } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const nrp = String(body.nrp || "");

  if (!nrp.trim()) {
    return NextResponse.json({ error: "NRP wajib diisi." }, { status: 400 });
  }

  const [izinList, pesertaList] = await Promise.all([getIzin(), getPeserta()]);
  const izin = izinList.find((item) => item.id === id);
  if (!izin?.skhpkFilePath) {
    return NextResponse.json(
      { error: "Berkas SKHPK tidak ditemukan." },
      { status: 404 },
    );
  }

  const peserta = pesertaList.find((p) => p.id === izin.pesertaId);
  if (!peserta || !nrpMatches(nrp, peserta.nrp)) {
    return NextResponse.json({ error: "NRP tidak sesuai." }, { status: 401 });
  }

  await grantSkhpkAccess(id);
  return NextResponse.json({ ok: true });
}
