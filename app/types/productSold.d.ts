import { Provider } from "./provider";
import { Category } from "./category";
import { Product } from "./product";

export interface ProductSold {
  id: number;
  product: Product;
  units: number;
  subtotal: number;
  sale: Sale;
}

export interface CreateProductSoldFormData {
  idProduct: number;
  units: number;
  subtotal: number;
  idSale: number;
}

export interface UpdateProductSoldFormData extends CreateProductSoldFormData {
  id: number;
}
