
import { HomePage } from "./components/HomePage";
import reducer from "./reducer";
import messages_en from "./translations/en.json";
import DashboardMainMenu from "./menus/DashboardMainMenu";
import TestChart from "./components/TestChart";
const ROUTE_DASHBOARD = "dashboard";

const DEFAULT_CONFIG = {
  "reducers": [{ key: 'dashboard', reducer }],
  "core.Router": [
    { path: "home", component: HomePage },
  ]
}

export const DashboardModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...(cfg && cfg['fe-dashboard'] || {}) };
}