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
