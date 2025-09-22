import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Bartable {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  number!: number;

  @Column({ default: true })
  active!: boolean;
}
