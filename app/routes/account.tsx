import { accountLoader } from "~/feature/account/account-loader.server";
export { accountLoader as loader };
import { accountAction } from "~/feature/account/account-action.server";
export { accountAction as action };
import {
  AccountPanelScreen,
  AccountPanelErrorBoundary,
} from "~/feature/account/screens/AccountPanelScreen";

export default AccountPanelScreen;
export { AccountPanelErrorBoundary as ErrorBoundary };
