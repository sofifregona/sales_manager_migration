import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";

@Entity()
export class Account {
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

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "boolean", default: true, nullable: false })
  active!: boolean;

  @Column({
    name: "is_system",
    type: "boolean",
    default: false,
    nullable: false,
  })
  isSystem!: boolean;
}
