import { DataSource, Repository } from "typeorm";
import { Employee } from "./employee.entity.js";
import type { EmployeeRepository } from "./employee.repo.js";
import { Sale } from "../sale/sale.entity.js";

export function makeEmployeeRepository(ds: DataSource): EmployeeRepository {
  const repo: Repository<Employee> = ds.getRepository(Employee);
  const salesRepo: Repository<Sale> = ds.getRepository(Sale);

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
    async findByNormalizedName(normalizedName) {
      return repo.findOneBy({ normalizedName });
    },
    async findByDni(dni) {
      return repo.findOneBy({ dni });
    },
    async getAll(includeInactive: boolean) {
      const where = includeInactive ? {} : { active: true };
      return repo.find({ where, order: { normalizedName: "ASC" as any } });
    },

    async updateFields(id, patch) {
      await repo.update(id, patch);
    },
    async reactivate(id) {
      await repo.update(id, { active: true });
    },
    async deactivate(id) {
      await repo.update(id, { active: false });
    },
    async findOpenSales(employeeId) {
      return salesRepo.count({
        where: { employee: { id: employeeId }, open: true } as any,
      });
    },
  };
}
