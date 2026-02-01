import { DataSource, Repository } from "typeorm";
import { ProductSold } from "./product-sold.entity.js";
import type { ProductSoldRepository } from "./product-sold.repo.js";

export function makeProductSoldRepository(
  ds: DataSource
): ProductSoldRepository {
  const productSoldRepo: Repository<ProductSold> =
    ds.getRepository(ProductSold);
  return {
    create(data) {
      return productSoldRepo.create(data);
    },
    save(entity) {
      return productSoldRepo.save(entity);
    },
    async findById(id) {
      return productSoldRepo.findOneBy({ id });
    },
    async updateFields(id, patch) {
      await productSoldRepo.update(id, patch);
    },
    async assignPayment(id, payment) {
      await productSoldRepo.update(id, payment);
    },
    async delete(id) {
      await productSoldRepo.delete(id);
    },
  };
}
