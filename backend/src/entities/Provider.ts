import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
@Entity()
export class Provider {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ name: "normalized_name" })
  normalizedName!: string;

  @Column("bigint", { nullable: true })
  cuit!: number | null;

  @Column("bigint", { nullable: true })
  telephone!: number | null;

  @Column("varchar", { nullable: true })
  email!: string | null;

  @Column("varchar", { nullable: true })
  address!: string | null;

  @Column({ default: true })
  active!: boolean;
}
