import "./index.css";
import reportWebVitals from "./src/reportWebVitals";
// Import shared classes to be exported
import BaseApp, { installEditor, installTool } from "./src/App/BaseApp";
import { Store, DBSubscriber } from "./src/store";
import { Model, Manager } from "./src/models";
import { withAlerts, withTheme, withKeyBinds } from "./src/decorators";
import { withEditorPlugin, withViewPlugin } from "./src/engine";
// Import src/editors
import {
  CallbackModel,
  CallbackStore,
  CallbackView
} from "./src/editors/Callback";
import {
  ConfigurationModel,
  ConfigurationStore,
  ConfigurationView
} from "./src/editors/Configuration";
import { NodeModel, NodeStore, NodeView } from "./src/editors/Node";
import { FlowModel, FlowStore, FlowView } from "./src/editors/Flow";
import * as CONSTANTS from "./src/utils/Constants";
import FlowExplorer from "./src/editors/Flow/view/Components/Explorer/Explorer";
import HomeTabPlugin, { getHomeTab } from "./src/tools/HomeTab/HomeTab";
import ShortcutsPlugin, {
  getShortcutsTab
} from "./src/tools/AppShortcuts/AppShortcuts";
import { ApplicationTheme } from "./src/themes";
import { ThemeProvider } from "@material-ui/core/styles";
import i18n from "./src/i18n/i18n";
// hooks
import useDataTypes from "./src/editors/_shared/hooks/useDataTypes";

// Exports
export { BaseApp, installEditor, installTool };
export { Store, DBSubscriber };
export { Model, Manager };
export { withAlerts, withTheme, withKeyBinds };
export { withEditorPlugin, withViewPlugin };
export { CallbackModel, CallbackStore, CallbackView };
export { ConfigurationModel, ConfigurationStore, ConfigurationView };
export { NodeModel, NodeStore, NodeView };
export { FlowModel, FlowStore, FlowView, reportWebVitals, CONSTANTS };
export { HomeTabPlugin, getHomeTab };
export { ShortcutsPlugin, getShortcutsTab };
export { FlowExplorer };
export { ThemeProvider, ApplicationTheme };
export { i18n };
export { useDataTypes };
