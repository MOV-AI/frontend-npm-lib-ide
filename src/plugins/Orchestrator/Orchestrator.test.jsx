/* eslint-env jest */

import { PLUGINS } from "../../utils/Constants";
import PluginManagerIDE from "../../engine/PluginManagerIDE/PluginManagerIDE";
import Orchestrator from "./Orchestrator";

jest.mock("../../engine/PluginManagerIDE/PluginManagerIDE", () => ({
  __esModule: true,
  default: {
    resetBookmarks: jest.fn(),
  },
}));

jest.mock("../../utils/Constants", () => ({
  __esModule: true,
  PLUGINS: {
    TABS: {
      NAME: "tabs",
      ON: { ACTIVE_TAB_CHANGE: "activeTabChange" },
      CALL: { GET_ACTIVE_TAB: "getActiveTab", FOCUS_EXISTING_TAB: "focusTab" },
    },
    ORCHESTRATOR: {
      NAME: "orchestrator",
      CALL: { RENDER_MENUS: "renderMenusCall" },
    },
    RIGHT_DRAWER: {
      NAME: "rightDrawer",
      CALL: { CLOSE: "closeDrawer" },
    },
  },
}));

describe("Orchestrator", () => {
  let orchestrator;
  let fakeProfile;

  beforeEach(() => {
    jest.clearAllMocks();
    fakeProfile = { name: PLUGINS.ORCHESTRATOR.NAME };
    orchestrator = new Orchestrator(fakeProfile);
    orchestrator.call = jest.fn().mockResolvedValue(undefined);
  });

  describe("updateMenus", () => {
    it("should close drawer if no cached menu and no pluginRef", async () => {
      await orchestrator.updateMenus("somePlugin");
      expect(PluginManagerIDE.resetBookmarks).toHaveBeenCalledTimes(1);
      expect(orchestrator.call).toHaveBeenCalledWith(
        PLUGINS.RIGHT_DRAWER.NAME,
        PLUGINS.RIGHT_DRAWER.CALL.CLOSE,
      );
    });

    it("should cache and call pluginRef.renderMenus if provided", async () => {
      const renderMenus = jest.fn();
      const pluginRef = { renderMenus };

      await orchestrator.updateMenus("somePlugin", pluginRef);

      expect(PluginManagerIDE.resetBookmarks).toHaveBeenCalledTimes(1);
      expect(renderMenus).toHaveBeenCalledTimes(1);
      expect(orchestrator.cachedMenus.has("somePlugin")).toBe(true);
    });

    it("should call cached menu on subsequent calls without pluginRef", async () => {
      const renderMenus = jest.fn();
      const pluginRef = { renderMenus };

      await orchestrator.updateMenus("somePlugin", pluginRef);
      jest.clearAllMocks();

      await orchestrator.updateMenus("somePlugin");

      expect(PluginManagerIDE.resetBookmarks).toHaveBeenCalledTimes(1);
      expect(renderMenus).toHaveBeenCalledTimes(1);
      expect(orchestrator.call).not.toHaveBeenCalled();
    });

    it("should use renderRightMenu if renderMenus undefined", async () => {
      const renderRightMenu = jest.fn();
      const pluginRef = { renderRightMenu };

      await orchestrator.updateMenus("anotherPlugin", pluginRef);

      expect(PluginManagerIDE.resetBookmarks).toHaveBeenCalledTimes(1);
      expect(renderRightMenu).toHaveBeenCalledTimes(1);
      expect(orchestrator.cachedMenus.get("anotherPlugin")).toBe(
        renderRightMenu,
      );
    });
  });

  describe("renderMenus", () => {
    it("should close drawer if ref.current is falsy", async () => {
      const data = { id: "pid", ref: { current: null } };
      await orchestrator.renderMenus(data);
      expect(PluginManagerIDE.resetBookmarks).toHaveBeenCalledTimes(1);
      expect(orchestrator.call).toHaveBeenCalledWith(
        PLUGINS.RIGHT_DRAWER.NAME,
        PLUGINS.RIGHT_DRAWER.CALL.CLOSE,
      );
    });

    it("should call updateMenus if ref.current is truthy", async () => {
      const fakeUpdate = jest
        .spyOn(orchestrator, "updateMenus")
        .mockImplementation(() => Promise.resolve());
      const data = { id: "pid2", ref: { current: {} } };
      await orchestrator.renderMenus(data);
      expect(PluginManagerIDE.resetBookmarks).toHaveBeenCalledTimes(1);
      expect(fakeUpdate).toHaveBeenCalledWith("pid2", {});
    });
  });
});
