import { categoryLoader } from "~/feature/category/category-loader.server";
export { categoryLoader as loader };
import { categoryAction } from "~/feature/category/category-action.server";
export { categoryAction as action };
import {
  CategoryPanelScreen,
  CategoryPanelErrorBoundary,
} from "~/feature/category/screens/CategoryPanelScreen";

export default CategoryPanelScreen;
export { CategoryPanelErrorBoundary as ErrorBoundary };

