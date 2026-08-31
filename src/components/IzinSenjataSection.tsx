"use client";

import { useState } from "react";
import { IzinForm } from "@/components/IzinForm";
import { RiwayatIzinSenjata } from "@/components/RiwayatIzinSenjata";
import type { IzinSenjata, Peserta, Rikkes } from "@/lib/types";

type Props = {
  izin: IzinSenjata[];
  peserta: Peserta[];
  rikkes: Rikkes[];
};

export function IzinSenjataSection({ izin, peserta, rikkes }: Props) {
  const [editing, setEditing] = useState<IzinSenjata | null>(null);

  return (
    <div>
      <IzinForm
        peserta={peserta}
        rikkes={rikkes}
        editing={editing}
        onCancelEdit={() => setEditing(null)}
      />
      <RiwayatIzinSenjata
        izin={izin}
        peserta={peserta}
        rikkes={rikkes}
        editingId={editing?.id}
        onEdit={setEditing}
        onCancelEdit={() => setEditing(null)}
      />
    </div>
  );
}
