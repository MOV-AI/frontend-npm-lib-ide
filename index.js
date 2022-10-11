import "./index.css";
import reportWebVitals from "./src/reportWebVitals";
// Import shared classes to be exported
import BaseApp, { installEditor, installTool } from "./src/App/BaseApp";
import { Store, DBSubscriber } from "./src/store";
import { Model, Manager } from "./src/models";
import { withAlerts, withTheme, withKeyBinds } from "./src/decorators";
import { withEditorPlugin, withViewPlugin, withToolPlugin } from "./src/engine";
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
import FlowExplorer from "./src/editors/Flow/view/Components/Explorer/Explorer";
// Tools
import HomeTabPlugin, { getHomeTab } from "./src/tools/HomeTab/HomeTab";
import ShortcutsPlugin, {
  getShortcutsTab
} from "./src/tools/AppShortcuts/AppShortcuts";
// Utils
import { ApplicationTheme } from "./src/themes";
import { ThemeProvider } from "@material-ui/core/styles";
import i18n, { Translations } from "./src/i18n/i18n";
import * as CONSTANTS from "./src/utils/Constants";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "./src/utils/Messages";
import Workspace from "./src/utils/Workspace";
import { KEYBINDINGS } from "./src/utils/shortcuts";
import * as Utils from "./src/utils/Utils";
import LocalStorage from "./src/utils/LocalStorage";
// Hooks
import useDataTypes from "./src/editors/_shared/hooks/useDataTypes";
import useDataSubscriber from "./src/plugins/DocManager/useDataSubscriber";
import PluginManagerIDE from "./src/engine/PluginManagerIDE/PluginManagerIDE";
import { usePluginMethods } from "./src/engine/ReactPlugin/ViewReactPlugin";
import { openTool } from "./src/plugins/views/SystemBar/builder/buildFunctions";

// Exports
export { BaseApp, installEditor, installTool };
export { PluginManagerIDE };
export { Store, DBSubscriber };
export { Model, Manager };
export { withAlerts, withTheme, withKeyBinds };
export { withEditorPlugin, withViewPlugin, withToolPlugin };
export { CallbackModel, CallbackStore, CallbackView };
export { ConfigurationModel, ConfigurationStore, ConfigurationView };
export { NodeModel, NodeStore, NodeView };
export { FlowModel, FlowStore, FlowView, reportWebVitals };
export { CONSTANTS, ERROR_MESSAGES, SUCCESS_MESSAGES, KEYBINDINGS };
export { Workspace, LocalStorage, Utils };
export { HomeTabPlugin, getHomeTab };
export { ShortcutsPlugin, getShortcutsTab };
export { FlowExplorer };
export { ThemeProvider, ApplicationTheme };
export { i18n, Translations };
export { useDataTypes, useDataSubscriber, usePluginMethods };
export { openTool };

// Export editor's shared components
export * from "./src/editors/_shared";
