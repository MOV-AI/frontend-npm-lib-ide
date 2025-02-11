import {
  Style,
  withDefaults,
  Translations as reactTranslations,
} from "@mov-ai/mov-fe-lib-react";
import { i18n } from "@mov-ai/mov-fe-lib-react";
import { Translations as ideTranslations } from "../i18n";
import React, { useEffect } from "react";
// Base App
import BaseApp, { installEditor, installTool } from "../App/BaseApp";
// Editors
import {
  CallbackEditor,
  CallbackModel,
  CallbackStore,
} from "../editors/Callback";
import {
  ConfigurationEditor,
  ConfigurationModel,
  ConfigurationStore,
} from "../editors/Configuration";
import { FlowEditor, FlowModel, FlowStore } from "../editors/Flow";
import FlowExplorer from "../editors/Flow/view/Components/Explorer/Explorer";
import { NodeEditor, NodeModel, NodeStore } from "../editors/Node";
// Tools
import ShortcutsPlugin, {
  getShortcutsTab,
} from "../tools/AppShortcuts/AppShortcuts";
import HomeTabPlugin, { getHomeTab } from "../tools/HomeTab/HomeTab";
// Utils
import ApplicationTheme from "../themes";
import * as CONSTANTS from "../utils/Constants";
// Externals
import { ThemeProvider, withStyles } from "@material-ui/styles";
// Icons
import HomeIcon from "@material-ui/icons/Home";
import KeyboardIcon from "@material-ui/icons/Keyboard";

i18n.init({
  resources: {
    en: {
      translation: {
        ...reactTranslations.en,
        ...ideTranslations.en,
      },
    },
    pt: {
      translation: {
        ...reactTranslations.pt,
        ...ideTranslations.pt,
      },
    },
  },
  lng: window?.SERVER_DATA?.Language || "en",
});

const dependencies = {
  "@material-ui/styles": { ThemeProvider, withStyles },
};

const AppCE = (props) => {
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
          factory: (profile) => new FlowExplorer(profile),
        },
      ],
    });
    installEditor({
      scope: NodeModel.SCOPE,
      store: NodeStore,
      editorPlugin: NodeEditor,
    });
    installEditor({
      scope: CallbackModel.SCOPE,
      store: CallbackStore,
      editorPlugin: CallbackEditor,
      props: { useLanguageServer: false },
    });
    installEditor({
      scope: ConfigurationModel.SCOPE,
      store: ConfigurationStore,
      editorPlugin: ConfigurationEditor,
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
      mainMenu: false,
    });
    installTool({
      id: CONSTANTS.SHORTCUTS_PROFILE.name,
      profile: CONSTANTS.SHORTCUTS_PROFILE,
      Plugin: ShortcutsPlugin,
      tabData: getShortcutsTab(),
      icon: KeyboardIcon,
      quickAccess: false,
      toolBar: false,
      mainMenu: false,
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
  ApplicationTheme,
  dependencies,
});
