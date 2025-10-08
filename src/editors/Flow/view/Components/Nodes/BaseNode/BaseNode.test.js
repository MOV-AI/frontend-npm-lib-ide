import BaseNode from "./BaseNode";

// Jest globals for linting
/* global describe, it, expect, beforeEach */

// Minimal mock for required constructor args
const mockCanvas = { readOnly: false, containerId: "test-canvas" };
const mockNode = {
  id: "1",
  NodeLabel: "TestNode",
  Template: "TestTemplate",
  Visualization: [100, 200],
};
const mockEvents = {};
const mockTemplate = { name: "TestTemplate" };

describe("BaseNode minimal attribute getters", () => {
  let baseNode;
  beforeEach(() => {
    baseNode = new BaseNode({
      canvas: mockCanvas,
      node: mockNode,
      events: mockEvents,
      template: mockTemplate,
    });
    // Minimal required for .object.node() in el getter
    baseNode.object = { node: () => "svg-element" };
    baseNode._status = { status: true };
  });

  it("gets name", () => {
    expect(baseNode.name).toBe("TestNode");
  });

  it("gets template", () => {
    expect(baseNode.template).toBe(mockTemplate);
  });

  it("gets templateName", () => {
    expect(baseNode.templateName).toBe("TestTemplate");
  });

  it("gets el", () => {
    expect(baseNode.el).toBe("svg-element");
  });

  it("gets status", () => {
    expect(baseNode.status).toBe(true);
  });

  it("gets readOnly", () => {
    expect(baseNode.readOnly).toBe(false);
  });

  it("gets portSize", () => {
    expect(typeof baseNode.portSize).toBe("number");
  });

  it("gets headerPos", () => {
    expect(baseNode.headerPos).toHaveProperty("x");
    expect(baseNode.headerPos).toHaveProperty("y");
  });

  it("gets visualizationToDB", () => {
    expect(baseNode.visualizationToDB).toEqual({
      x: { Value: 100 },
      y: { Value: 200 },
    });
  });

  it("gets ports", () => {
    expect(baseNode.ports).toBeInstanceOf(Map);
  });
});
