import Workspace from "./Workspace";
import { DEFAULT_LAYOUT } from "./Constants";

// --- Mocks ---

// 1. Mock LocalStorage class
const mockStorage = {
  get: jest.fn(),
  set: jest.fn(),
};
jest.mock("./LocalStorage", () => {
  return jest.fn().mockImplementation(() => mockStorage);
});

// 2. Mock User class from core lib
jest.mock("@mov-ai/mov-fe-lib-core", () => ({
  User: jest.fn().mockImplementation(() => ({
    getUsername: () => "test-user",
  })),
}));

// 3. Mock AppSettings
jest.mock("../App/AppSettings", () => ({
  APP_INFORMATION: { VERSION: "1.2.3" },
}));

// 4. Mock Constants (to ensure tests run without actual file)
jest.mock("./Constants", () => ({
  DOCK_POSITIONS: { DOCK: "main" },
  DEFAULT_LAYOUT: { name: "default_layout" },
  DEFAULT_TABS: new Map([["tab1", { id: "tab1" }]]),
}));

describe("Workspace Singleton", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    // Re-initialize before every test to reset internal state
    await Workspace.init();
  });

  describe("Initialization", () => {
    it("should initialize storage keys based on user and version", () => {
      // Check if internal keys were constructed correctly
      const expectedBase = "movai.test-user.1.2.3.movai-ide-ce";
      expect(Workspace.LAYOUT_KEY).toBe(`${expectedBase}.layout`);
      expect(Workspace.TABS_KEY).toBe(`${expectedBase}.tabs`);
    });

    it("should load defaults when storage is empty", () => {
      mockStorage.get.mockReturnValue(null); // Storage empty
      const layout = Workspace.getLayout();
      expect(layout).toBe(DEFAULT_LAYOUT);
    });
  });

  describe("Layout & Tabs", () => {
    it("should set and get layout", () => {
      const newLayout = { name: "custom_layout" };
      Workspace.setLayout(newLayout);

      expect(mockStorage.set).toHaveBeenCalledWith(
        Workspace.LAYOUT_KEY,
        newLayout,
      );
      expect(Workspace.layout).toBe(newLayout);
    });

    it("should set tabs and convert Map to Object for storage", () => {
      const newTabs = new Map([["file1", { content: "abc" }]]);
      Workspace.setTabs(newTabs);

      const expectedObj = { file1: { content: "abc" } };
      expect(mockStorage.set).toHaveBeenCalledWith(
        Workspace.TABS_KEY,
        expectedObj,
      );
      expect(Workspace.getTabs()).toBe(newTabs);
    });

    it("should get stored tabs and convert Object back to Map", () => {
      const storedObj = { file2: { content: "xyz" } };
      mockStorage.get.mockReturnValue(storedObj);

      const result = Workspace.getStoredTabs();
      expect(result).toBeInstanceOf(Map);
      expect(result.get("file2")).toEqual({ content: "xyz" });
    });
  });
});
