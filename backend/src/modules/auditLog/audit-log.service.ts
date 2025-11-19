import type { AuditLogRepository } from "./audit-log.repo.js";

type AuditLogPayload = Record<string, any> | null | undefined;

export async function createAuditLog(
  repo: AuditLogRepository,
  data: {
    userId: number;
    entity: string;
    entityId: number;
    action: string;
    payload?: AuditLogPayload;
  }
) {
  const entry = repo.create({
    userId: data.userId,
    entity: data.entity,
    entityId: data.entityId,
    action: data.action,
    payload: data.payload ?? null,
  });
  await repo.save(entry);
}
