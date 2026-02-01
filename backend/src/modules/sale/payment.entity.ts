import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Sale } from "./sale.entity.js";
import { PaymentMethod } from "../paymentMethod/payment-method.entity.js";
import { User } from "../user/user.entity.js";

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { nullable: false })
  createdBy!: User;

  @CreateDateColumn({ type: "datetime" })
  @Index()
  createdDateTime!: Date;

  @ManyToOne(() => Sale, { nullable: false })
  sale!: Sale;

  @ManyToOne(() => PaymentMethod, { nullable: false })
  paymentMethod!: PaymentMethod;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  amount!: number;
}
