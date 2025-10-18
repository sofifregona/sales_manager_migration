import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  name!: string;

  @Column({ name: "normalized_name", type: "varchar" })
  normalizedName!: string;

  @Column({ type: "boolean", default: true })
  active!: boolean;
}

