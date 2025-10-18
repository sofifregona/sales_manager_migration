import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  Column,
  ManyToOne,
  OneToOne,
} from "typeorm";
import { Account } from "../account/account.entity.js";
import { Sale } from "../sale/sale.entity.js";

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn({ type: "datetime" })
  @Index()
  dateTime!: Date;

  @ManyToOne(() => Account, { nullable: false })
  account!: Account;

  @Column({ type: "enum", enum: ["income", "expense"] })
  type!: "income" | "expense";

  @Column({ type: "enum", enum: ["sale", "movement"] })
  origin!: "sale" | "movement";

  @OneToOne(() => Sale, { nullable: true })
  sale!: Sale | null;

  @Column("decimal", {
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value.toFixed(2),
      from: (value: string) => Number(value),
    },
  })
  amount!: number;

  @Column({ type: "text", nullable: true })
  description!: string | null;
}
