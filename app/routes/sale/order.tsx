export { saleListLoader as loader } from "~/feature/sale/loader/saleLoader.server";
import { createSaleAction } from "~/feature/sale/action/createSale.server";
export { createSaleAction as action };
import {
  OrderPanelScreen,
  SaleListErrorBoundary,
} from "~/feature/sale/screens/OrderPanelScreen";

export default OrderPanelScreen;
export { SaleListErrorBoundary as ErrorBoundary };
