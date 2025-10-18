import type { SaleDTO } from "~/feature/sale/types/sale";
import { ProviderDTO } from "~/feature/provider/types/provider";
import { CategoryDTO } from "~/feature/category/types/category";
import { ProductDTO } from "~/feature/product/types/product";

export interface ProductSoldDTO {
  id: number;
  product: ProductDTO;
  quantity: number;
  subtotal: number;
  sale: SaleDTO;
}

export interface CreateProductSoldPayload {
  idProduct: number;
  quantity: number;
  subtotal: number;
  idSale: number;
}

export interface UpdateProductSoldPayload extends CreateProductSoldPayload {
  id: number;
}

