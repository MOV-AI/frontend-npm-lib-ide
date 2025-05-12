import { NODE_TYPES } from "../../Constants/constants";
import BaseNode from "./BaseNode/BaseNode";

class ClassicNode extends BaseNode {
  constructor(args) {
    super({ ...args });

    this.nodeType = NODE_TYPES.NODE;

    this.init();
  }
}

export default ClassicNode;
