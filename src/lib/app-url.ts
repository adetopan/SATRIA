import { networkInterfaces } from "os";
import { headers } from "next/headers";

function lanAddress() {
  const ifaces = networkInterfaces();
  for (const list of Object.values(ifaces)) {
    for (const item of list || []) {
      if (item.family === "IPv4" && !item.internal) {
        return item.address;
      }
    }
  }
  return null;
}

export async function getAppOrigin() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configured) return configured;

  const h = await headers();
  let host = (h.get("x-forwarded-host") || h.get("host") || "localhost:3000")
    .split(",")[0]
    .trim();
  const proto =
    h.get("x-forwarded-proto") ||
    (host.startsWith("localhost") || host.startsWith("127.")
      ? "http"
      : "https");

  if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) {
    const lan = lanAddress();
    if (lan) {
      const port = host.includes(":") ? host.split(":")[1] : "";
      host = port ? `${lan}:${port}` : lan;
    }
  }

  return `${proto}://${host}`;
}
