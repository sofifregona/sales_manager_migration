import { paymentMethodLoader } from "~/feature/paymentMethod/payment-method-loader.server";
export { paymentMethodLoader as loader };
import { paymentMethodAction } from "~/feature/paymentMethod/payment-method-action.server";
export { paymentMethodAction as action };
import {
  PaymentMethodPanelScreen,
  PaymentMethodPanelErrorBoundary,
} from "~/feature/paymentMethod/screens/PaymentMethodPanelScreen";

export default PaymentMethodPanelScreen;
export { PaymentMethodPanelErrorBoundary as ErrorBoundary };
