import { NODE_TYPES } from "../../../Constants/constants";
import TreeNode from "../BaseNode/TreeView/TreeNode";

class TreeClassicNode extends TreeNode {
  constructor({ canvas, node, events, template, parent }) {
    super({ canvas, node, events, _type: "node", template, parent });

    this.nodeType = NODE_TYPES.TREE_NODE;

    this.init();
  }
}

export default TreeClassicNode;
