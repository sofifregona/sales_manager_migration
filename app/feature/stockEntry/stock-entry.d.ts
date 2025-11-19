import type { AccountDTO } from "~/feature/account/account";
import type { SaleDTO } from "~/feature/sale/types/sale";
import type { Flash } from "~/types/flash";
import type { UserDTO } from "../user/user";
import type { ProductDTO } from "../product/product";
import type { ProviderDTO } from "../provider/provider";
import type { CategoryDTO } from "../category/category";
import type { BrandDTO } from "../brand/brand";

export interface StockEntryDTO {
  id: number;
  ocurredAt: Date;
  createdBy: UserDTO;
  product: ProductDTO;
  quantity: number;
  provider: ProviderDTO | null;
  comments: string | null;
}

export interface CreateStockEntryPayload {
  product: ProductDTO;
  quantity: number;
  provider: ProviderDTO | null;
  comments: string | null;
}

export interface UpdateStockEntryPayload
  extends Partial<CreateStockEntryPayload> {
  id: number;
}

export interface StockEntryLoaderData {
  stockEntries: StockEntryDTO[] | [];
  products: ProductDTO[] | [];
  providers: ProviderDTO[] | [];
  categories: CategoryDTO[] | [];
  brands: BrandDTO[] | [];
  editingStockEntry: StockEntryDTO | null;
  flash: Flash;
}
