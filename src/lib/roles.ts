import type { Role } from "./types";

export const STAFF_ADMIN_ROLES: Role[] = ["admin", "superadmin"];
export const SUPERADMIN_ROLES: Role[] = ["superadmin"];
export const MCU_STAFF_ROLES: Role[] = ["admin", "mcu", "superadmin"];

export function parseRole(value: unknown): Role {
  if (value === "mcu") return "mcu";
  if (value === "superadmin") return "superadmin";
  return "admin";
}

export function isStaffAdmin(role?: Role | null) {
  return role === "admin" || role === "superadmin";
}

export function isSuperadmin(role?: Role | null) {
  return role === "superadmin";
}

export function roleLabel(role: Role) {
  if (role === "mcu") return "MCU RS Polri";
  if (role === "superadmin") return "Superadmin SATRIA";
  return "Admin SATRIA";
}
