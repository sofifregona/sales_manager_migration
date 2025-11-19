import { DataSource, Repository } from "typeorm";
import { AuditLog } from "./audit-log.entity.js";
import type { AuditLogRepository } from "./audit-log.repo.js";

export function makeAuditLogRepository(ds: DataSource): AuditLogRepository {
  const auditLogRepo: Repository<AuditLog> = ds.getRepository(AuditLog);

  return {
    create(data) {
      return auditLogRepo.create(data);
    },
    save(entity) {
      return auditLogRepo.save(entity);
    },

    async findById(id: number) {
      return auditLogRepo.findOneBy({ id });
    },

    async getAll() {
      return auditLogRepo.find();
    },
  };
}
