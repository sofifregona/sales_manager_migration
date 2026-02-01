import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  Index,
} from "typeorm";
import { Bartable } from "../bartable/bartable.entity.js";
import { PaymentMethod } from "../paymentMethod/payment-method.entity.js";
import { ProductSold } from "./product-sold.entity.js";
import { Employee } from "../employee/employee.entity.js";
import { User } from "../user/user.entity.js";
import { Payment } from "./payment.entity.js";

@Entity()
export class Sale {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn({ type: "datetime" })
  @Index()
  createdDateTime!: Date;

  @ManyToOne(() => User, { nullable: false })
  createdBy!: User;

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

  @OneToMany(() => Payment, (payment) => payment.sale, {
    onDelete: "CASCADE",
    orphanedRowAction: "delete",
    eager: false,
  })
  payments!: Payment[];

  // @ManyToOne(() => PaymentMethod, { nullable: true })
  // paymentMethod!: PaymentMethod | null;
  @OneToMany(() => ProductSold, (productSold) => productSold.sale, {
    onDelete: "CASCADE",
    orphanedRowAction: "delete",
    eager: false,
  })
  products!: ProductSold[];
}
