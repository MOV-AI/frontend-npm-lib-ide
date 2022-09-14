import Manager from "../../../../../models/Manager";

class LayerManager extends Manager {
  serialize() {
    const output = {};

    for (const key of this.data.keys()) {
      const obj = this.getItem(key);

      output[obj.getId()] = obj.serialize();
    }

    return output;
  }

  serializeToDB() {
    const output = {};

    for (const key of this.data.keys()) {
      const obj = this.getItem(key);

      output[obj.getId()] = obj.serializeToDB();
    }

    return output;
  }
}

export default LayerManager;
