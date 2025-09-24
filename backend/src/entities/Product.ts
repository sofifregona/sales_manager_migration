import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Category } from "./Category.js";
import { Brand } from "./Brand.js";
import { Provider } from "./Provider.js";

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  code!: number;

  @Column()
  name!: string;

  @Column({ name: "normalized_name" })
  normalizedName!: string;

  @Column("decimal", { precision: 10, scale: 2 })
  price!: number;

  @ManyToOne(() => Category, { nullable: true })
  category!: Category | null;

  @ManyToOne(() => Provider, { nullable: true })
  provider!: Provider | null;

  @ManyToOne(() => Brand, { nullable: true })
  brand!: Brand | null;

  @Column({ default: true })
  active!: boolean;
}
