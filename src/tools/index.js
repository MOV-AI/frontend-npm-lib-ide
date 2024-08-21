import React from "react";
import PluginManagerIDE from "../engine/PluginManagerIDE/PluginManagerIDE";
import { getNotInstalledTabData } from "./NotInstalled/NotInstalled";

const APP_TOOLS = {};

export const addTool = (name, tool) => {
  APP_TOOLS[name] = tool;
};

export const getToolTabData = (tab, props = {}) => {
  const { name, scope } = tab;
  const notInstalledTab = getNotInstalledTabData(scope, name);
  const data = scope in APP_TOOLS ? APP_TOOLS[scope].tabData : notInstalledTab;
  // Sanitize tab data to avoid TypeError: Converting circular structure to JSON
  if (!data.content) {
    const plugin = PluginManagerIDE.getPlugin(scope);
    data.content = plugin.render(props) || notInstalledTab.content;
  }
  if (props.tabTitle) data.name = props.tabTitle;
  if ("parent" in data) delete data.parent;
  if (data.plugin) {
    const mergedProps = { ...data.content.props, ...props };
    data.content = React.cloneElement(data.content, mergedProps);
  }

  return { ...data, ...tab };
};

export const hasTool = name => {
  return name in APP_TOOLS;
};

export const getMainMenuTools = () => {
  return Object.values(APP_TOOLS).filter(tool => tool.mainMenu);
};

export const getSystemBarTools = () => {
  return Object.values(APP_TOOLS).filter(tool => tool.toolBar);
};

export const getQuickAccessTools = () => {
  return Object.values(APP_TOOLS).filter(tool => tool.quickAccess);
};
