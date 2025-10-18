import { employeeLoader } from "~/feature/employee/employee-loader.server";
export { employeeLoader as loader };
import { employeeAction } from "~/feature/employee/employee-action.server";
export { employeeAction as action };
import {
  EmployeePanelScreen,
  EmployeePanelErrorBoundary,
} from "~/feature/employee/screens/EmployeePanelScreen";

export default EmployeePanelScreen;
export { EmployeePanelErrorBoundary as ErrorBoundary };

