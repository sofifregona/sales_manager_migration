import type { Flash } from "~/types/flash";
import type { SaleDTO } from "~/feature/sale/types/sale";

export interface BartableDTO {
  id: number;
  number: number;
  activeSale: SaleDTO | null;
  active: boolean;
}

export interface CreateBartablePayload {
  number: number;
}

export interface UpdateBartablePayload extends CreateBartablePayload {
  id: number;
}

export interface BartableLoaderData {
  bartables: BartableDTO[] | [];
  editingBartable: BartableDTO | null;
  flash: Flash;
}
