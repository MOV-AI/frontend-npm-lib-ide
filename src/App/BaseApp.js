import React, { useEffect, useMemo } from "react";
import { Style } from "@mov-ai/mov-fe-lib-react";
import { Typography } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import DocManager from "../plugins/DocManager/DocManager";
import Dialog from "../plugins/Dialog/Dialog";
import Alerts from "../plugins/Alerts/Alerts";
import BottomBar from "../plugins/hosts/BottomBar/BottomBar";
import CentralPanel from "../plugins/hosts/CentralPanel/CentralPanel";
import DrawerPanel from "../plugins/hosts/DrawerPanel/DrawerPanel";
import SidePanel from "../plugins/hosts/SidePanel/SidePanel";
import TopBar from "../plugins/hosts/TopBar/TopBar";
import AbstractHost from "../plugins/hosts/AbstractHost/AbstractHost";
import SystemBar from "../plugins/views/SystemBar/SystemBar";
import AlertPanel from "../plugins/hosts/AlertPanel/AlertPanel";
import Explorer from "../plugins/views/Explorer/Explorer";
import MainMenu from "../plugins/views/MainMenu/MainMenu";
import Tabs from "../plugins/views/Tabs/Tabs";
import PluginManagerIDE from "../engine/PluginManagerIDE/PluginManagerIDE";
import Placeholder from "../plugins/views/Placeholder/Placeholder";
import { PLUGINS, HOSTS } from "../utils/Constants";
import { MainContext } from "../main-context";
import { addEditor } from "../plugins/DocManager/factory";
import { addTool } from "../tools";
import {
  setLogo,
  setName,
  setLinks,
  setAppProps,
  setShortcuts
} from "./AppSettings";

import "./App.css";
import { appStyles } from "./styles";

const DEBUG_MODE = false;

function BaseApp(props) {
  // Props
  const {
    logo,
    theme,
    links,
    appName,
    appProps,
    shortcuts,
    handleLogOut,
    handleToggleTheme
  } = props;

  // Style hook
  const classes = appStyles(DEBUG_MODE)();

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  const mainContextMemo = useMemo(
    () => ({
      handleLogOut,
      handleToggleTheme,
      selectedTheme: theme,
      isDarkTheme: theme === "dark"
    }),
    [theme, handleLogOut, handleToggleTheme]
  );

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

  const onContextMenu = event => event.preventDefault();

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  useEffect(() => {
    installAppPlugins();
    installViewPlugins();
    // Write log in consle
    writeMovaiLogo();
  }, []);

  // Set app settings

  useEffect(() => {
    if (logo) setLogo(logo);
  }, [logo]);

  useEffect(() => {
    if (links) setLinks(links);
  }, [links]);

  useEffect(() => {
    if (shortcuts) setShortcuts(shortcuts);
  }, [shortcuts]);

  useEffect(() => {
    if (appName) setName(appName);
  }, [appName]);

  useEffect(() => {
    if (appProps) setAppProps(appProps);
  }, [appProps]);
  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <MainContext.Provider value={mainContextMemo}>
      <Style />
      <div className="App" onContextMenu={onContextMenu}>
        {getHostedPlugins(classes)}
      </div>
    </MainContext.Provider>
  );
}

/**
 * Install app editors
 * @param {{scope: string, store: Store, plugin: IDEPlugin}} editor
 */
export function installEditor(editor) {
  const { scope, store, editorPlugin, otherPlugins = [] } = editor;
  addEditor(scope, store, editorPlugin);
  // Install other plugins relead to editor
  otherPlugins.forEach(pluginDescription => {
    const plugin = pluginDescription.factory(pluginDescription.profile);
    PluginManagerIDE.install(pluginDescription.profile.name, plugin);
  });
}

/**
 * Install app tools
 * @param {{profile: {name: string}, Plugin: IDEPlugin, tabData: object, mainMenu: boolean, toolBar: boolean, quickAccess: boolean}} tool
 */
export function installTool(tool) {
  const { Plugin, profile, id, dependencies = [] } = tool;
  const viewPlugin = new Plugin(profile);
  PluginManagerIDE.install(id, viewPlugin).then(() => {
    tool.tabData.content = viewPlugin.render();
    addTool(id, tool);
  });
  dependencies.forEach(dependency => {
    const { id: depID, Plugin: DepPlugin, profile: depProfile } = dependency;
    const plugin = new DepPlugin(depProfile);
    PluginManagerIDE.install(depID, plugin);
    addTool(depID, dependency);
  });
}

