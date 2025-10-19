import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 80, nullable: false, unique: true })
  username!: string;

  @Column({ type: "varchar", length: 80, nullable: false })
  name!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  passwordHash!: string;

  @Column({ type: "varchar", length: 20, nullable: false })
  role!: "ADMIN" | "MANAGER" | "CASHIER";

  @Column({ type: "boolean", default: true, nullable: false })
  active!: boolean;
}
