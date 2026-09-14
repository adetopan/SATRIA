"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { SessionUser } from "@/lib/types";
import { roleLabel } from "@/lib/roles";

const nav = [
  { href: "/dashboard", label: "Dashboard", roles: ["admin", "superadmin", "mcu"] },
  { href: "/peserta", label: "Data Peserta", roles: ["admin", "superadmin"] },
  { href: "/upload-mcu", label: "Upload MCU", roles: ["admin", "superadmin", "mcu"] },
  { href: "/izin-senjata", label: "Izin Senjata Api", roles: ["admin", "superadmin"] },
  { href: "/log-aktivitas", label: "Log Aktivitas", roles: ["superadmin"] },
  { href: "/pengaturan-skhpk", label: "Pengaturan SKHPK", roles: ["superadmin"] },
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
            {roleLabel(user.role)}
          </p>
          <p className="user-meta">{user.unit}</p>
          <button type="button" className="sidebar-logout" onClick={handleLogout}>
            <svg
              className="sidebar-logout-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
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
              : user.role === "superadmin"
                ? "Akses Penuh Superadmin"
                : "Akses Administrasi"}
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
