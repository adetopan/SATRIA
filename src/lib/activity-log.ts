import { insertActivityLog, uid } from "./db";
import type {
  ActivityAction,
  ActivityLog,
  ActivityModule,
  SessionUser,
} from "./types";

type ActivityInput = {
  action: ActivityAction;
  module: ActivityModule;
  targetId: string;
  targetLabel: string;
  detail: string;
};

export async function recordActivity(
  session: SessionUser,
  input: ActivityInput,
) {
  const log: ActivityLog = {
    id: uid("a"),
    createdAt: new Date().toISOString(),
    userId: session.id,
    userName: session.name,
    userRole: session.role,
    action: input.action,
    module: input.module,
    targetId: input.targetId,
    targetLabel: input.targetLabel,
    detail: input.detail,
  };

  await insertActivityLog(log);
}
