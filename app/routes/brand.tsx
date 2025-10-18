import { brandLoader } from "~/feature/brand/brand-loader.server";
export { brandLoader as loader };
import { brandAction } from "~/feature/brand/brand-action.server";
export { brandAction as action };
import {
  BrandPanelScreen,
  BrandPanelErrorBoundary,
} from "~/feature/brand/screens/BrandPanelScreen";

export default BrandPanelScreen;
export { BrandPanelErrorBoundary as ErrorBoundary };

