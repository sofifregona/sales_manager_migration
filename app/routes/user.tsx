import { userLoader } from "~/feature/user/user-loader.server";
export { userLoader as loader };
import { userAction } from "~/feature/user/user-action.server";
export { userAction as action };
import {
  UserPanelScreen,
  UserPanelErrorBoundary,
} from "~/feature/user/screens/UserPanelScreen";

export default UserPanelScreen;
export { UserPanelErrorBoundary as ErrorBoundary };
