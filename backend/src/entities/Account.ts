import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description!: string | null;

  @Column({ default: true })
  active!: boolean;
}
