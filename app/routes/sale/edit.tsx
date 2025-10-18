export { saleLoader as loader } from "~/feature/sale/loader/saleLoader.server";
import { updateSaleAction } from "~/feature/sale/action/updateSale.server";
export { updateSaleAction as action };
import {
  OpenSalePanelScreen,
  SaleEditErrorBoundary,
} from "~/feature/sale/screens/OpenSalePanelScreen";

export default OpenSalePanelScreen;
export { SaleEditErrorBoundary as ErrorBoundary };
