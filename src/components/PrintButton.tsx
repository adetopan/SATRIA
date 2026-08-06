"use client";

export function PrintButton({ label = "Cetak SKHPK" }: { label?: string }) {
  return (
    <button
      type="button"
      className="btn-primary"
      style={{ width: "auto" }}
      onClick={() => window.print()}
    >
      {label}
    </button>
  );
}
