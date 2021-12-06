import { Document } from "@mov-ai/mov-fe-lib-core";
import BaseStore from "./BaseStore";

class Store extends BaseStore {
  /**
   * Returns a list of documents instances
   * @returns {Array<{<Model>}}
   */
  getDocs() {
    return Array.from(this.data.values());
  }

  /**
   * Returns a document instance
   * @param {string} name : The name of the document
   * @returns {Promise<{<Model>}}
   */
  readDoc(name) {
    const doc = this.data.get(name);
    return doc?.isLoaded ? Promise.resolve(doc) : this.loadDoc(name);
  }

  /**
   * Creates a document in the store and returns the instance
   * @param {string} name The name of the document to create
   * @returns {Object<Model>}
   */
  newDoc(name) {
    const newName = name || this.generateName();
    const obj = new this.model(newName);
    obj.setIsNew(true);
    obj.setIsLoaded(true);
    this.data.set(newName, obj);
    return obj;
  }

  /**
   * Deletes the document from the store and the database
   * @param {string} name The name of the document to delete
   * @returns {Promise<>}
   */
  deleteDoc(name) {
    return new Document.delete({
      name,
      type: this.scope,
      body: {}
    }).then(() => {
      return this.deleteDocFromStore(name);
    });
  }

  /**
   * Saves the document in the database
   * @param {string} name The name of the document to save
   * @param {string} newName The new name of the document (when renaming)
   * @returns {Promise<{success, name}>}
   */
  saveDoc(name, newName) {
    const { scope } = this;

    // get document from store
    const doc = this.data.get(name);

    // rename the document
    if (newName) doc.setName(newName);

    //get the document data
    const data = doc.serializeToDB();

    // If is a new document => create document in DB
    // If is not a new document => update in DB
    const saveMethodByIsNew = {
      true: _data => {
        const payload = {
          type: scope,
          name: _data.Label,
          body: _data
        };
        return Document.create(payload).then(res => {
          if (res.success) doc.setIsNew(false).setDirty(false);
          return res;
        });
      },
      false: _data => {
        const document = new Document(Document.parsePath(name, scope));
        return document.overwrite(_data).then(res => {
          if (res.success) doc.setDirty(false);
          return res;
        });
      }
    };

    return saveMethodByIsNew[doc.isNew](data);
  }

  /**
   *
   * @param {string} name The name of the document to copy
   * @param {string} newName The name of the new document (copy)
   * @returns {Promise<>}
   */
  copyDoc(name, newName) {
    return this.readDoc(name).then(doc => {
      const newObj = this.model
        .ofJSON(doc.serialize())
        .setIsNew(true)
        .setName(newName);

      this.data.set(newName, newObj);
      this.saveDoc(newName);
    });
  }

  /**
   * Checks if a document exists in the store
   * @param {string} name The name of the document to check
   * @returns {Boolean}
   */
  checkDocExists(name) {
    return this.data.has(name);
  }

  /**
   * Checks if the store has any documents changed (dirty)
   * @returns {Boolean}
   */
  hasDirties() {
    return Array.from(this.data.values).some(obj => obj.getDirty());
  }

  /**
   * Saves all changed documents
   * @returns {Promise<>}
   */
  saveDirties() {
    const promises = Array.from(this.data.values)
      .filter(obj => obj.getDirty())
      .map(obj => {
        return this.saveDoc(obj.getName());
      });

    return Promise.allSettled(promises);
  }
}

export default Store;
