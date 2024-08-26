import { i18n } from "@mov-ai/mov-fe-lib-react";
import AppSettings from "../App/AppSettings";
import { PLUGINS } from "../utils/Constants";
import movaiIconWhite from "../Branding/movai-logo-white.png";
import { getHomeTab } from "../tools/HomeTab/HomeTab";
import { getShortcutsTab } from "../tools/AppShortcuts/AppShortcuts";
import { getToolTabData } from "../tools";
import Workspace from "./../utils/Workspace";

//========================================================================================
/*                                                                                      *
 *                                    Private Methods                                   *
 *                                                                                      */
//========================================================================================

function renderPopupInfo(classes) {
  return (
    <div className={classes.contentHolder}>
      <p>
        {i18n.t("Version-Colon")} {AppSettings.APP_INFORMATION.VERSION}
      </p>
      <p>
        {i18n.t("LastUpdate-Colon")} {AppSettings.APP_INFORMATION.LAST_UPDATE}
      </p>
      <p>
        {i18n.t("ConfigurationFile-Colon")}{" "}
        {AppSettings.APP_INFORMATION.CONFIGURATION_FILE}
      </p>
      <p>
        {i18n.t("CustomConfigurationFile-Colon")}
        {AppSettings.APP_INFORMATION.CUSTOM_CONFIGURATION_FILE}
      </p>
      <p>
        {i18n.t("AppDescription")}: {AppSettings.APP_INFORMATION.DESCRIPTION}
      </p>
    </div>
  );
}

//========================================================================================
/*                                                                                      *
 *                                    Exposed Methods                                   *
 *                                                                                      */
//========================================================================================

export function saveDocument(call) {
  call(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.CALL.SAVE_ACTIVE_EDITOR);
}

export function saveAllDocument(call) {
  call(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.CALL.SAVE_DIRTIES);
}

export function aboutPopup(call, classes = {}) {
  call(PLUGINS.DIALOG.NAME, PLUGINS.DIALOG.CALL.ALERT, {
    title: (
      <>
        <img
          className={classes.movaiIcon}
          src={movaiIconWhite}
          alt="MOV.AI Logo"
        />
        <span>{AppSettings.NAME}</span>
      </>
    ),
    message: renderPopupInfo(classes),
    submitText: i18n.t("Ok")
  });
}

/* breaks a tool id into the alphabetical and numerical components */
function breakToolId(tabId) {
  const index = tabId.search(/\d/);
  const alpha = tabId.substring(0, index - 1);

  if (index < 0)
    return [alpha];

  const number = new Number(tabId.substring(index));

  return [alpha, number];
}

/* get the structure from the tabsMap that will allow us
 * to efficently organize tool ids.
 */
function computeIds(tabsMap) {
  const res = {};

  /* get a map of this format:
   * {
   *   Topics: { last: 3, busy: [2] },
   *   VarsDebug: { last 2, busy: [1] },
   * }
   */
  for (const [tabId] of tabsMap) {
    const [alpha, number] = breakToolId(tabId);
    const index = tabId.search(/\d/);
    if (index < 0)
      continue;
    const specific = res[alpha] ?? { last: 0, busy: {}, free: [] };
    specific.busy[number] = 1;
    if (number > specific.last)
      specific.last = number;
    res[alpha] = specific;
  }

  /* turn it into:
   * {
   *   Topics: { last: 3, free: [1] },
   *   VarsDebug: { last 2, free: [] },
   * }
   */
  for (const toolName in res) {
    const specific = res[toolName];
    for (let j = 0; j < specific.last; j++)
      if (!specific.busy[j])
        specific.free.push(j);
    delete specific.busy;
    specific.last++;
  }

  return res;
}

const workspace = new Workspace();
const tabsMap = workspace.getTabs();
const toolIds = computeIds(tabsMap);

/* free a tool id */
export function freeToolId(tabId) {
  const [alpha, number] = breakToolId(tabId);

  if (!number)
    return;

  const toolIdData = toolIds[alpha];
  toolIdData.free.unshift(number);
}

/**
 * Open Tool tab
 * @param {function} call : Plugin call method
 * @param {string} toolName : Tool Unique Name
 */
export function openTool(call, toolName = getHomeTab().id, props = {}) {
  const toolIdData = toolIds[toolName] ?? { last: 0, free: [] };
  const id = toolIdData.free.shift() ?? toolIdData.last++;
  const tabData = { ...getToolTabData({ scope: toolName, id: toolName + "-" + id }, props) };
  if (tabData.multiple) {
    tabData.name += "-" + id;
    tabData.title += "-" + id;
  } else
    tabData.id = toolName;
  call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.OPEN, tabData);

  toolIds[toolName] = toolIdData;
}

/**
 * Open Welcome tab
 */
export function openWelcomeTab(call) {
  openTool(call);
}

/**
 * Open Shortcuts tab
 */
export function openShortcutsTab(call) {
  const shortcutsTab = getShortcutsTab();
  openTool(call, shortcutsTab.id);
}
