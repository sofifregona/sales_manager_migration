export { saleLoader as loader } from "~/feature/sale/sale-loader.server";
import { updateSaleAction } from "~/feature/sale/actions/sale-update.server";
export { updateSaleAction as action };
import {
  OpenSalePanelScreen,
  SaleEditErrorBoundary,
} from "~/feature/sale/screens/OpenSalePanelScreen";

export default OpenSalePanelScreen;
export { SaleEditErrorBoundary as ErrorBoundary };
