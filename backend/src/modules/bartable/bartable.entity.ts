import { Entity, PrimaryGeneratedColumn, Column, Check } from "typeorm";

@Entity()
export class Bartable {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int", unique: true })
  number!: number;

  @Column({ type: "boolean", default: true })
  active!: boolean;
}
