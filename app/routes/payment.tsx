import { paymentLoader } from "~/feature/payment/payment-loader.server";
export { paymentLoader as loader };
import { paymentAction } from "~/feature/payment/payment-action.server";
export { paymentAction as action };
import {
  PaymentPanelScreen,
  PaymentPanelErrorBoundary,
} from "~/feature/payment/screens/PaymentPanelScreen";

export default PaymentPanelScreen;
export { PaymentPanelErrorBoundary as ErrorBoundary };

