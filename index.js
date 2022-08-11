import reportWebVitals from "./src/reportWebVitals";
// Import shared classes to be exported
import BaseApp, { installEditor, installTool } from "./src/App/BaseApp";
import { Store, DBSubscriber } from "./src/store";
import { Model, Manager } from "./src/models";
import { withAlerts, withTheme, withKeyBinds } from "./src/decorators";
import { withEditorPlugin, withViewPlugin } from "./src/engine";
// Import editors
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
import FlowExplorer from "./src/editors/Flow/view/Components/Explorer/Explorer";
import * as CONSTANTS from "./src/utils/Constants";

import { ApplicationTheme } from "./src/themes";

import HomeTabPlugin, { getHomeTab } from "./src/tools/HomeTab/HomeTab";
import ShortcutsPlugin, {
  getShortcutsTab
} from "./src/tools/AppShortcuts/AppShortcuts";

// Export classes to build App
export { BaseApp, installEditor, installTool };
export { Store, DBSubscriber };
export { Model, Manager };
export { withAlerts, withTheme, withKeyBinds };
export { withEditorPlugin, withViewPlugin };
// Export built-in editors
export { CallbackModel, CallbackStore, CallbackView };
export { ConfigurationModel, ConfigurationStore, ConfigurationView };
export { NodeModel, NodeStore, NodeView };
export { FlowModel, FlowStore, FlowView };
export { FlowExplorer };
export { CONSTANTS };
export { ApplicationTheme };
export { HomeTabPlugin, getHomeTab };
export { ShortcutsPlugin, getShortcutsTab };
export { reportWebVitals };
