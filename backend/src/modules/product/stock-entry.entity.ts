import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  CreateDateColumn,
} from "typeorm";
import { Product } from "./product.entity.js";

@Entity()
export class StockEntry {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn({ type: "datetime", nullable: false })
  @Index()
  ocurredAt!: Date;

  @Column({ type: "int", nullable: false })
  quantity!: number;

  @ManyToOne(() => Product, { nullable: false })
  product!: Product;

  @Column({ type: "text", nullable: true })
  coments!: string;
}
