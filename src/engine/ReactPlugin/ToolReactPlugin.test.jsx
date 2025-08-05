/* eslint-env jest */

import React from "react";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { withToolPlugin } from "./ToolReactPlugin";
import { ViewPlugin } from "./ViewReactPlugin";

// Mock decorators
jest.mock("@mov-ai/mov-fe-lib-react", () => ({
  withTheme: (Component) => Component,
}));
jest.mock("../../decorators/withAlerts", () => (Component) => Component);
jest.mock("../../utils/Utils", () => ({
  composeDecorators: (Comp, decorators) =>
    decorators.reduce((C, dec) => dec(C), Comp),
}));

// Mock keybinds util
jest.mock("../../utils/keybinds", () => ({
  setUrl: jest.fn(),
}));

// Mock Constants
jest.mock("../../utils/Constants", () => ({
  PLUGINS: {
    TABS: {
      NAME: "tabs",
      CALL: { GET_ACTIVE_TAB: "getActiveTab", FOCUS_EXISTING_TAB: "focusTab" },
    },
    ORCHESTRATOR: {
      NAME: "orchestrator",
      CALL: { RENDER_MENUS: "renderMenus" },
    },
  },
}));

describe("withToolPlugin HOC", () => {
  const DummyComponent = jest.fn(() => <div data-testid="dummy">Hello</div>);

  it("returns a ViewPlugin subclass whose render outputs the inner component", () => {
    const PluginClass = withToolPlugin(DummyComponent);
    expect(PluginClass.prototype).toBeInstanceOf(ViewPlugin);
    const instance = new PluginClass({ name: "testPlugin" }, {});
    const fakeCall = jest.fn();

    // Wrap in a role=tabpanel container, override call prop
    const { getByTestId } = render(
      <div role="tabpanel" id="tab-1">
        {React.cloneElement(instance.render(), { call: fakeCall })}
      </div>,
    );

    expect(getByTestId("dummy")).toHaveTextContent("Hello");
  });

  it("calls renderMenus, focusExistingTab and activateTool on mount", async () => {
    const fakeCall = jest.fn().mockResolvedValueOnce({ id: "tab-1" });
    const profile = { name: "profile1" };
    const PluginClass = withToolPlugin(DummyComponent);
    const instance = new PluginClass(profile, {});
    const element = instance.render();

    render(
      <div role="tabpanel" id="tab-1">
        {React.cloneElement(element, { call: fakeCall })}
      </div>,
    );

    await waitFor(() => {
      expect(fakeCall).toHaveBeenCalledWith(
        "orchestrator",
        "renderMenus",
        expect.objectContaining({ id: "tab-1", ref: instance.ref }),
      );
      expect(fakeCall).toHaveBeenCalledWith("tabs", "focusTab", "tab-1");
    });
  });

  it("re-activates tool on click", async () => {
    const fakeCall = jest.fn().mockResolvedValue({ id: "tab-2" });
    const profile = { name: "profile2" };
    const PluginClass = withToolPlugin(DummyComponent);
    const instance = new PluginClass(profile, {});
    const element = instance.render();

    const { getByTestId } = render(
      <div role="tabpanel" id="tab-2">
        {React.cloneElement(element, { call: fakeCall })}
      </div>,
    );

    userEvent.click(getByTestId("dummy").parentElement);

    await waitFor(() => {
      expect(fakeCall).toHaveBeenCalledWith("tabs", "getActiveTab");
    });
  });

  it("matches snapshot via RTL", () => {
    const PluginClass = withToolPlugin(() => <span>Snap</span>);
    const instance = new PluginClass({ name: "snap" }, {});
    const fakeCall = jest.fn();

    const { asFragment } = render(
      <div role="tabpanel" id="snap-tab">
        {React.cloneElement(instance.render(), { call: fakeCall })}
      </div>,
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
