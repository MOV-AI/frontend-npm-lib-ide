import React, { useEffect } from "react";
import { Style, withDefaults } from "@mov-ai/mov-fe-lib-react";
// Base App
import BaseApp, { installEditor, installTool } from "../App/BaseApp";
// Editors
import {
  ConfigurationModel,
  ConfigurationStore,
  ConfigurationView
} from "../editors/Configuration";
import {
  CallbackModel,
  CallbackStore,
  CallbackView
} from "../editors/Callback";
import { NodeModel, NodeStore, NodeView } from "../editors/Node";
import { FlowModel, FlowStore, FlowView } from "../editors/Flow";
import FlowExplorer from "../editors/Flow/view/Components/Explorer/Explorer";
// Tools
import HomeTabPlugin, { getHomeTab } from "../tools/HomeTab/HomeTab";
import ShortcutsPlugin, {
  getShortcutsTab
} from "../tools/AppShortcuts/AppShortcuts";
// Utils
import * as CONSTANTS from "../utils/Constants";
import i18n from "../i18n/i18n";
import { ApplicationTheme } from "../themes";
// Externals
import { I18nextProvider } from "react-i18next";
import { ThemeProvider } from "@material-ui/core/styles";
// Icons
import KeyboardIcon from "@material-ui/icons/Keyboard";
import HomeIcon from "@material-ui/icons/Home";

const AppCE = props => {
  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  // On component did mount
  useEffect(() => {
    // Install editors
    installEditor({
      scope: FlowModel.SCOPE,
      store: FlowStore,
      editorPlugin: FlowView,
      otherPlugins: [
        {
          profile: CONSTANTS.FLOW_EXPLORER_PROFILE,
          factory: profile => new FlowExplorer(profile)
        }
      ]
    });
    installEditor({
      scope: NodeModel.SCOPE,
      store: NodeStore,
      editorPlugin: NodeView
    });
    installEditor({
      scope: CallbackModel.SCOPE,
      store: CallbackStore,
      editorPlugin: CallbackView
    });
    installEditor({
      scope: ConfigurationModel.SCOPE,
      store: ConfigurationStore,
      editorPlugin: ConfigurationView
    });
    // Install tools
    installTool({
      id: CONSTANTS.HOMETAB_PROFILE.name,
      profile: CONSTANTS.HOMETAB_PROFILE,
      Plugin: HomeTabPlugin,
      tabData: getHomeTab(),
      icon: HomeIcon,
      quickAccess: false,
      toolBar: false,
      mainMenu: false
    });
    installTool({
      id: CONSTANTS.SHORTCUTS_PROFILE.name,
      profile: CONSTANTS.SHORTCUTS_PROFILE,
      Plugin: ShortcutsPlugin,
      tabData: getShortcutsTab(),
      icon: KeyboardIcon,
      quickAccess: false,
      toolBar: false,
      mainMenu: false
    });
  }, []);

  return (
    <div style={{ height: "100vh" }}>
      <Style />
      <BaseApp {...props} />
    </div>
  );
};

export default withDefaults({
  name: "mov-fe-app-ide",
  component: AppCE,
  theme: {
    provider: ThemeProvider,
    props: ApplicationTheme
  },
  translations: {
    provider: I18nextProvider,
    i18n: i18n
  }
});
