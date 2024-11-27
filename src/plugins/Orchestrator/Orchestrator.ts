import { Profile } from "@remixproject/plugin-utils";
import { PLUGINS } from "../../utils/Constants";
import PluginManagerIDE from "../../engine/PluginManagerIDE/PluginManagerIDE";
import IDEPlugin from "../../engine/IDEPlugin/IDEPlugin";

type PluginRef = {
  renderRightMenu: () => void;
  renderMenus: () => void;
};

class Orchestrator extends IDEPlugin {
  cachedMenus: Map<
    Profile["name"],
    PluginRef["renderRightMenu"] | PluginRef["renderMenus"]
  >;
  constructor(profile: Profile = { name: PLUGINS.ORCHESTRATOR.NAME }) {
    // Remove duplicated if needed
    const methods = Array.from(
      new Set([
        ...(profile.methods ?? []),
        ...Object.values(PLUGINS.ORCHESTRATOR.CALL),
      ]),
    );

    super({ ...profile, methods });

    this.cachedMenus = new Map();
  }

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  activate() {
    this.on(PLUGINS.TABS.NAME, PLUGINS.TABS.ON.ACTIVE_TAB_CHANGE, (data) => {
      this.updateMenus(data.id);
    });
  }

  updateMenus(pluginName: Profile["name"], pluginRef?: PluginRef) {
    const cachedMenu = this.cachedMenus.get(pluginName);

    PluginManagerIDE.resetBookmarks();

    // This check allow us to ignore the first time
    // a tab is Opened / Focused
    if (cachedMenu) {
      cachedMenu();
    } else if (pluginRef) {
      // Just for legacy. If we update other editors to use
      // renderMenus only, we can get rid of this renderRightMenu
      // and do pluginRef.renderMenus() directly
      const pluginRenderMenus =
        pluginRef.renderRightMenu || pluginRef.renderMenus;

      this.cachedMenus.set(pluginName, pluginRenderMenus);
      pluginRenderMenus();
    }
  }

  //========================================================================================
  /*                                                                                      *
   *                                    Exposed Methods                                   *
   *                                                                                      */
  //========================================================================================

  renderMenus(data) {
    const pluginRef = data.ref.current;

    if (pluginRef !== null) {
      this.updateMenus(data.id, pluginRef);
    }
  }
}

export default Orchestrator;
