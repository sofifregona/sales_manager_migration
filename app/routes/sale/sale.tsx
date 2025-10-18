export { saleListFilterLoader as loader } from "~/feature/sale/loader/saleLoader.server";
import { deleteSaleAction } from "~/feature/sale/action/deleteSale.server";
export { deleteSaleAction as action };
import {
  SaleListPanelScreen,
  SaleListFilterErrorBoundary,
} from "~/feature/sale/screens/SaleListPanelScreen";

export default SaleListPanelScreen;
export { SaleListFilterErrorBoundary as ErrorBoundary };
