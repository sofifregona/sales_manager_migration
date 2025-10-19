import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Category } from "../category/category.entity.js";
import { Brand } from "../brand/brand.entity.js";
import { Provider } from "../provider/provider.entity.js";

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int", unique: true })
  code!: number;

  @Column({ type: "varchar", length: 80, nullable: false })
  name!: string;

  @Column({
    name: "normalized_name",
    type: "varchar",
    length: 80,
    unique: true,
    nullable: false,
  })
  normalizedName!: string;

  @Column("decimal", {
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value.toFixed(2), // JS -> DB (string)
      from: (value: string) => Number(value), // DB -> JS (number)
    },
  })
  price!: number;

  @Column({
    name: "stock_enabled",
    type: "boolean",
    default: false,
    nullable: false,
  })
  stockEnabled!: boolean;

  @Column({ type: "int", nullable: true })
  quantity!: number;

  @Column({
    name: "negative_quantity_warning",
    type: "boolean",
    nullable: false,
  })
  negativeQuantityWarning!: boolean;

  @Column({ name: "min_quantity_warning", type: "boolean", nullable: false })
  minQuantityWarning!: boolean;

  @Column({ name: "min_quantity", type: "int", nullable: true })
  minQuantity!: number;

  @ManyToOne(() => Category, { nullable: true })
  category!: Category | null;

  @ManyToOne(() => Provider, { nullable: true })
  provider!: Provider | null;

  @ManyToOne(() => Brand, { nullable: true })
  brand!: Brand | null;

  @Column({ type: "boolean", default: true, nullable: false })
  active!: boolean;
}
