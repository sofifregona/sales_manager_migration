import { productLoader } from "~/feature/product/product-loader.server";
export { productLoader as loader };
import { productAction } from "~/feature/product/product-action.server";
export { productAction as action };
import {
  ProductPanelScreen,
  ProductPanelErrorBoundary,
} from "~/feature/product/screens/ProductPanelScreen";

export default ProductPanelScreen;
export { ProductPanelErrorBoundary as ErrorBoundary };
