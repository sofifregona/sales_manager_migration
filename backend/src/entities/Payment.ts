import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ name: "normalized_name" })
  normalizedName!: string;

  @Column({ default: true })
  active!: boolean;
}
