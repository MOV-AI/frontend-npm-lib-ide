import DocManager from "./DocManager";
import { PLUGINS } from "../../utils/Constants";

// Mock the factory
jest.mock("./factory", () => {
  return jest.fn(() => ({}));
});

// Mock IDEPlugin
jest.mock("../../engine/IDEPlugin/IDEPlugin", () => {
  return class IDEPlugin {
    constructor(profile) {
      this.profile = profile;
      this.pluginManager = {
        call: jest.fn(),
        emit: jest.fn(),
      };
    }
    call(...args) {
      return this.pluginManager.call(...args);
    }
    emit(...args) {
      return this.pluginManager.emit(...args);
    }
  };
});

describe("DocManager", () => {
  let docManager;

  beforeEach(() => {
    docManager = new DocManager();
    docManager.activate();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getName", () => {
    test("should return DocManager", () => {
      expect(docManager.getName()).toBe("DocManager");
    });
  });

  describe("subscribeToChanges", () => {
    test("should add subscription callback", () => {
      const id = "test-id";
      const callback = jest.fn();

      docManager.subscribeToChanges(id, callback);

      expect(docManager.docSubscriptions.has(id)).toBe(true);
      expect(docManager.docSubscriptions.get(id)).toBe(callback);
    });
  });

  describe("unSubscribeToChanges", () => {
    test("should remove subscription", () => {
      const id = "workspace/Flow/test-flow";
      const callback = jest.fn();

      docManager.subscribeToChanges(id, callback);
      expect(docManager.docSubscriptions.has(id)).toBe(true);

      docManager.unSubscribeToChanges(id);
      expect(docManager.docSubscriptions.has(id)).toBe(false);
    });

    test("should return false when subscription does not exist", () => {
      const result = docManager.unSubscribeToChanges("non-existent/Flow/test");
      expect(result).toBeUndefined();
    });
  });

  describe("onDocumentUpdate", () => {
    test("should call all subscribed callbacks", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const mockDoc = {
        serializeToDB: jest.fn().mockReturnValue({ data: "test" }),
      };

      docManager.subscribeToChanges("id1", callback1);
      docManager.subscribeToChanges("id2", callback2);

      docManager.onDocumentUpdate(mockDoc);

      expect(mockDoc.serializeToDB).toHaveBeenCalled();
      expect(callback1).toHaveBeenCalledWith({ data: "test" });
      expect(callback2).toHaveBeenCalledWith({ data: "test" });
    });
  });

  describe("getDocFactory", () => {
    test("should return document factory by name", () => {
      const mockFactory = { store: "test-store" };
      docManager.docsMap = { Flow: mockFactory };

      expect(docManager.getDocFactory("Flow")).toBe(mockFactory);
    });
  });

  describe("getStore", () => {
    test("should return store by name", () => {
      const mockStore = { name: "Flow" };
      docManager.docsMap = { Flow: { store: mockStore } };

      expect(docManager.getStore("Flow")).toBe(mockStore);
    });

    test("should return undefined for non-existent store", () => {
      docManager.docsMap = {};
      expect(docManager.getStore("NonExistent")).toBeUndefined();
    });
  });

  describe("getStores", () => {
    test("should return all stores", () => {
      const mockStore1 = { name: "Flow" };
      const mockStore2 = { name: "Node" };
      docManager.docsMap = {
        Flow: { store: mockStore1 },
        Node: { store: mockStore2 },
      };

      const stores = docManager.getStores();
      expect(stores).toEqual([mockStore1, mockStore2]);
    });
  });

  describe("getDocTypes", () => {
    test("should return document types", () => {
      docManager.docsMap = {
        Flow: { store: { name: "Flow", title: "Flow", scope: "Flow" } },
        Node: { store: { name: "Node", title: "Node", scope: "Node" } },
      };

      const docTypes = docManager.getDocTypes();
      expect(docTypes).toEqual([
        { name: "Flow", title: "Flow", scope: "Flow" },
        { name: "Node", title: "Node", scope: "Node" },
      ]);
    });
  });

  describe("hasDirties", () => {
    test("should return true if any store has dirties", () => {
      const mockStore1 = { hasDirties: jest.fn().mockReturnValue(false) };
      const mockStore2 = { hasDirties: jest.fn().mockReturnValue(true) };
      docManager.docsMap = {
        Flow: { store: mockStore1 },
        Node: { store: mockStore2 },
      };

      expect(docManager.hasDirties()).toBe(true);
    });

    test("should return false if no store has dirties", () => {
      const mockStore1 = { hasDirties: jest.fn().mockReturnValue(false) };
      const mockStore2 = { hasDirties: jest.fn().mockReturnValue(false) };
      docManager.docsMap = {
        Flow: { store: mockStore1 },
        Node: { store: mockStore2 },
      };

      expect(docManager.hasDirties()).toBe(false);
    });
  });

  describe("checkDocumentExists", () => {
    test("should check if document exists", () => {
      const mockStore = { checkDocExists: jest.fn().mockReturnValue(true) };
      docManager.docsMap = { Flow: { store: mockStore } };

      const result = docManager.checkDocumentExists({
        name: "test-flow",
        scope: "Flow",
      });

      expect(mockStore.checkDocExists).toHaveBeenCalledWith("test-flow");
      expect(result).toBe(true);
    });
  });

  describe("discardDocChanges", () => {
    test("should discard document changes", () => {
      const mockStore = { discardDocChanges: jest.fn() };
      docManager.docsMap = { Flow: { store: mockStore } };

      docManager.discardDocChanges({ name: "test-flow", scope: "Flow" });

      expect(mockStore.discardDocChanges).toHaveBeenCalledWith("test-flow");
    });
  });

  describe("read", () => {
    test("should read document from store", () => {
      const mockDoc = { name: "test" };
      const mockStore = {
        readDoc: jest.fn().mockResolvedValue(mockDoc),
      };
      docManager.docsMap = { Flow: { store: mockStore } };

      return docManager
        .read({ name: "test-flow", scope: "Flow" })
        .then((doc) => {
          expect(mockStore.readDoc).toHaveBeenCalledWith("test-flow");
          expect(doc).toBe(mockDoc);
        });
    });
  });

  describe("create", () => {
    test("should create new document", () => {
      const mockDoc = { name: "new-doc" };
      const mockStore = { newDoc: jest.fn().mockReturnValue(mockDoc) };
      docManager.docsMap = { Flow: { store: mockStore } };

      const result = docManager.create({ name: "new-doc", scope: "Flow" });

      expect(mockStore.newDoc).toHaveBeenCalledWith("new-doc");
      expect(result).toBe(mockDoc);
    });
  });

  describe("copy", () => {
    test("should copy document", () => {
      const mockStore = { copyDoc: jest.fn() };
      docManager.docsMap = { Flow: { store: mockStore } };

      docManager.copy({ name: "original", scope: "Flow" }, "copy");

      expect(mockStore.copyDoc).toHaveBeenCalledWith("original", "copy");
    });
  });

  describe("delete", () => {
    test("should delete document", () => {
      const mockStore = { deleteDoc: jest.fn() };
      docManager.docsMap = { Flow: { store: mockStore } };

      docManager.delete({ name: "test-doc", scope: "Flow" });

      expect(mockStore.deleteDoc).toHaveBeenCalledWith("test-doc");
    });
  });

  describe("broadcast", () => {
    test("should emit event", () => {
      const emitSpy = jest.spyOn(docManager, "emit");
      const event = "TEST_EVENT";
      const data = { test: "data" };

      docManager.broadcast(event, data);

      expect(emitSpy).toHaveBeenCalledWith(event, data);
    });
  });

  describe("onBeforeUnload", () => {
    test("should prevent default if there are dirties", () => {
      const mockStore = { hasDirties: jest.fn().mockReturnValue(true) };
      docManager.docsMap = { Flow: { store: mockStore } };

      const event = { preventDefault: jest.fn() };
      const result = docManager.onBeforeUnload(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(result).toBe(
        "You have unsaved documents. Are you sure you want to quit?",
      );
    });

    test("should not prevent default if there are no dirties", () => {
      const mockStore = { hasDirties: jest.fn().mockReturnValue(false) };
      docManager.docsMap = { Flow: { store: mockStore } };

      const event = { preventDefault: jest.fn() };
      const result = docManager.onBeforeUnload(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });
});
