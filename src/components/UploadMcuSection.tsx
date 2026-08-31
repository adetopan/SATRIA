"use client";

import { useState } from "react";
import type { Peserta, Rikkes } from "@/lib/types";
import { UploadMcuForm } from "@/components/UploadMcuForm";
import { RiwayatUploadMcu } from "@/components/RiwayatUploadMcu";

export function UploadMcuSection({
  peserta,
  rikkes,
}: {
  peserta: Peserta[];
  rikkes: Rikkes[];
}) {
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
