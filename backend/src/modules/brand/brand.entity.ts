import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Brand {
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

  @Column({ type: "boolean", default: true, nullable: false })
  active!: boolean;
}
