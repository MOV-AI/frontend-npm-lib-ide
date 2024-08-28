import Workspace from "./../../../utils/Workspace";

// This is not a new instance as Workspace is a singleton
const workspace = new Workspace();
// Extract only the tabs that have tabIncrement
const tabsMap = [...workspace.getTabs().values()].filter(x => x.tabIncrement);
// Compute the tool tab map
export const toolIds = computeTabMap(tabsMap);

/* get the structure from the tabsMap that will allow us
 * to efficently organize tool ids.
 */
function computeTabMap(tabsMap) {
  const computedToolTabMap = {};

  /* Compute a map of this format:
   * {
   *   Topics: { last: 3, busy: [2] },
   *   VarsDebug: { last 2, busy: [1] },
   * }
   */
  for (const tabData of tabsMap) {
    const { scope, tabIncrement } = tabData;

    const tabIncrementStatusData = computedToolTabMap[scope] ?? {
      last: 1,
      busy: {},
      free: []
    };
    tabIncrementStatusData.busy[tabIncrement] = 1;

    if (tabIncrement > tabIncrementStatusData.last)
      tabIncrementStatusData.last = tabIncrement;

    computedToolTabMap[scope] = tabIncrementStatusData;
  }

  /* turn it into:
   * {
   *   Topics: { last: 3, free: [1] },
   *   VarsDebug: { last 2, free: [] },
   * }
   */
  for (const toolScope in computedToolTabMap) {
    const tabIncrementStatusData = computedToolTabMap[toolScope];

    for (let i = 1; i < tabIncrementStatusData.last; i++)
      if (!tabIncrementStatusData.busy[i]) tabIncrementStatusData.free.push(i);

    delete tabIncrementStatusData.busy;
    tabIncrementStatusData.last++;
  }

  return computedToolTabMap;
}

/* free a tool id */
export function freeToolId(tabData) {
  if (!tabData.tabIncrement) return;

  const toolIdData = toolIds[tabData.scope];
  if (toolIdData) {
    toolIdData.free.unshift(tabData.tabIncrement);
    toolIdData.free.sort();
  }
}
