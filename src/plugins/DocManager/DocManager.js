import IDEPlugin from "../../engine/IDEPlugin/IDEPlugin";
import docsFactory from "./docs";

const TOPICS = {
  updateDocs: "updateDocs",
  loadDocs: "loadDocs"
};

/**
 * Document Manager plugin to handle requests, subscribers and more
 */
class DocManager extends IDEPlugin {
  constructor(profile = {}) {
    // Remove duplicated if needed
    const methods = Array.from(
      new Set([
        ...(profile.methods || []),
        "getDocTypes",
        "getDocPlugin",
        "getDocFromNameType",
        "checkDocumentExists",
        "copy",
        "delete",
        "create",
        "read",
        "save"
      ])
    );
    super({ ...profile, methods });
    window.DocManager = this;
  }

  activate() {
    const observer = {
      onLoad: store => this.onStoreLoad(store),
      onUpdate: (store, doc) => this.onStoreUpdate(store, doc)
    };

    this.docsMap = docsFactory("global", observer);
  }

  /**
   * Returns array of document types
   * @returns {Array<{name: String, title: String, scope: String}>}
   */
  getDocTypes() {
    return Object.values(this.docsMap).map(type => ({
      name: type.name,
      title: type.title,
      scope: type.scope
    }));
  }
  /**
   * Returns a list of the stores available
   * @returns {Array<Store>} List of stores
   */
  getStores() {
    return Object.values(this.docsMap).map(i => i.store);
  }

  /**
   * Returns the store object or undefined
   * @param {string} name The name of the store
   * @returns {Object<Store>}
   */
  getStore(name) {
    return this.docsMap[name]?.store;
  }

  /**
   * Returns Type object
   * @param {String} type
   * @returns {DocCollection}
   */
  getDocPlugin(type) {
    return this.docsMap[type]?.plugin;
  }

  /**
   * Returns data model from name and type
   * @param {String} name
   * @param {String} scope
   * @returns {Model || undefined}
   */
  getDocFromNameType(name, scope) {
    return this.read({ name, scope });
  }

  /**
   * Check if document already exists
   * @param {{name: String, scope: String}} modelKey
   * @returns {Promise<{result: Boolean, error: String}>}
   */
  checkDocumentExists(modelKey) {
    const { name, scope } = modelKey;
    return this.getStore(scope)?.checkDocExists(name);
  }

  /**
   * Read model from DB
   * @param {{name: String, scope: String}} modelKey
   * @returns {Promise<Model>}
   */
  read(modelKey) {
    const { name, scope } = modelKey;
    return this.getStore(scope)?.readDoc(name) || Promise.reject();
  }

  /**
   * Update existing document
   * @param {{name: String, scope: String}} modelKey
   * @param {String} newName : Used in document creation, where we need to replace "untitled" by newName
   * @returns {Promise<Model>}
   */
  save(modelKey, newName) {
    const { name, scope } = modelKey;
    return this.getStore(scope).saveDoc(name, newName);
  }

  /**
   * Create new document
   * @param {{name: String, scope: String}} modelKey
   * @returns {Object<Model>}
   */
  create(modelKey) {
    const { name, scope } = modelKey;
    return this.getStore(scope)?.newDoc(name);
  }

  /**
   * Create copy of document
   * @param {{name: String, scope: String}} modelKey : Reference model
   * @param {String} newName : Copy name
   */
  copy(modelKey, newName) {
    const { name, scope } = modelKey;
    return this.getStore(scope)?.copyDoc(name, newName);
  }

  /**
   * Delete document from DB
   * @param {{name: String, scope: String}} modelKey
   */
  delete(modelKey) {
    const { name, scope } = modelKey;
    return this.getStore(scope)?.deleteDoc(name);
  }

  /**
   * Verifies if at least a store has one or more documents changed
   * @returns {Boolean}
   */
  hasDirties() {
    return this.getStores().some(store => store.hasDirties());
  }

  /**
   * Saves all the changed documents
   * @returns {Promise<Array>}
   */
  saveDirties() {
    const promises = this.getStores().map(store => {
      return store.saveDirties();
    });

    return Promise.allSettled(promises);
  }

  //========================================================================================
  /*                                                                                      *
   *                                        Events                                        *
   *                                                                                      */
  //========================================================================================

  /**
   * Emits an event when a store fires an onLoad event
   * @param {string} store : The name of the store firing the event
   */
  onStoreLoad(store) {
    this.emit(TOPICS.loadDocs, this);
  }

  /**
   * Emits an eent when a store fires an onUpdate event
   * @param {string} store : The name of the store firing the event
   * @param {object<{documentName, documentType}>} doc
   */
  onStoreUpdate(store, doc) {
    this.emit(TOPICS.updateDocs, this, {
      action: "update",
      ...doc
    });
  }

  beforeUnload = event => {
    const hasDirties = this.hasDirties();
    if (hasDirties) {
      event.preventDefault();
      event.returnValue = "";
    } else {
      delete event["returnValue"];
    }
  };
}

export default DocManager;
