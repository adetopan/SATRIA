"use client";

import { useState } from "react";
import { RiwayatUploadMcu } from "@/components/RiwayatUploadMcu";
import { UploadMcuForm } from "@/components/UploadMcuForm";
import type { Peserta, Rikkes } from "@/lib/types";

type Props = {
  peserta: Peserta[];
  rikkes: Rikkes[];
};

export function UploadMcuSection({ peserta, rikkes }: Props) {
  const [editing, setEditing] = useState<Rikkes | null>(null);

  return (
    <div>
      <UploadMcuForm
        peserta={peserta}
        rikkes={rikkes}
        editing={editing}
        onCancelEdit={() => setEditing(null)}
      />
      <RiwayatUploadMcu
        peserta={peserta}
        rikkes={rikkes}
        editingId={editing?.id}
        onEdit={setEditing}
        onCancelEdit={() => setEditing(null)}
      />
    </div>
  );
}
