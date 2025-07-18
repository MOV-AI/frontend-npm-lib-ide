import { Store, DBSubscriber } from "../../../store";
import Model from "../model/Flow";
import FLOW_CACHE from "./FlowDB";
import Helper from "./Helper";

class FlowStore extends Store {
  constructor(workspace, observer, docManager) {
    super({
      workspace,
      model: Model,
      name: Model.SCOPE,
      title: "Flows",
      plugins: [DBSubscriber],
      docManager,
      observer,
    });
  }

  // Set helper object with cloudFunction
  helper = Helper;

  loadDoc(name) {
    this.getPlugin("DBSubscriber").subscribe(name);

    if (FLOW_CACHE.has(name)) {
      // some non warmful code repetition from base store
      const obj = this.getDoc(name) || this.newDoc(name).setIsNew(false);
      const file = FLOW_CACHE.get(name);
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

  static SCOPE = Model.SCOPE;
}

export default FlowStore;
