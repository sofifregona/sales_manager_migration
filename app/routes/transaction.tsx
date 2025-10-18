import { transactionLoader } from "~/feature/transaction/transactionLoader.server";
export { transactionLoader as loader };
import { movementAction } from "~/feature/transaction/movementAction.server";
export { movementAction as action };
import {
  MovementPanelScreen,
  MovementPanelErrorBoundary,
} from "~/feature/transaction/screens/MovementPanelScreen";

export default MovementPanelScreen;
export { MovementPanelErrorBoundary as ErrorBoundary };
