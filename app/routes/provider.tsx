import { providerLoader } from "~/feature/provider/provider-loader.server";
export { providerLoader as loader };
import { providerAction } from "~/feature/provider/provider-action.server";
export { providerAction as action };
import {
  ProviderPanelScreen,
  ProviderPanelErrorBoundary,
} from "~/feature/provider/screens/ProviderPanelScreen";

export default ProviderPanelScreen;
export { ProviderPanelErrorBoundary as ErrorBoundary };

