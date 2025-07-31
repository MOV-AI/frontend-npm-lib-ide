jest.mock("@mov-ai/mov-fe-lib-core", () => {
  return {
    WSSub: jest.fn().mockImplementation(() => ({
      subscribe: jest.fn(),
    })),
  };
});

import FLOW_CACHE from "./FlowDB";

describe("FLOW_CACHE", () => {
  beforeEach(() => {
    FLOW_CACHE.clear();
  });

  test("set and get a flow", () => {
    const flow = { Label: "TestFlow", data: "some-data" };

    FLOW_CACHE.set(flow.Label, flow);
    expect(FLOW_CACHE.has("TestFlow")).toBe(true);
    expect(FLOW_CACHE.get("TestFlow")).toEqual(flow);
  });

  test("clear removes all entries", () => {
    FLOW_CACHE.set("Flow1", { Label: "Flow1" });
    FLOW_CACHE.set("Flow2", { Label: "Flow2" });

    expect(FLOW_CACHE.has("Flow1")).toBe(true);
    expect(FLOW_CACHE.has("Flow2")).toBe(true);

    FLOW_CACHE.clear();

    expect(FLOW_CACHE.has("Flow1")).toBe(false);
    expect(FLOW_CACHE.has("Flow2")).toBe(false);
  });

  test("get returns undefined for unknown flow", () => {
    expect(FLOW_CACHE.get("UnknownFlow")).toBeUndefined();
  });
});
