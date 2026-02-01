import { DataSource, Raw, Repository } from "typeorm";
import { Sale } from "./sale.entity.js";
import type { GroupKey, GroupedRow, SaleRepository } from "./sale.repo.js";
import { PaymentMethod } from "../paymentMethod/payment-method.entity.js";
import type { Payment } from "./payment.entity.js";

export function makeSaleRepository(ds: DataSource): SaleRepository {
  const repo: Repository<Sale> = ds.getRepository(Sale);
  // Note: grouped queries are built on Sale -> products relation; no extra repos needed here.

  return {
    create(data) {
      return repo.create({ ...data });
    },
    save(entity) {
      return repo.save(entity);
    },

    async findById(id) {
      return repo.findOne({
        where: { id },
        relations: {
          products: { product: true },
          bartable: true,
          employee: true,
        },
      });
    },
    async findOpenById(id) {
      return repo.findOne({
        where: { id, open: true },
        relations: {
          products: { product: true },
          bartable: true,
          employee: true,
        },
      });
    },
    async findOpenByBartableId(bartableId) {
      console.log("DENTRO DEL REPO DE BARTABLE");
      console.log(bartableId);
      const sale = await repo.findOne({
        where: { bartable: { id: bartableId }, open: true },
      });
      console.log("VENTA:");
      console.log(sale);
      return sale;
    },
    async findOpenByEmployeeId(employeeId) {
      return repo.findOne({
        where: { employee: { id: employeeId }, open: true },
      });
    },
    async getAllOpen() {
      return repo.find({
        where: { open: true },
        relations: { bartable: true, employee: true },
      });
    },
    async getList(from, to) {
      const where = {
        createdDateTime: Raw(
          (alias) => `${alias} >= :start AND ${alias} < :end`,
          {
            start: from,
            end: to,
          }
        ),
      };
      return repo.find({
        where,
        relations: {
          bartable: true,
          employee: true,
          products: { product: true },
        },
        order: { createdDateTime: "DESC" },
      });
    },
    async getGrouped(
      from: Date,
      to: Date,
      groupBy: GroupKey
    ): Promise<GroupedRow[]> {
      const where = {
        createdDateTime: Raw(
          (alias) => `${alias} >= :start AND ${alias} < :end`,
          {
            start: from,
            end: to,
          }
        ),
      };
      if (groupBy === "product") {
        const rows = await repo
          .createQueryBuilder("s")
          .setFindOptions({ where })
          .innerJoin("s.products", "ps")
          .innerJoin("ps.product", "p")
          .select("p.id", "groupId")
          .addSelect("p.name", "groupName")
          .addSelect("SUM(ps.quantity)", "units")
          .addSelect("SUM(ps.subtotal)", "total")
          .groupBy("p.id")
          .addGroupBy("p.name")
          .orderBy("total", "DESC")
          .getRawMany();
        return rows.map((r) => ({
          groupId: Number(r.groupId),
          groupName: r.groupName,
          units: Number(r.units),
          total: Number(r.total),
        }));
      }
      const rows = await repo
        .createQueryBuilder("s")
        .setFindOptions({ where })
        .innerJoin("s.products", "ps")
        .innerJoin("ps.product", "p")
        .leftJoin(`p.${groupBy}`, "g")
        .select("COALESCE(g.id, 0)", "groupId")
        .addSelect("COALESCE(g.name, 'Otros')", "groupName")
        .addSelect("SUM(ps.quantity)", "units")
        .addSelect("ROUND(SUM(ps.subtotal), 2)", "total")
        .groupBy("COALESCE(g.id, 0)")
        .addGroupBy("COALESCE(g.name, 'Otros')")
        .orderBy("total", "DESC")
        .getRawMany();
      return rows.map((r) => ({
        groupId: Number(r.groupId),
        groupName: r.groupName,
        units: Number(r.units),
        total: Number(r.total),
      }));
    },

    async updateTotal(id, total) {
      await repo.update(id, { total });
    },
    async closeSale(id: number) {
      await repo.update(id, { open: false });
    },
    async delete(id) {
      await repo.delete(id);
    },
  };
}
