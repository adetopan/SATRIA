"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { SessionUser } from "@/lib/types";

const nav = [
  { href: "/dashboard", label: "Dashboard", roles: ["admin", "mcu"] },
  { href: "/peserta", label: "Data Peserta", roles: ["admin"] },
  { href: "/upload-mcu", label: "Upload MCU", roles: ["admin", "mcu"] },
  { href: "/izin-senjata", label: "Izin Senjata Api", roles: ["admin"] },
];

export function AppShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <Image
            src="/logo-satria.png"
            alt="Logo SATRIA"
            width={160}
            height={160}
            className="brand-logo"
            priority
          />
          <div>
            <p className="brand-name">SATRIA</p>
            <p className="brand-sub">
              Sistem Administrasi Terintegrasi Rikkes & Izin Senjata Api
            </p>
          </div>
        </div>

        <nav className="nav-list">
          {nav
            .filter((item) => item.roles.includes(user.role))
            .map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link ${active ? "active" : ""}`}
                >
                  {item.label}
                </Link>
              );
            })}
        </nav>

        <div className="sidebar-foot">
          <p className="user-name">{user.name}</p>
          <p className="user-meta">
            {user.role === "mcu" ? "MCU RS Polri" : "Admin SATRIA"}
          </p>
          <p className="user-meta">{user.unit}</p>
          <button type="button" className="btn-ghost" onClick={handleLogout}>
            Keluar
          </button>
        </div>
      </aside>

      <div className="main-pane">
        <header className="topbar">
          <div className="topbar-brand">
            <Image
              src="/logo-satria.png"
              alt="Logo SATRIA"
              width={52}
              height={52}
              className="topbar-logo"
              priority
            />
            <div>
              <p className="eyebrow">Pusdokkes Polri</p>
              <h1>Panel Administrasi SATRIA</h1>
            </div>
          </div>
          <div className="topbar-chip">
            {user.role === "mcu"
              ? "Akses Upload Hasil Rikkes"
              : "Akses Penuh Administrasi"}
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
