import { Utils, Document } from "@mov-ai/mov-fe-lib-core";
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
    if (this.docMan)
      return this.loadDoc(name).promise;

    const doc = this.getDoc(name);
    return doc?.isLoaded ? Promise.resolve(doc) : this.loadDoc(name);
  }

  /**
   * Creates a document in the store and returns the instance
   * @param {string} name The name of the document to create
   * @returns {Object<Model>}
   */
  newDoc(docName) {
    if (this.docMan)
      return this.docMan.new({
        workspace: this.workspace,
        scope: this.name,
        name: docName,
      }, {});

    const name = docName || this.generateName();

    // create the document instance
    const doc = new this.model({ name });
    doc.setIsNew(true);
    doc.setIsLoaded(true);

    // Add changes subscriber
    doc.subscribe((instance, prop, value) =>
      this.onDocumentUpdate(instance, prop, value)
    );

    // store the document
    this.setDoc(name, doc);
    return doc;
  }

  /**
   * Deletes the document from the store and the database
   * @param {string} name The name of the document to delete
   * @returns {Promise<any>}
   */
  deleteDoc(name) {
    if (this.docMan)
      return this.getDoc().then(doc => doc.destroy());

    const docUrl = this.data.get(name).getUrl();
    return new Document.delete({
      name,
      type: this.scope,
      body: {}
    })
      .then(_ => {
        // delete only if successfully deleted from the database
        return this.deleteDocFromStore(name);
      })
      .then(res => {
        this.observer.onDocumentDeleted(this.name, { name, url: docUrl });
        return res;
      });
  }

  /**
   * Create new document in DB
   * @param {*} data Document data to save
   * @returns {Promise<{success: boolean}>} Request promise
   */
  saveNewDoc(data) {
    const { name } = this;
    const payload = {
      type: name,
      name: data.Label,
      body: data
    };
    return Document.create(payload);
  }

  /**
   * Save changes in existing document in DB
   * @param {string} name Document name
   * @param {*} data Document data to save
   * @returns {Promise<{success: boolean}>} Request promise
   */
  saveExistingDoc(name, data) {
    if (this.docMan)
      return this.readDoc(name).then(doc => {
        doc.serialize(data);
        doc.save();
      });

    const document = new Document(Document.parsePath(name, scope));
    return document.overwrite(data);
  }

  /**
   * Saves the document in the database
   * @param {string} name The name of the document to save
   * @param {string} newName The new name of the document (when renaming)
   * @returns {Promise<{success, name, model}>}
   */
  saveDoc(name, newName) {
    if (this.docMan) {
      const doc = this.getDoc(name ?? "undefined");
      doc.save(newName);
      if (newName)
        this.discardDocChanges(name);
      return Promise.resolve(doc);
    }

    // get document from store
    const doc = this.getDoc(name);

    // rename the document
    if (newName) this.renameDoc(doc, newName);

    //get the document data
    const data = doc.serializeToDB();

    // If is a new document => create document in DB
    // If is not a new document => update in DB
    const saveMethodByIsNew = {
      true: _data => {
        return this.saveNewDoc(_data);
      },
      false: _data => {
        return this.saveExistingDoc(name, _data);
      }
    };

    return saveMethodByIsNew[doc.getIsNew()](data).then(res => {
      if (res.success) {
        doc.setIsNew(false).setDirty(false);
        this.observer.onDocumentDirty(this.name, doc, doc.getDirty());
        res.model = doc;

        // We don't need the untitled anymore, so let's kill it
        // Without this line we were getting the prompt to save untitled
        if (newName) this.discardDocChanges(name);
      }
      return res;
    });
  }

  /**
   * Create copy of document and save it in DB
   * @param {string} name The name of the document to copy
   * @param {string} newName The name of the new document (copy)
   * @returns {Promise<Model>} Promise resolved after finish copying document
   */
  async copyDoc(name, newName) {
    if (this.docMan)
      return this.readDoc(name).then(existingDoc => {
        return this.docMan.load({
          workspace: this.workspace,
          scope: this.name,
          name: newName,
        }, existingDoc.unserialize());
      });

    return this.readDoc(name).then(doc => {
      const newObj = this.model
        .ofJSON(doc.serializeToDB())
        .setIsNew(true)
        .setName(newName);

      this.setDoc(newName, newObj);
      this.saveDoc(newName);

      // Add subscriber to update dirty state
      newObj.subscribe((instance, prop, value) =>
        this.onDocumentUpdate(instance, prop, value)
      );

      // Return copied document
      return newObj;
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
   * Returns true if successfully discarded changes
   * @param {string} name The name of the document
   * @returns {boolean}
   */
  discardDocChanges(name) {
    if (this.docMan) {
      const index = {
        workspace: this.workspace,
        scope: this.name,
        name,
      };

      this.docMan.data.delete(this.docMan.index(index));

      return this.observer.onDocumentDeleted(this.name, {
        name,
        url: this.docMan.index(index)
      });
    }

    const doc = this.getDoc(name);

    if (!doc) {
      return this.observer.onDocumentDeleted(this.name, {
        name,
        url: Utils.buildDocPath({ scope: this.name, name })
      });
    }

    // A new document only exists in the store
    //  so discarding its changes means removing it from the store
    //  but we also need to remove it from the cached docsMap on DocManager
    // Otherwise set isLoaded flag to false,
    //  so the next time the user tries to read it:
    //  it will load the doc from redis again
    if (doc.getIsNew()) {
      doc.scope = this.name;

      if (this.deleteDocFromStore(name)) {
        this.observer.onDocumentDeleted(this.name, {
          name,
          url: Utils.buildDocPath(doc)
        });
      }
    } else {
      Boolean(doc?.setIsLoaded(false).setDirty(false));
    }

    return this.observer.onDocumentDirty(this.name, doc, doc.getDirty());
  }

  /**
   * Get all dirty documents
   * @returns {Array} Names of dirty documents from store
   */
  getDirties() {
    return Array.from(this.data.values()).filter(obj => obj.getDirty());
  }

  /**
   * Checks if the store has any documents changed (dirty)
   * @returns {Boolean}
   */
  hasDirties() {
    return this.getDirties().length > 0;
  }

  /**
   * Saves all changed documents
   * @returns {Promise<>}
   */
  saveDirties() {
    const promises = this.getDirties().map(obj => {
      return this.saveDoc(obj.getName());
    });

    return Promise.allSettled(promises);
  }
}

export default Store;
