import "./index.css";
export { Translations } from "./src/i18n";
import reportWebVitals from "./src/reportWebVitals";
// Import shared classes to be exported
import BaseApp, { installEditor, installTool } from "./src/App/BaseApp";
import { Store, DBSubscriber } from "./src/store";
import { Model, Manager } from "./src/models";
import { withAlerts, withMenuHandler } from "./src/decorators";
import { withEditorPlugin, withViewPlugin, withToolPlugin } from "./src/engine";
// Import src/editors
import {
  CallbackModel,
  CallbackStore,
  CallbackEditor,
  Callback,
} from "./src/editors/Callback";
import {
  ConfigurationModel,
  ConfigurationStore,
  ConfigurationEditor,
  Configuration,
} from "./src/editors/Configuration";
import { NodeModel, NodeStore, NodeEditor, Node } from "./src/editors/Node";
import {
  FlowModel,
  FlowStore,
  FlowEditor,
  Flow,
  getBaseContextOptions,
} from "./src/editors/Flow";
import FlowExplorer from "./src/editors/Flow/view/Components/Explorer/Explorer";
// Tools
import HomeTabPlugin, { getHomeTab } from "./src/tools/HomeTab/HomeTab";
import ShortcutsPlugin, {
  getShortcutsTab,
} from "./src/tools/AppShortcuts/AppShortcuts";
// Utils
import ApplicationTheme from "./src/themes";
import * as CONSTANTS from "./src/utils/Constants";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "./src/utils/Messages";
import Workspace from "./src/utils/Workspace";
import { KEYBINDINGS } from "./src/utils/shortcuts";
export { useKeyBinds, addKeyBind, removeKeyBind } from "./src/utils/keybinds";
import * as Utils from "./src/utils/Utils";
import LocalStorage from "./src/utils/LocalStorage";
// Hooks
import Loader from "./src/editors/_shared/Loader/Loader";
import useDataTypes from "./src/editors/_shared/hooks/useDataTypes";
import useDataSubscriber from "./src/plugins/DocManager/useDataSubscriber";
export * from "./src/plugins/hosts/DrawerPanel/DrawerPanel";
import PluginManagerIDE from "./src/engine/PluginManagerIDE/PluginManagerIDE";
import { usePluginMethods } from "./src/engine/ReactPlugin/ViewReactPlugin";
import { openTool } from "./src/utils/generalFunctions";

// Exports
export { BaseApp, installEditor, installTool };
export { PluginManagerIDE };
export { Store, DBSubscriber };
export { Model, Manager };
export { withAlerts, withMenuHandler };
export { withEditorPlugin, withViewPlugin, withToolPlugin };
export { CallbackModel, CallbackStore, CallbackEditor, Callback };
export {
  ConfigurationModel,
  ConfigurationStore,
  ConfigurationEditor,
  Configuration,
};
export { NodeModel, NodeStore, NodeEditor, Node };
export {
  FlowModel,
  FlowStore,
  FlowEditor,
  Flow,
  reportWebVitals,
  getBaseContextOptions,
};
export { CONSTANTS, ERROR_MESSAGES, SUCCESS_MESSAGES, KEYBINDINGS };
export { Workspace, LocalStorage, Utils };
export { HomeTabPlugin, getHomeTab };
export { ShortcutsPlugin, getShortcutsTab };
export { FlowExplorer };
export { ApplicationTheme };
export { Loader, useDataTypes, useDataSubscriber, usePluginMethods };
export { openTool };

// Export editor's shared components
export * from "./src/editors/_shared";
