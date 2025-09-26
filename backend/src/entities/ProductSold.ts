import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
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

  @Column("decimal", {
    precision: 10,
    scale: 2,
    transformer: {
      to: (value?: number) => (value != null ? value.toFixed(2) : null), // JS -> DB (string)
      from: (value: string | null) => (value != null ? Number(value) : null), // DB -> JS (number)
    },
  })
  subtotal!: number;

  @ManyToOne(() => Sale, { nullable: false, onDelete: "CASCADE" })
  sale!: Sale;
}
