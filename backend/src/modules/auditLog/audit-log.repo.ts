import type { AuditLog } from "./audit-log.entity.js";

/**
 * Narrow repository contract for Account, mapping exactly what the service uses today.
 * This isolates TypeORM behind a small interface that is easy to stub in tests.
 */
export interface AuditLogRepository {
  // createAccount: repo.create + repo.save
  create(
    data: Pick<AuditLog, "userId" | "entity" | "entityId" | "action" | "payload">
  ): AuditLog;
  save(entity: AuditLog): Promise<AuditLog>;

  // read paths used by service
  findById(id: number): Promise<AuditLog | null>;

  getAll(): Promise<AuditLog[]>;
}
