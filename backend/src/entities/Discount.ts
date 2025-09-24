import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Discount {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  discount!: number;

  @Column("varchar", { nullable: true })
  description!: string | null;

  @Column({ default: true })
  active!: boolean;
}
