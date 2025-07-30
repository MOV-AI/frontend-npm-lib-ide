import Model from "../model/Node";
import Helper from "./Helper";
import { Store, DBSubscriber } from "../../../store";
import NODE_CACHE from "./NodeDB";

class NodeStore extends Store {
  constructor(workspace, observer, docManager) {
    super({
      workspace,
      model: Model,
      name: Model.SCOPE,
      title: "Nodes",
      plugins: [DBSubscriber],
      docManager,
      observer,
    });
  }

  // Set helper object with cloudFunction and more
  helper = Helper;

  /**
   * @override loadDoc to activate Redis subscriber to document
   * @param {string} name : Document name
   * @returns Parent loadDoc method
   */
  loadDoc(name) {
    this.getPlugin("DBSubscriber").subscribe(name);

    if (NODE_CACHE.has(name)) {
      // some non harmful code repetition from base store
      const obj = this.getDoc(name) || this.newDoc(name).setIsNew(false);
      const file = NODE_CACHE.get(name);
      const data = obj.constructor.serializeOfDB(file);
      obj
        .enableObservables(false)
        .setData(data)
        .setIsLoaded(true)
        .setDirty(false)
        .enableObservables(true);
      return Promise.resolve(obj);
    }
    return super.loadDoc(name);
  }

  /**
   * @override destroy method to unsubscribe to data in helper
   */
  destroy() {
    super.destroy();
    this.helper.destroy();
  }

  static SCOPE = Model.SCOPE;
}

export default NodeStore;
