import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  Index,
} from "typeorm";
import { Bartable } from "./Bartable.js";
import { Payment } from "./Payment.js";
import { ProductSold } from "./ProductSold.js";
import { Employee } from "./Employee.js";

@Entity()
export class Sale {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn({ type: "datetime" })
  @Index()
  dateTime!: Date;

  @Column("decimal", {
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value.toFixed(2), // JS -> DB (string)
      from: (value: string) => Number(value), // DB -> JS (number)
    },
  })
  total!: number;

  @ManyToOne(() => Bartable, { nullable: true })
  bartable?: Bartable | null;

  @ManyToOne(() => Employee, { nullable: true })
  employee?: Employee | null;

  @Column({ type: "boolean", default: true })
  open!: boolean;

  @Column("int", { nullable: true })
  discount!: number | null;

  @ManyToOne(() => Payment, { nullable: true })
  payment!: Payment;

  @OneToMany(() => ProductSold, (productSold) => productSold.sale, {
    cascade: ["insert", "update"],
    orphanedRowAction: "delete",
    eager: false,
  })
  products!: ProductSold[];
}
