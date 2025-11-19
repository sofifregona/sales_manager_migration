import type { User } from "./user.entity.js";

export interface UserRepository {
  create(
    data: Pick<User, "username" | "name" | "passwordHash" | "role"> & {
      active?: boolean;
    }
  ): User;
  save(entity: User): Promise<User>;

  findById(id: number): Promise<User | null>;
  findActiveById(id: number): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  getAll(includeInactive: boolean): Promise<User[]>;

  updateFields(
    id: number,
    patch: Partial<
      Pick<User, "username" | "name" | "role"> & { active: boolean }
    >
  ): Promise<void>;
  resetPassword(
    id: number,
    patch: Partial<Pick<User, "passwordHash"> & { active: boolean }>
  ): Promise<void>;
  reactivate(id: number): Promise<void>;
  deactivate(id: number): Promise<void>;
}
