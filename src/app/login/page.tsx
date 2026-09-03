"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Gagal masuk.");
      return;
    }

    router.push("/dashboard");
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
        <h1>SATRIA</h1>
        <p className="tagline">
          Sistem Administrasi Terintegrasi
          <br />
          Rikkes dan Izin Senjata Api
        </p>

        {error ? <p className="error-text">{error}</p> : null}

        <div className="field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin dan mcu"
            autoComplete="username"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </div>

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Memproses..." : "Masuk ke SATRIA"}
        </button>

        {/* <div className="hint-box">
          <strong>Akun demo:</strong>
          <br />
          Admin — <code>admin / admin123</code>
          <br />
          MCU RS Polri — <code>mcu / mcu123</code>
        </div> */}
      </form>
    </div>
  );
}
