import { renderHook } from "@testing-library/react-hooks";
import useNodeStatusUpdate from "./useNodeStatusUpdate";

// Mock RobotManager from @mov-ai/mov-fe-lib-core
jest.mock("@mov-ai/mov-fe-lib-core", () => ({
  RobotManager: jest.fn().mockImplementation(() => ({
    getRobot: () => ({
      data: {},
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    }),
  })),
}));

// Mock i18n from @mov-ai/mov-fe-lib-react
jest.mock("@mov-ai/mov-fe-lib-react", () => ({
  i18n: { t: (str) => str },
}));

describe("useNodeStatusUpdate", () => {
  it("should return robotStatus and methods", () => {
    const props = {
      id: "test-id",
      version: "1",
      alert: jest.fn(),
      onStartStopFlow: jest.fn(),
      mainInterface: {
        current: {
          resetAllNodeStatus: jest.fn(),
          nodeStatusUpdated: jest.fn(),
          id: "test-id",
        },
      },
    };
    const { result } = renderHook(() =>
      useNodeStatusUpdate(props, "robot1", "view"),
    );
    expect(result.current).toHaveProperty("robotSubscribe");
    expect(result.current).toHaveProperty("robotUnsubscribe");
    expect(result.current).toHaveProperty("getFlowPath");
    expect(result.current).toHaveProperty("robotStatus");
    expect(typeof result.current.getFlowPath).toBe("function");
    expect(typeof result.current.robotSubscribe).toBe("function");
    expect(typeof result.current.robotUnsubscribe).toBe("function");
    expect(typeof result.current.robotStatus).toBe("object");
  });
});
