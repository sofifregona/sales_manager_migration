import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  Column,
} from "typeorm";

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn({ type: "datetime" })
  @Index()
  dateTime!: Date;

  @Column({ type: "enum", enum: ["income", "expense"] })
  type!: "income" | "expense";

  @Column("decimal", {
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value.toFixed(2), // JS -> DB (string)
      from: (value: string) => Number(value), // DB -> JS (number)
    },
  })
  amount!: number;

  @Column({ type: "text", nullable: true })
  description!: string | null;
}
