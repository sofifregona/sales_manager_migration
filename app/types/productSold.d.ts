import { Provider } from "./provider";
import { Category } from "./category";
import { Product } from "./product";

export interface ProductSold {
  id: number;
  product: Product;
  quantity: number;
  subtotal: number;
  sale: Sale;
}

export interface CreateProductSoldFormData {
  idProduct: number;
  quantity: number;
  subtotal: number;
  idSale: number;
}

export interface UpdateProductSoldFormData extends CreateProductSoldFormData {
  id: number;
}
