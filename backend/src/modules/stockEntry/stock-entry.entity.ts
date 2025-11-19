import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  CreateDateColumn,
} from "typeorm";
import { Product } from "../product/product.entity.js";
import { Provider } from "../provider/provider.entity.js";
import { User } from "../user/user.entity.js";

@Entity()
export class StockEntry {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn({ type: "datetime", nullable: false })
  @Index()
  ocurredAt!: Date;

  @ManyToOne(() => User, { nullable: false })
  createdBy!: User;

  @Column({ type: "int", nullable: false })
  quantity!: number;

  @ManyToOne(() => Product, { nullable: false })
  product!: Product;

  @ManyToOne(() => Provider, { nullable: true })
  provider!: Provider;

  @Column({ type: "text", nullable: true })
  comments!: string;
}
