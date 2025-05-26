/* eslint-env jest */

jest.mock("../../../../../utils/Workspace", () => {
  const workspaceMock = {
    getSelectedRobot: jest.fn().mockReturnValue(undefined),
    setSelectedRobot: jest.fn().mockImplementation((id) => {
      workspaceMock.getSelectedRobot.mockReturnValue(id);
    }),
  };
  const WorkspaceFactory = jest.fn().mockImplementation(() => workspaceMock);
  WorkspaceFactory.__workspaceMock = workspaceMock;
  return { __esModule: true, default: WorkspaceFactory };
});

import React from "react";
import { render, screen, within, waitFor, act } from "@testing-library/react";
import { i18n } from "@mov-ai/mov-fe-lib-react";
import { Rest } from "@mov-ai/mov-fe-lib-core";
import userEvent from "@testing-library/user-event";
import WorkspaceFactory from "../../../../../utils/Workspace";

import FlowTopBar from "./FlowTopBar";

jest.mock("@mov-ai/mov-fe-lib-core", () => ({
  RobotManager: jest.fn().mockImplementation(() => ({
    getAll: jest.fn((cb) =>
      cb({ r1: { RobotName: "Robot One" }, r2: { RobotName: "Robot Two" } }),
    ),
  })),
  CONSTANTS: { GLOBAL_WORKSPACE: "global" },
  Rest: {
    post: jest.fn().mockResolvedValue({ success: true }),
  },
}));

jest.mock("./hooks/useNodeStatusUpdate", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("./styles", () => ({
  flowTopBarStyles: () => ({}),
  buttonStyles: () => ({}),
}));

describe("FlowTopBar", () => {
  let callMock,
    helper,
    onRobotChange,
    onViewModeChange,
    confirmationAlert,
    mainInterface;

  beforeEach(() => {
    jest.clearAllMocks();

    WorkspaceFactory.__workspaceMock.getSelectedRobot.mockReturnValue(
      undefined,
    );

    helper = {
      getDefaultRobot: jest.fn().mockResolvedValue("r1"),
      sendToRobot: jest.fn().mockResolvedValue(true),
    };

    callMock = jest.fn((plugin, method, args, cb) => {
      if (method === "getStore") return Promise.resolve({ helper });
      if (method === "read")
        return Promise.resolve({
          getDirty: jest.fn().mockReturnValue(false),
          model: { getUrl: jest.fn().mockReturnValue("path1") },
        });
      if (method === "save") {
        cb({ model: { getUrl: jest.fn().mockReturnValue("path1") } });
        return Promise.resolve();
      }
      return Promise.resolve();
    });

    require("./hooks/useNodeStatusUpdate").default.mockReturnValue({
      robotSubscribe: jest.fn(),
      robotUnsubscribe: jest.fn(),
      getFlowPath: jest.fn(() => "path1"),
      robotStatus: { activeFlow: "", isOnline: true },
    });

    onRobotChange = jest.fn();
    onViewModeChange = jest.fn();
    confirmationAlert = jest.fn();
    mainInterface = {
      current: {
        graph: {
          validateFlow: jest.fn(),
          warnings: [],
          warningsVisibility: true,
          setPermanentWarnings: jest.fn(),
        },
      },
    };
  });

  async function setup(props = {}) {
    let container;
    await act(async () => {
      const result = render(
        <FlowTopBar
          call={callMock}
          alert={jest.fn()}
          scope="flow"
          loading={false}
          mainInterface={mainInterface}
          id="flow1"
          name="flowName"
          onRobotChange={onRobotChange}
          onViewModeChange={onViewModeChange}
          viewMode="default"
          searchProps={{
            visible: true,
            options: [],
            onChange: jest.fn(),
            onEnabled: jest.fn(),
            onDisabled: jest.fn(),
          }}
          confirmationAlert={confirmationAlert}
          canRun={true}
          {...props}
        />,
      );
      container = result.container;
    });

    await waitFor(() =>
      expect(callMock).toHaveBeenCalledWith("docManager", "getStore", "flow"),
    );

    await waitFor(() => expect(helper.getDefaultRobot).toHaveBeenCalled());

    return container;
  }

  it("renders the two view-mode buttons and the robot selector", async () => {
    await setup();
    expect(screen.getByTestId("input_tree-view-flow")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Robot/i })).toBeInTheDocument();
  });

  it("changes view mode", async () => {
    await setup();

    act(() => {
      userEvent.click(screen.getByTestId("input_tree-view-flow"));
    });

    expect(onViewModeChange).toHaveBeenCalledWith("treeView");
  });

  it("selects a new robot", async () => {
    await setup();

    act(() => {
      userEvent.click(screen.getByRole("button", { name: "Robot One" }));
    });

    const listbox = await screen.findByRole("listbox", { hidden: true });

    expect(listbox).toBeInTheDocument();

    const option = within(listbox).getByRole("option", {
      name: "Robot Two",
      hidden: true,
    });

    await act(async () => userEvent.click(option));

    const workspaceMock = WorkspaceFactory.__workspaceMock;

    expect(workspaceMock.setSelectedRobot).toHaveBeenCalledWith("r2");
    expect(workspaceMock.getSelectedRobot()).toBe("r2");
    expect(onRobotChange).toHaveBeenCalledWith("r2");
  });

  it("starts flow", async () => {
    await setup();

    act(() => {
      userEvent.click(screen.getByTestId("input_save-before-start"));
    });

    await waitFor(() =>
      expect(helper.sendToRobot).toHaveBeenCalledWith({
        action: "START",
        flowPath: "path1",
        robotId: "r1",
      }),
    );
  });

  it("stops flow", async () => {
    require("./hooks/useNodeStatusUpdate").default.mockReturnValue({
      robotSubscribe: jest.fn(),
      robotUnsubscribe: jest.fn(),
      getFlowPath: jest.fn(() => "path1"),
      robotStatus: { activeFlow: "path1", isOnline: true },
    });

    await setup();

    act(() => {
      userEvent.click(screen.getByTestId("input_stop-flow"));
    });

    await waitFor(() =>
      expect(helper.sendToRobot).toHaveBeenCalledWith({
        action: "STOP",
        flowPath: "path1",
        robotId: "r1",
      }),
    );
  });

  it("prompts when another flow is running", async () => {
    require("./hooks/useNodeStatusUpdate").default.mockReturnValue({
      robotSubscribe: jest.fn(),
      robotUnsubscribe: jest.fn(),
      getFlowPath: jest.fn(() => "path1"),
      robotStatus: { activeFlow: "otherFlow", isOnline: true },
    });

    await setup();

    await act(async () =>
      userEvent.click(screen.getByTestId("input_save-before-start")),
    );

    await waitFor(() =>
      expect(confirmationAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: i18n.t("AnotherFlowRunningConfirmationTitle"),
          message: i18n.t("AnotherFlowRunningConfirmationMessage", {
            robotName: "Robot One",
            activeFlow: "otherFlow",
            id: "flow1",
          }),
          submitText: i18n.t("Run"),
          onSubmit: expect.any(Function),
        }),
      ),
    );
  });
});
