import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from "typeorm";

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn({ type: "datetime" })
  createdAt!: Date;

  @Column({ type: "int", nullable: false })
  userId!: number; // ID del usuario que ejecutó la acción

  @Column({ type: "varchar", length: 40, nullable: false })
  entity!: string; // p.ej. "Sale", "Account", "Payment"

  @Column({ type: "int", nullable: false })
  entityId!: number;

  @Column({ type: "varchar", length: 40, nullable: false })
  action!: string; // p.ej. "CREATE", "UPDATE", "DEACTIVATE", "SALE_LINES_PATCH"

  @Column({ type: "simple-json", nullable: true })
  payload!: Record<string, any> | null; // datos adicionales (diff, totales, etc.)
}
