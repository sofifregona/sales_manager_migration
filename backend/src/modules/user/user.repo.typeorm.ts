import { DataSource, Repository } from "typeorm";
import { User } from "./user.entity.js";
import type { UserRepository } from "./user.repo.js";

export function makeUserRepository(ds: DataSource): UserRepository {
  const repo: Repository<User> = ds.getRepository(User);

  return {
    create(data) {
      return repo.create({ ...data, active: data.active ?? true });
    },
    save(entity) {
      return repo.save(entity);
    },
    async findById(id) {
      return repo.findOneBy({ id });
    },
    async findActiveById(id) {
      return repo.findOneBy({ id, active: true });
    },
    async findByUsername(username) {
      return repo.findOneBy({ username });
    },
    async getAll(includeInactive) {
      const where = includeInactive ? {} : { active: true };
      return repo.find({ where });
    },
    async updateFields(id, patch) {
      await repo.update(id, patch);
    },
    async resetPassword(id, password) {
      await repo.update(id, password);
    },
    async reactivate(id) {
      await repo.update(id, { active: true });
    },
    async deactivate(id) {
      await repo.update(id, { active: false });
    },
  };
}
