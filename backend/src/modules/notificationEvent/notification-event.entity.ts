import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from "typeorm";

@Entity()
export class NotificationEvent {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn({ type: "datetime", nullable: false })
  @Index()
  dateTime!: Date;

  @Column({
    type: "enum",
    enum: ["success", "error", "warning"],
    nullable: false,
  })
  type!: "success" | "error" | "warning";

  @Column({
    type: "enum",
    enum: ["create", "update", "deactivate", "delete", "reactivate"],
    nullable: true,
  })
  action!: "create" | "update" | "deactivate" | "delete" | "reactivate" | null;

  @Column({
    name: "id_audith_log",
    type: "int",
    nullable: false,
  })
  idAudithLog!: number;

  @Column({ type: "text", nullable: false })
  description!: string;

  @Column({ type: "boolean", default: false, nullable: false })
  hasBeenRead!: boolean;

  @Column({ type: "boolean", default: false })
  sticky!: boolean;
}
