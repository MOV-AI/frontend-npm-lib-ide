import { MasterDB } from "@mov-ai/mov-fe-lib-core";

class Subscriber {
  constructor({ pattern, _onLoad, _onUpdate }) {
    this.pattern = pattern;
  }

  subscribe(onUpdate, onLoad) {
    console.log("SUBSCRIBER: Subscribing with pattern:", this.pattern);
    MasterDB.subscribe(this.pattern, onUpdate, onLoad);
  }

  unsubscribe() {
    MasterDB.unsubscribe(this.pattern);
  }

  destroy() {
    console.log("SUBSCRIBER: Destroying subscriber for pattern:", this.pattern);
    this.unsubscribe();
    MasterDB.close();
  }
}

export default Subscriber;
