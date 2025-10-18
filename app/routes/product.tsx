import { productLoader } from "~/feature/product/productLoader.server";
export { productLoader as loader };
import { productAction } from "~/feature/product/productAction.server";
export { productAction as action };
import {
  ProductPanelScreen,
  ProductPanelErrorBoundary,
} from "~/feature/product/screens/ProductPanelScreen";

export default ProductPanelScreen;
export { ProductPanelErrorBoundary as ErrorBoundary };
