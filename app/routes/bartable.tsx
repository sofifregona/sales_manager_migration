import { bartableLoader } from "~/feature/bartable/bartable-loader.server";
export { bartableLoader as loader };
import { bartableAction } from "~/feature/bartable/bartable-action.server";
export { bartableAction as action };
import {
  BartablePanelScreen,
  BartablePanelErrorBoundary,
} from "~/feature/bartable/screens/BartablePanelScreen";

export default BartablePanelScreen;
export { BartablePanelErrorBoundary as ErrorBoundary };

