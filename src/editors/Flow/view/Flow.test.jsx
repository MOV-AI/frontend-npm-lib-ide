/* eslint-env jest */

import React from "react";
import { render } from "@testing-library/react";
import { KEYBINDINGS } from "../../../utils/shortcuts";

import Clipboard, { KEYS } from "./Utils/Clipboard";

jest.mock("../../../engine/ReactPlugin/EditorReactPlugin", () => ({
  withEditorPlugin: (C) => C,
}));

jest.mock("../../../engine/ReactPlugin/ViewReactPlugin", () => ({
  usePluginMethods: () => {},
  withViewPlugin: (C) => C,
}));

jest.mock("./styles", () => ({ flowStyles: () => ({ root: "flow-root" }) }));

jest.mock("../../../utils/Workspace", () => {
  return jest.fn().mockImplementation(() => ({
    getFlowIsDebugging: () => false,
    setFlowIsDebugging: () => {},
  }));
});

jest.mock("./Views/BaseFlow", () => {
  const { EVT_NAMES } = require("../view/events");

  return ({ onReady }) => {
    onReady({
      selectedNodes: [
        {
          data: { id: "NODE1" },
          center: { xCenter: 10, yCenter: 20 },
          handleSelectionChange: jest.fn(),
        },
      ],
      getUpdatedVersionOfNode: (node) =>
        Promise.resolve({
          data: node.data,
          center: {
            xCenter: node.center?.xCenter ?? 0,
            yCenter: node.center?.yCenter ?? 0,
          },
        }),
      graph: {
        getSearchOptions: () => [],
        validator: {
          setWarningActions: jest.fn(),
        },
        onFlowValidated: {
          subscribe: jest.fn(),
        },
        reStrokeLinks: jest.fn(),
      },
      pasteNode: jest.fn(),
      deleteNode: jest.fn(),
      setMode: jest.fn(),
      mode: Object.fromEntries(
        Object.values(EVT_NAMES).map((eventName) => [
          eventName,
          {
            onEnter: { subscribe: () => ({ unsubscribe: jest.fn() }) },
            onClick: { subscribe: () => ({ unsubscribe: jest.fn() }) },
          },
        ]),
      ),
      canvas: {
        mousePosition: { x: 0, y: 0 },
        events: {
          pipe: () => ({ subscribe: () => ({ unsubscribe: jest.fn() }) }),
        },
      },
      onToggleWarnings: jest.fn(),
      onResetZoom: jest.fn(),
      onMoveNode: jest.fn(),
      onFocusNode: jest.fn(),
    });
    return null;
  };
});

jest.mock("./Components/FlowTopBar/FlowTopBar", () => () => null);
jest.mock("./Components/FlowBottomBar/FlowBottomBar", () => () => null);

jest.spyOn(Clipboard.prototype, "write");
jest.spyOn(Clipboard.prototype, "read");
Clipboard.prototype.read.mockReturnValue(null);

const binds = [];
jest.mock("../../../utils/keybinds", () => ({
  useKeyBinds: () => ({
    addKeyBind: (sc, handler) => binds.push({ sc, handler }),
    removeKeyBind: jest.fn(),
  }),
}));

import Flow from "./Flow";

describe("<Flow />", () => {
  let props, fakeInstance;

  beforeEach(() => {
    binds.length = 0;
    Clipboard.prototype.write.mockClear();
    Clipboard.prototype.read.mockClear().mockReturnValue(null);

    fakeInstance = {
      current: {
        links: { data: [] },
        version: "1.2.3",
        serializeToDB: () => ({}),
      },
    };

    props = {
      id: "flow1",
      name: "flow1",
      scope: "SCOPE",
      data: { id: "flow1" },
      instance: fakeInstance,
      call: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      alert: jest.fn(),
      confirmationAlert: jest.fn(),
      activateEditor: jest.fn(),
    };
  });

  it("mounts without crashing", () => {
    expect(() => render(<Flow {...props} />)).not.toThrow();
  });

  it("registers a PASTE_NODE keybind that no-ops when clipboard.read() is null", async () => {
    render(<Flow {...props} />);
    const paste = binds.find(
      (b) => b.sc === KEYBINDINGS.FLOW.KEYBINDS.PASTE_NODE.SHORTCUTS,
    );
    expect(paste).toBeDefined();
    await expect(
      Promise.resolve().then(() => paste.handler({ preventDefault: () => {} })),
    ).resolves.not.toThrow();
    expect(Clipboard.prototype.write).not.toHaveBeenCalled();
  });

  it("registers a COPY_NODE keybind that writes to the clipboard", async () => {
    render(<Flow {...props} />);
    const copyBind = binds.find(
      (b) => b.sc === KEYBINDINGS.FLOW.KEYBINDS.COPY_NODE.SHORTCUTS,
    );
    expect(copyBind).toBeDefined();

    await Promise.resolve().then(() =>
      copyBind.handler({ preventDefault: () => {} }),
    );

    expect(Clipboard.prototype.write).toHaveBeenCalledWith(
      KEYS.NODES_TO_COPY,
      expect.objectContaining({
        flow: props.data.id,
        nodes: [{ id: "NODE1" }],
        nodesPosFromCenter: [expect.objectContaining({ vec: [0, 0] })],
      }),
    );
  });
});
