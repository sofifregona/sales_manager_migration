import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Account } from "../account/account.entity.js";

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  name!: string;

  @Column({ name: "normalized_name", type: "varchar" })
  normalizedName!: string;

  @ManyToOne(() => Account, { nullable: false })
  account!: Account;

  @Column({ type: "boolean", default: true })
  active!: boolean;
}
