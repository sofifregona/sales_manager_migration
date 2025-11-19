import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  Column,
  ManyToOne,
  OneToOne,
} from "typeorm";
import { User } from "../user/user.entity.js";

@Entity()
export class TradingSession {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { nullable: false })
  openBy!: User;

  @CreateDateColumn({ type: "datetime" })
  @Index()
  openDateTime!: Date;

  @Column("decimal", {
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value.toFixed(2),
      from: (value: string) => Number(value),
    },
    nullable: false,
  })
  openingCashCount!: number;

  @ManyToOne(() => User, { nullable: false })
  closeBy!: User;

  @CreateDateColumn({ type: "datetime" })
  @Index()
  closeDateTime!: Date;

  @Column("decimal", {
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value.toFixed(2),
      from: (value: string) => Number(value),
    },
    nullable: false,
  })
  closingCashCount!: number;

  @Column("decimal", {
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value.toFixed(2),
      from: (value: string) => Number(value),
    },
    nullable: false,
  })
  manualAdjustment!: number;
}
