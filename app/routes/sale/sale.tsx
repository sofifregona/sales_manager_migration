export { saleListFilterLoader as loader } from "~/feature/sale/sale-loader.server";
import { deleteSaleAction } from "~/feature/sale/actions/sale-delete.server";
export { deleteSaleAction as action };
import {
  SaleListPanelScreen,
  SaleListFilterErrorBoundary,
} from "~/feature/sale/screens/SaleRegisterScreen";

export default SaleListPanelScreen;
export { SaleListFilterErrorBoundary as ErrorBoundary };
