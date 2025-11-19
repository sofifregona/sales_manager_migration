export { saleListLoader as loader } from "~/feature/sale/sale-loader.server";
import { createSaleAction } from "~/feature/sale/actions/sale-create.server";
export { createSaleAction as action };
import {
  OrderPanelScreen,
  SaleListErrorBoundary,
} from "~/feature/sale/screens/OrderPanelScreen";

export default OrderPanelScreen;
export { SaleListErrorBoundary as ErrorBoundary };