function installAppPlugins() {
  const plugins = [
    {
      profile: { name: PLUGINS.DOC_MANAGER.NAME },
      factory: profile => new DocManager(profile)
    },
    {
      profile: { name: PLUGINS.DIALOG.NAME },
      factory: profile => new Dialog(profile)
    },
    {
      profile: { name: PLUGINS.ALERT.NAME },
      factory: profile => new Alerts(profile)
    }
  ];
  plugins.forEach(pluginDescription => {
    const plugin = pluginDescription.factory(pluginDescription.profile);
    PluginManagerIDE.install(pluginDescription.profile.name, plugin);
  });
}

function installViewPlugins() {
  const plugins = [
    {
      profile: {
        name: PLUGINS.MAIN_MENU.NAME,
        location: HOSTS.LEFT_PANEL.NAME
      },
      factory: profile => new MainMenu(profile)
    },
    {
      profile: {
        name: PLUGINS.EXPLORER.NAME,
        location: HOSTS.LEFT_DRAWER.NAME
      },
      factory: profile => new Explorer(profile)
    },
    {
      profile: { name: PLUGINS.TABS.NAME, location: HOSTS.MAIN_PANEL.NAME },
      factory: profile => new Tabs(profile)
    },
    {
      profile: {
        name: PLUGINS.PLACEHOLDER.NAME,
        location: PLUGINS.RIGHT_DRAWER.NAME
      },
      factory: profile => new Placeholder(profile)
    },
    {
      profile: { name: PLUGINS.SYSTEM_BAR.NAME, location: HOSTS.TOP_BAR.NAME },
      factory: profile => new SystemBar(profile)
    }
  ];
  plugins.forEach(pluginDescription => {
    const plugin = pluginDescription.factory(pluginDescription.profile);
    PluginManagerIDE.install(pluginDescription.profile.name, plugin);
  });
}

function getHostedPlugins(classes) {
  return (
    <Grid container direction="column">
      <AbstractHost hostName={HOSTS.ABSTRACT_HOST.NAME}></AbstractHost>
      <Grid container alignItems="flex-start">
        <TopBar hostName={HOSTS.TOP_BAR.NAME} debugMode={DEBUG_MODE}></TopBar>
      </Grid>
      <Grid container alignItems="stretch" className={classes.mainGrid}>
        <Typography component="div" className={classes.leftPanel}>
          <SidePanel
            hostName={HOSTS.LEFT_PANEL.NAME}
            className={classes.sidePanel}
          ></SidePanel>
          <DrawerPanel
            hostName={HOSTS.LEFT_DRAWER.NAME}
            anchor="left"
            initialOpenState
          ></DrawerPanel>
        </Typography>
        <CentralPanel
          className={classes.centralPanel}
          hostName={HOSTS.MAIN_PANEL.NAME}
        ></CentralPanel>
        <DrawerPanel
          className={classes.rightDrawer}
          hostName={PLUGINS.RIGHT_DRAWER.NAME}
          anchor="right"
        ></DrawerPanel>
      </Grid>
      <Grid container alignItems="flex-end">
        <BottomBar
          hostName={HOSTS.BOTTOM_BAR.NAME}
          className={classes.bottomBar}
        ></BottomBar>
      </Grid>
      <AlertPanel hostName="alertPanel" />
    </Grid>
  );
}

function writeMovaiLogo() {
  console.log(MOVAI_LOGO);
}

const MOVAI_LOGO = `
????????????   ???????????? ??????????????????????????? ?????????   ?????????         ?????????????????? ????????? 
??????????????? ??????????????? ?????????   ????????? ?????????   ?????????        ?????????????????????????????????
????????????????????????????????? ?????????   ????????? ?????????   ????????? ?????????????????? ?????????????????????????????????
????????????????????????????????? ?????????   ?????????  ??????  ???????????? ?????????????????? ?????????????????????????????????
????????? ????????? ????????? ???????????????????????????   ??????????????????         ?????????  ??????????????????
`;

export default BaseApp;
