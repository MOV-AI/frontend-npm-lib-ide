import "./index.css";
import reportWebVitals from "./reportWebVitals";
// Import shared classes to be exported
import BaseApp, { installEditor, installTool } from "./App/BaseApp";
import { Store, DBSubscriber } from "./store";
import { Model, Manager } from "./models";
import {
  withAlerts,
  withKeyBinds,
  withMenuHandler
} from "./decorators";
import { withEditorPlugin, withViewPlugin, withToolPlugin } from "./engine";
// Import editors
import {
  CallbackModel,
  CallbackStore,
  CallbackEditor,
  Callback
} from "./editors/Callback";
import {
  ConfigurationModel,
  ConfigurationStore,
  ConfigurationEditor,
  Configuration
} from "./editors/Configuration";
import { NodeModel, NodeStore, NodeEditor, Node } from "./editors/Node";
import {
  FlowModel,
  FlowStore,
  FlowEditor,
  Flow,
  getBaseContextOptions
} from "./editors/Flow";
import FlowExplorer from "./editors/Flow/view/Components/Explorer/Explorer";
// Tools
import HomeTabPlugin, { getHomeTab } from "./tools/HomeTab/HomeTab";
import ShortcutsPlugin, {
  getShortcutsTab
} from "./tools/AppShortcuts/AppShortcuts";
// Utils
import "./themes";
import { ThemeProvider } from "@material-ui/core/styles";
import i18n, { Translations } from "./i18n/i18n";
import * as CONSTANTS from "./utils/Constants";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "./utils/Messages";
import Workspace from "./utils/Workspace";
import { KEYBINDINGS } from "./utils/shortcuts";
import * as Utils from "./utils/Utils";
import LocalStorage from "./utils/LocalStorage";
// Hooks
import useDataTypes from "./editors/_shared/hooks/useDataTypes";
import useDataSubscriber from "./plugins/DocManager/useDataSubscriber";
import PluginManagerIDE from "./engine/PluginManagerIDE/PluginManagerIDE";
import { usePluginMethods } from "./engine/ReactPlugin/ViewReactPlugin";
import { openTool } from "./utils/generalFunctions";

// Exports
export { BaseApp, installEditor, installTool };
export { PluginManagerIDE };
export { Store, DBSubscriber };
export { Model, Manager };
export { withAlerts, withKeyBinds, withMenuHandler };
export { withEditorPlugin, withViewPlugin, withToolPlugin };
export { CallbackModel, CallbackStore, CallbackEditor, Callback };
export {
  ConfigurationModel,
  ConfigurationStore,
  ConfigurationEditor,
  Configuration
};
export { NodeModel, NodeStore, NodeEditor, Node };
export {
  FlowModel,
  FlowStore,
  FlowEditor,
  Flow,
  reportWebVitals,
  getBaseContextOptions
};
export { CONSTANTS, ERROR_MESSAGES, SUCCESS_MESSAGES, KEYBINDINGS };
export { Workspace, LocalStorage, Utils };
export { HomeTabPlugin, getHomeTab };
export { ShortcutsPlugin, getShortcutsTab };
export { FlowExplorer };
export { ThemeProvider };
export { i18n, Translations };
export { useDataTypes, useDataSubscriber, usePluginMethods };
export { openTool };

// Export editor's shared components
export * from "./editors/_shared";
