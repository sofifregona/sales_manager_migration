import {
  DataSource,
  Repository,
  In,
  type FindOptionsWhere,
  IsNull,
  Like,
  Raw,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
} from "typeorm";
import { Product } from "./product.entity.js";
import type { ProductRepository } from "./product.repo.js";
import { normalizeText } from "@back/src/shared/utils/helpers/normalizeText.js";

export function makeProductRepository(ds: DataSource): ProductRepository {
  const productRepo: Repository<Product> = ds.getRepository(Product);
  return {
    create(data) {
      return productRepo.create({ active: true, ...data });
    },
    save(entity) {
      return productRepo.save(entity);
    },
    async findById(id) {
      return productRepo.findOne({
        where: { id },
        relations: { brand: true, category: true, provider: true },
      });
    },
    async findActiveById(id) {
      return productRepo.findOne({
        where: { id, active: true },
        relations: { brand: true, category: true, provider: true },
      });
    },
    async findByNormalizedName(normalizedName) {
      return productRepo.findOneBy({ normalizedName });
    },
    async findByCode(code) {
      return productRepo.findOneBy({ code });
    },
    async getListOfProducts(params: {
      includeInactive: boolean;
      filter?: {
        name?: string; // ya normalizada
        code?: string; // solo dígitos, e.g. "01"
        minPrice?: number;
        maxPrice?: number;
        idProvider?: number | null; // undefined = no filtra; null = solo nulos; number = por id
        idCategory?: number | null;
        idBrand?: number | null;
      };
      sort?: {
        field?:
          | "normalizedName"
          | "code"
          | "price"
          | "provider"
          | "brand"
          | "category"
          | "active";
        direction?: "ASC" | "DESC";
      };
    }) {
      const {
        name,
        code,
        minPrice,
        maxPrice,
        idProvider,
        idCategory,
        idBrand,
      } = params.filter ?? {};

      const order: Record<string, "ASC" | "DESC"> = {};
      const field = params.sort?.field ?? "name";
      const direction = params.sort?.direction ?? "ASC";
      order[field] = direction;

      const sortMap: Record<string, string> = {
        id: "p.id",
        name: "p.normalizedName", // o "p.name" si corresponde
        code: "p.code",
        price: "p.price",
        category: "category.name",
        brand: "brand.name",
        provider: "provider.name",
        active: "p.active",
      };

      const col = sortMap[field] ?? "p.normalizedName";

      const where: FindOptionsWhere<Product> = {
        ...(params.includeInactive ? {} : { active: true }),
        ...(idProvider === null
          ? { provider: IsNull() }
          : idProvider != null
          ? { provider: { id: idProvider } }
          : {}),
        ...(idCategory === null
          ? { category: IsNull() }
          : idCategory != null
          ? { category: { id: idCategory } }
          : {}),
        ...(idBrand === null
          ? { brand: IsNull() }
          : idBrand != null
          ? { brand: { id: idBrand } }
          : {}),
        ...(name?.trim() && {
          normalizedName: Like(`${normalizeText(name.trim())}%`),
        }),
        ...(code?.trim()
          ? (() => {
              const prefix = code.replace(/\D/g, ""); // 01
              const w = Math.max(3, prefix.length);
              if (!prefix) return {};
              return {
                code: Raw(
                  (col) => `
              LPAD(
                CAST(${col} AS CHAR),
                GREATEST(CHAR_LENGTH(CAST(${col} AS CHAR)), :w), '0') 
                REGEXP CONCAT('^0*', :prefix)`,
                  { w, prefix }
                ),
              };
            })()
          : {}),
        ...(minPrice != null && maxPrice != null
          ? { price: Between(minPrice, maxPrice) }
          : minPrice != null
          ? { price: MoreThanOrEqual(minPrice) }
          : maxPrice != null
          ? { price: LessThanOrEqual(maxPrice) }
          : {}),
      };

      const qb = productRepo
        .createQueryBuilder("p")
        .leftJoinAndSelect("p.brand", "brand")
        .leftJoinAndSelect("p.category", "category")
        .leftJoinAndSelect("p.provider", "provider")
        .setFindOptions({
          where,
        });

      qb.addOrderBy(`${col} IS NULL`, "ASC");
      qb.addOrderBy(col, direction);

      return qb.getMany();
    },

    async updateFields(id, patch) {
      await productRepo.update(id, patch);
    },
    async reactivate(id) {
      await productRepo.update(id, { active: true });
    },
    async deactivate(id) {
      await productRepo.update(id, { active: false });
    },
    async countActiveByAccount(accountId) {
      return productRepo.count({
        where: { account: { id: accountId }, active: true } as any,
      });
    },
    async deactivateActiveByAccount(accountId) {
      await productRepo
        .createQueryBuilder()
        .update()
        .set({ active: false })
        .where("accountId = :id", { id: accountId })
        .andWhere("active = :active", { active: true })
        .execute();
    },
    async incrementPrices(ids, percent) {
      return await productRepo
        .createQueryBuilder()
        .update(Product)
        .set({ price: () => "ROUND(price * (1 + :p/100), 2)" })
        .where({ id: In(ids), active: true })
        .setParameters({ p: percent })
        .execute();
    },
  };
}
