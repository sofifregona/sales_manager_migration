import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { ROLES, type Role } from "@back/src/shared/constants/roles.js";

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

  @Column({ type: "enum", enum: ROLES, nullable: false })
  role!: Role;

  @Column({ type: "boolean", default: true, nullable: false })
  active!: boolean;
}
