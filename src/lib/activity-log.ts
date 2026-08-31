import { insertActivityLog, uid } from "@/lib/db";
import type { ActivityLog, SessionUser } from "@/lib/types";

export async function recordActivity(
  session: SessionUser,
  input: {
    action: ActivityLog["action"];
    module: ActivityLog["module"];
    targetId?: string;
    targetLabel: string;
    detail?: string;
  },
) {
  try {
    const log: ActivityLog = {
      id: uid("log"),
      createdAt: new Date().toISOString(),
      userId: session.id,
      userName: session.name,
      userRole: session.role,
      action: input.action,
      module: input.module,
      targetId: input.targetId || "",
      targetLabel: input.targetLabel,
      detail: input.detail || "",
    };
    await insertActivityLog(log);
  } catch (error) {
    console.error("Gagal mencatat log aktivitas:", error);
  }
}
