/* eslint-env jest */

jest.mock("./canvas", () => {
  const { BehaviorSubject } = require("rxjs");
  return class {
    constructor({ classes }) {
      if (!classes?.flowEditor) {
        throw new Error("you must pass classes.flowEditor in your test");
      }
      this.el = { focus: jest.fn() };
      this.events = new BehaviorSubject({ name: null });
    }
    getPositionInBoundaries = (x, y) => ({ x, y });
    appendDocumentFragment = jest.fn();
    onResetZoom = jest.fn();
    zoomToCoordinates = jest.fn();
  };
});

jest.mock("../../Core/Graph/GraphBase", () => {
  return class {
    constructor() {
      this.selectedNodes = [];
      this.selectedLink = null;
      this.nodes = new Map();
      this.links = new Map();
    }
    loadData = jest.fn().mockResolvedValue();
    updateAllPositions = jest.fn();
    addNode = jest.fn().mockResolvedValue();
    validateFlow = jest.fn();
    deleteLinks = jest.fn();
    deleteNode = jest.fn();
    update = jest.fn();
    updateExposedPorts = jest.fn();
    resetStatus = jest.fn();
    onNodeDrag = jest.fn();
    updateWarningsVisibility = jest.fn();
  };
});

import Factory from "../Nodes/Factory";
import MainInterface, {
  _set,
  _marks,
  ensureParents,
  cachedNodeStatus,
} from "./MainInterface";
import { NODE_TYPES } from "../../Constants/constants";

describe("_set()", () => {
  it("throws when splits is empty", () => {
    expect(() => _set({}, 123, [])).toThrow("Invalid splits array");
  });

  it("builds nested paths correctly", () => {
    const obj = {};
    _set(obj, "foo", ["a", "b", "c"]);
    expect(obj).toEqual({ a: { b: { c: "foo" } } });
  });
});

describe("_marks()", () => {
  it("flattens an object into “dot” keys with 1/0 flags", () => {
    const input = { a: { x: true, y: false }, b: false };
    const m = _marks(input);
    expect(m).toEqual({ a: 1, a__x: 1, a__y: 0, b: 0 });
  });
});

describe("ensureParents()", () => {
  afterEach(() => {
    for (let k in cachedNodeStatus) delete cachedNodeStatus[k];
  });

  it("turns off children when parent is off", () => {
    Object.assign(cachedNodeStatus, { foo: 1, foo__bar: 1 });
    const out = ensureParents({ foo__bar: 0 });
    expect(out).toMatchObject({ foo: 0, foo__bar: 0 });
  });

  it("keeps new nodes on even if not previously present", () => {
    const out = ensureParents({ a: 1, a__b: 1, c: 0 });
    expect(out).toMatchObject({ a: 1, a__b: 1, c: 0 });
  });
});

describe("MainInterface#getUpdatedVersionOfNode", () => {
  let mi;
  const classes = { flowEditor: { interfaceColor: "iclass" } };
  const docManager = jest.fn();
  const modelView = {
    current: {
      serializeToDB: () => ({
        NodeInst: { foo: { foo: 1 } },
        Container: {},
      }),
      serialize: () => ({}),
    },
  };

  beforeEach(() => {
    mi = new MainInterface({
      id: "ID",
      containerId: "CID",
      modelView,
      width: 200,
      height: 200,
      data: {},
      classes,
      call: docManager,
    });
    jest.spyOn(Factory, "create").mockResolvedValue({ replaced: true });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("calls Factory.create with the right args and returns the created node", async () => {
    const oldNode = {
      data: { id: "foo" },
      nodeType: NODE_TYPES.NODE,
      name: "foo",
      events: { some: "event" },
    };

    const result = await mi.getUpdatedVersionOfNode(oldNode);
    expect(Factory.create).toHaveBeenCalledWith(
      mi.docManager,
      Factory.OUTPUT.NODE,
      {
        canvas: mi.canvas,
        node: expect.objectContaining({ id: "foo" }),
        events: oldNode.events,
      },
    );
    expect(result).toEqual({ replaced: true });
  });

  it("if Factory.create throws, it returns the original node", async () => {
    jest.spyOn(Factory, "create").mockRejectedValue(new Error("fail"));
    const oldNode = {
      data: { id: "foo" },
      nodeType: NODE_TYPES.NODE,
      name: "foo",
      events: {},
    };
    const result = await mi.getUpdatedVersionOfNode(oldNode);
    expect(result).toBe(oldNode);
  });
});

describe("MainInterface#onSelectNode", () => {
  let mi, nodeA, nodeB;
  const classes = { flowEditor: { interfaceColor: "iclass" } };
  const docManager = jest.fn();
  const modelView = {
    current: {
      serializeToDB: () => ({ NodeInst: {}, Container: {} }),
      serialize: () => ({}),
    },
  };

  beforeEach(() => {
    mi = new MainInterface({
      id: "ID",
      containerId: "CID",
      modelView,
      width: 200,
      height: 200,
      data: {},
      classes,
      call: docManager,
    });

    nodeA = {
      name: "A",
      data: { id: "A", model: "X" },
      selected: true,
      events: {},
    };
    nodeB = {
      name: "B",
      data: { id: "B", model: "X" },
      selected: false,
      events: {},
    };

    mi.selectedLink = { onSelected: jest.fn() };
    mi.selectedNodes = [];
  });

  it("selects only nodes that are clicked when shiftKey=false", () => {
    const mi = new MainInterface({
      id: "ID",
      containerId: "CID",
      modelView,
      width: 200,
      height: 200,
      data: {},
      classes,
      call: docManager,
    });

    const nodeA = { data: { model: "foo" }, selected: true, name: "A" };
    const nodeB = { data: { model: "foo" }, selected: false, name: "B" };

    const fakeLink = { onSelected: jest.fn() };
    mi.selectedLink = fakeLink;

    mi.onSelectNode({ nodes: [nodeA, nodeB], shiftKey: false });

    expect(mi.selectedNodes).toEqual([nodeA]);
    expect(fakeLink.onSelected).toHaveBeenCalledWith(false);
  });

  it("toggles off a node if it is deselected", () => {
    mi.selectedNodes = [nodeA];
    nodeA.selected = false;
    mi.onSelectNode({ nodes: [nodeA], shiftKey: false });
    expect(mi.selectedNodes).toEqual([]);
  });

  it("adds to existing selection when shiftKey=true", () => {
    mi.selectedNodes = [nodeA];
    nodeB.selected = true;
    mi.onSelectNode({ nodes: [nodeB], shiftKey: true });
    expect(mi.selectedNodes).toContain(nodeA);
    expect(mi.selectedNodes).toContain(nodeB);
  });
});
