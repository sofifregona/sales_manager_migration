import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Account } from "../account/account.entity.js";

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 80, nullable: false })
  name!: string;

  @Column({
    name: "normalized_name",
    type: "varchar",
    length: 80,
    unique: true,
    nullable: false,
  })
  normalizedName!: string;

  @ManyToOne(() => Account, { nullable: false })
  account!: Account;

  @Column({ type: "boolean", default: true, nullable: false })
  active!: boolean;
}
