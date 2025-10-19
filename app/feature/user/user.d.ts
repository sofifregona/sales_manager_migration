import type { Flash } from "~/types/flash";

export interface UserDTO {
  id: number;
  username: string;
  name: string;
  role: "ADMIN" | "MANAGER" | "CASHIER";
  active: boolean;
}

export interface CreateUserPayload {
  username: string;
  name: string;
  password: string;
  role: "ADMIN" | "MANAGER" | "CASHIER";
}

export interface UpdateUserPayload extends Omit<CreateUserPayload, "password"> {
  id: number;
}

export interface ResetPasswordPayload {
  id: number;
  password: string;
}

export interface UserLoaderData {
  users: UserDTO[] | [];
  editingUser: UserDTO | null;
  flash: Flash;
}
