import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Employee {
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

  @Column("bigint", { nullable: true })
  dni!: number | null;

  @Column("bigint", { nullable: true })
  telephone!: number | null;

  @Column("varchar", { nullable: true })
  email!: string | null;

  @Column("varchar", { nullable: true })
  address!: string | null;

  @Column({ type: "boolean", default: true, nullable: false })
  active!: boolean;
}
