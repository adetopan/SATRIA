import type { Role } from "./types";

export const STAFF_ADMIN_ROLES: Role[] = ["admin", "superadmin"];
export const MCU_STAFF_ROLES: Role[] = ["admin", "superadmin", "mcu"];

const ROLES: Role[] = ["admin", "superadmin", "mcu"];

export function parseRole(value: unknown): Role {
  const role = String(value || "").toLowerCase();
  return ROLES.includes(role as Role) ? (role as Role) : "admin";
}

export function isStaffAdmin(role?: Role | null) {
  return Boolean(role && STAFF_ADMIN_ROLES.includes(role));
}

export function roleLabel(role: Role) {
  switch (role) {
    case "superadmin":
      return "Superadmin";
    case "mcu":
      return "Petugas MCU";
    default:
      return "Administrator";
  }
}
