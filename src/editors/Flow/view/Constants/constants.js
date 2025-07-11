const MAX_MOVING_PIXELS = 15000;
const CANVAS_LIMITS = [
  [10, MAX_MOVING_PIXELS - 75],
  [25, MAX_MOVING_PIXELS - 75],
];
const FLOW_VIEW_MODE = {
  default: "default",
  treeView: "treeView",
};

const MOVAI_FLOW_TYPES = {
  NODES: {
    ROS1_NODELETE: "ROS1/Nodelet",
    ROS1_NODE: "ROS1/Node",
    ROS1_PLUGIN: "ROS1/Plugin",
    ROS1_STATEM: "ROS1/StateM",
    MOVAI_NODE: "MovAI/Node",
    MOVAI_STATE: "MovAI/State",
    MOVAI_SERVER: "MovAI/Server",
    MOVAI_FLOW: "MovAI/Flow",
    ROS2_NODE: "ROS2/Node",
    ROS2_LIFECYCLENODE: "ROS2/LifecycleNode",
  },
  LINKS: {
    TRANSITION: "movai_msgs/Transition",
    NODELET: "movai_msgs/Nodelet",
  },
};

const NODE_TYPES = {
  NODE: "NODE",
  CONTAINER: "CONTAINER",
  TREE_NODE: "TREE_NODE",
  TREE_CONTAINER: "TREE_CONTAINER",
};

const TYPES = {
  NODE: "NodeInst",
  CONTAINER: "Container",
};

const generateContainerId = (flowId) => {
  return `base-${flowId?.replace(/\//g, "-")}`;
};

const PARENT_NODE_SEP = "^";

const PORT_TOOLTIP_MODAL_TIMEOUTS = {
  NORMAL: 3000,
  FORCE_CLOSE: 100,
};

export {
  MAX_MOVING_PIXELS,
  CANVAS_LIMITS,
  PARENT_NODE_SEP,
  generateContainerId,
  FLOW_VIEW_MODE,
  MOVAI_FLOW_TYPES,
  NODE_TYPES,
  TYPES,
  PORT_TOOLTIP_MODAL_TIMEOUTS,
};
