import { Style, withDefaults } from "@mov-ai/mov-fe-lib-react";
import React, { useEffect } from "react";
// Base App
import BaseApp, { installEditor, installTool } from "../App/BaseApp";
// Editors
import {
  CallbackEditor,
  CallbackModel,
  CallbackStore
} from "../editors/Callback";
import {
  ConfigurationEditor,
  ConfigurationModel,
  ConfigurationStore
} from "../editors/Configuration";
import { FlowEditor, FlowModel, FlowStore } from "../editors/Flow";
import FlowExplorer from "../editors/Flow/view/Components/Explorer/Explorer";
import { NodeEditor, NodeModel, NodeStore } from "../editors/Node";
// Tools
import ShortcutsPlugin, {
  getShortcutsTab
} from "../tools/AppShortcuts/AppShortcuts";
import HomeTabPlugin, { getHomeTab } from "../tools/HomeTab/HomeTab";
// Utils
import i18n from "../i18n/i18n";
import * as CONSTANTS from "../utils/Constants";
// Externals
import { ThemeProvider, withStyles } from "@material-ui/core/styles";
import { I18nextProvider } from "react-i18next";
// Icons
import HomeIcon from "@material-ui/icons/Home";
import KeyboardIcon from "@material-ui/icons/Keyboard";

const dependencies = {
  "@material-ui/styles": { ThemeProvider, withStyles },
  "react-i18next": { I18nextProvider },
  i18n
};

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
      editorPlugin: FlowEditor,
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
      editorPlugin: NodeEditor
    });
    installEditor({
      scope: CallbackModel.SCOPE,
      store: CallbackStore,
      editorPlugin: CallbackEditor,
      props: { useLanguageServer: false }
    });
    installEditor({
      scope: ConfigurationModel.SCOPE,
      store: ConfigurationStore,
      editorPlugin: ConfigurationEditor
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
    <div style={{ height: "100vh", margin: "-1rem" }}>
      <Style />
      <BaseApp {...props} dependencies={dependencies} />
    </div>
  );
};


export default withDefaults({
  name: "mov-fe-app-ide",
  component: AppCE,
  dependencies,
});
