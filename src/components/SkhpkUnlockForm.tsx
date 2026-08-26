"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function SkhpkUnlockForm({ rikkesId }: { rikkesId: string }) {
  const router = useRouter();
  const [nrp, setNrp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/skhpk/${rikkesId}/unlock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nrp }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "NRP tidak sesuai.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={onSubmit}>
        <Image
          src="/logo-satria.png"
          alt="Logo SATRIA"
          width={180}
          height={180}
          className="login-logo"
          priority
        />
        <h1>SKHPK</h1>
        <p className="tagline">
          Masukkan Password Anda untuk membuka
          <br />
          cetakan Surat Keterangan Hasil Pemeriksaan Kesehatan.
        </p>

        {error ? <p className="error-text">{error}</p> : null}

        <div className="field">
          <label htmlFor="skhpk-nrp">Password</label>
          <input
            id="skhpk-nrp"
            type="password"
            value={nrp}
            onChange={(e) => setNrp(e.target.value)}
            placeholder="Masukkan Password"
            autoComplete="off"
            required
          />
        </div>

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Memeriksa..." : "Buka Cetakan"}
        </button>
      </form>
    </div>
  );
}
