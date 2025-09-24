import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Product } from "./Product.js";
import { Sale } from "./Sale.js";

@Entity()
export class ProductSold {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Product)
  @JoinColumn()
  product!: Product;

  @Column()
  quantity!: number;

  @Column("decimal", { precision: 10, scale: 2 })
  subtotal!: number;

  @ManyToOne(() => Sale, { nullable: false, onDelete: "CASCADE" })
  sale!: Sale;
}
