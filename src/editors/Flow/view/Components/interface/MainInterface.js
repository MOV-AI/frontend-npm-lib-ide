import { BehaviorSubject } from "rxjs";
import { filter } from "rxjs/operators";
import Factory from "../Nodes/Factory";
import { NODE_TYPES, TYPES } from "../../Constants/constants";
import { getNodeNameFromId } from "../../Core/Graph/Utils";
import Graph from "../../Core/Graph/GraphBase";
import { EVT_NAMES } from "../../events";
import StartNode from "../Nodes/StartNode";
import InterfaceModes from "./InterfaceModes";
import Events from "./Events";
import Canvas from "./canvas";

export let cachedNodeStatus = {};

const NODE_PROPS = {
  Node: {
    LABEL: "NodeLabel",
    MODEL_ADD_METHOD: "addNode",
    MODEL_DEL_METHOD: "deleteNode",
    TYPE: NODE_TYPES.NODE,
  },
  Flow: {
    LABEL: "ContainerLabel",
    MODEL_ADD_METHOD: "addSubFlow",
    MODEL_DEL_METHOD: "deleteSubFlow",
    TYPE: NODE_TYPES.CONTAINER,
  },
};

// sets the object's value, given the path described by the splits
function _set(obj, value, splits = []) {
  if (splits.length === 0) {
    throw new Error("Invalid splits array");
  }
  let current = obj;
  for (let i = 0; i < splits.length - 1; i++) {
    const k = splits[i];
    if (typeof current[k] !== "object" || current[k] === null) {
      current[k] = {};
    }
    current = current[k];
  }
  current[splits[splits.length - 1]] = value;
}

// ensure parents of lit nodes are lit
function _marks(obj) {
  const result = {};
  const stack = [{ obj: obj, prefix: "" }];

  while (stack.length > 0) {
    const { obj, prefix } = stack.pop();

    for (const key in obj) {
      const value = obj[key];
      const newPrefix = prefix + key;

      result[newPrefix] = value ? 1 : 0;

      if (typeof value === "object" && value !== null)
        stack.push({ obj: value, prefix: newPrefix + "__" });
    }
  }

  return result;
}

// ensure parents of lit nodes are lit, and children of unlit flows are unlit
function ensureParents(json) {
  const initial = { ...cachedNodeStatus };
  const newStatus = {};
  for (const [key, value] of Object.entries(json)) {
    _set(newStatus, value, key.split("__"));
  }
  const marks = _marks(newStatus);

  Object.entries(marks).forEach(([fullKey, val]) => {
    if (val === 0) {
      const parts = fullKey.split("__");
      for (let i = 1; i < parts.length; i++) {
        const parentKey = parts.slice(0, i).join("__");
        marks[parentKey] = 0;
      }
    }
  });
  const ret = { ...marks };
  for (const key of Object.keys(initial)) {
    if (!ret[key]) ret[key] = 0;
    else
      for (const key2 of Object.keys(marks)) {
        if (key.startsWith(key2) && !marks[key2]) {
          ret[key] = 0;
          break;
        }
      }
  }
  return ret;
}

export default class MainInterface {
  constructor({
    id,
    containerId,
    modelView,
    width,
    height,
    data,
    classes,
    call,
    graphCls,
  }) {
    //========================================================================================
    /*                                                                                      *
     *                                      Properties                                      *
     *                                                                                      */
    //========================================================================================
    this.id = id;
    this.containerId = containerId;
    this.width = width;
    this.height = height;
    this.modelView = modelView;
    this.data = data;
    this.graphCls = graphCls ?? Graph;
    this.classes = classes;
    this.docManager = call;
    this.stateSub = new BehaviorSubject(0);
    this.events = new Events();
    this.mode = new InterfaceModes(this);
    this.api = null;
    this.canvas = null;
    this.graph = null;
    this.shortcuts = null;
    this.onLoad = () => {};

    // Set initial mode as loading
    this.setMode(EVT_NAMES.LOADING);

    this.canvas = new Canvas({
      mInterface: this,
      containerId,
      width,
      height,
      classes,
      docManager: call,
    });

    this.graph = new this.graphCls({
      id,
      mInterface: this,
      canvas: this.canvas,
      docManager: call,
    });

    // Load document and add subscribers
    this.addSubscribers();
    this.loadDoc();
  }

  /**
   * @private
   * Loads the document in the graph
   * @returns {MainInterface} : The instance
   */
  loadDoc = async () => {
    await this.graph.loadData(this.modelView.current.serializeToDB());
    this.canvas.el.focus();
    this.onToggleWarnings({ data: true });
    this.setMode(EVT_NAMES.DEFAULT);
    this.canvas.appendDocumentFragment();
    this.graph.updateAllPositions();
    this.onLoad();
  };

  //========================================================================================
  /*                                                                                      *
   *                                  Setters and Getters                                 *
   *                                                                                      */
  //========================================================================================

  get selectedNodes() {
    return this.graph.selectedNodes;
  }

  set selectedNodes(nodes) {
    this.graph.selectedNodes = nodes;
    if (this.selectedLink) this.selectedLink.onSelected(false);
  }

  get selectedLink() {
    return this.graph.selectedLink;
  }

  set selectedLink(link) {
    if (this.graph.selectedLink) this.graph.selectedLink.onSelected(false);
    this.graph.selectedLink = link;
  }

  setMode = (mode, props, force) => {
    this.mode.setMode(mode, props, force);
  };

  setPreviousMode = () => {
    this.mode.setPrevious();
  };

  nodeStatusUpdated = (nodeStatus, robotStatus) => {
    cachedNodeStatus = ensureParents(nodeStatus);
    this.graph.nodeStatusUpdated(robotStatus);
  };

  addLink = () => {
    const { src, trg, link, toCreate } = this.mode.linking.props;

    if (toCreate && link.isValid(src, trg, this.graph.links)) {
      // create new link
      const newLink = this.modelView.current.addLink(link.toSave(src, trg));

      // render new link localy
      this.graph.addLink(newLink);
      this.graph.validateFlow();

      this.events.onAddLink.next(newLink);
    }
  };

  deleteLink = (linkId) => {
    this.modelView.current.deleteLink(linkId);
    this.graph.deleteLinks([linkId]);
    this.graph.validateFlow();
  };

  addNode = (name) => {
    const node = {
      ...this.mode.current.props.node.data,
      NodeLabel: name,
      name: name,
      id: name,
    };
    this.modelView.current.addNode(node);
    this.graph.addNode(node, NODE_TYPES.NODE).then(() => {
      this.graph.update();
      this.setMode(EVT_NAMES.DEFAULT);
    });

    return this;
  };

  addFlow = (name) => {
    const node = {
      ...this.mode.current.props.node.data,
      ContainerLabel: name,
      name: name,
      id: name,
    };
    this.modelView.current.addSubFlow(node);
    this.graph.addNode(node, NODE_TYPES.CONTAINER).then(() => {
      this.graph.update();
      this.setMode(EVT_NAMES.DEFAULT);
    });

    return this;
  };

  /**
   * Paste node/sub-flow
   *  Add it to model data and to canvas
   * @param {string} name : Copy new name
   * @param {*} nodeData : Node original data
   * @param {{x: number, y: number}} position : Position to paste node
   */
  pasteNode = (name, nodeData, position) => {
    // Gather information from model
    const NODE_PROP_DATA = NODE_PROPS[nodeData.model];
    // Set node in canvas boundaries
    const nodePos = this.canvas.getPositionInBoundaries(position.x, position.y);
    // Build node data
    const node = {
      // the following line exists because nodeData is outdated.
      // which results in props and params not getting copied properly
      // it has to do with Proxy / original instance inconsistencies
      ...nodeData,
      ...this.modelView.current.serializeToDB(
        this.modelView.current.serialize(),
      ).NodeInst[nodeData.id],
      Visualization: nodePos,
      [NODE_PROP_DATA.LABEL]: name,
      Label: name,
      name: name,
      id: name,
    };
    // Add node to model data
    this.modelView.current[NODE_PROP_DATA.MODEL_ADD_METHOD](node);
    // Add node to canvas
    this.graph.addNode(node, NODE_PROP_DATA.TYPE).then(() => {
      this.graph.update();
      this.setMode(EVT_NAMES.DEFAULT);
    });
  };

  /**
   * Delete Nodes/Sub-Flows
   * @param {*} node : Node data
   */
  deleteNode = (node) => {
    // Gather information from model
    const NODE_PROP_DATA = NODE_PROPS[node.model];
    // Delete from model data
    this.modelView.current[NODE_PROP_DATA.MODEL_DEL_METHOD](node.id);
    // Delete from canvas
    this.graph.deleteNode(node.id);
    // Remove from selected nodes
    this.selectedNodes = this.selectedNodes.filter(
      (el) => el.data.id !== node.id,
    );
  };

  toggleExposedPort = (port) => {
    const templateName = port.node.getExposedName();
    const nodeName = port.node.name;
    const portName = port.name;

    this.graph.updateExposedPorts(
      this.modelView.current.toggleExposedPort(
        templateName,
        nodeName,
        portName,
      ),
    );
  };

  searchNode = (node) => {
    const nodeName = node.parent !== this.id ? node.id : node.name;
    return nodeName && this.graph.nodes.get(nodeName)?.obj;
  };

  //========================================================================================
  /*                                                                                      *
   *                                      Subscribers                                     *
   *                                                                                      */
  //========================================================================================

  /**
   * @private
   * Initializes the subscribers
   * @returns {MainInterface} : The instance
   */
  addSubscribers = () => {
    this.mode.default.onEnter.subscribe(this.onDefault);

    // drag mode -> onExit event
    this.mode.drag.onExit.subscribe(this.onDragEnd);

    // Node click and double click events
    this.mode.selectNode.onEnter.subscribe(this.onSelectNode);

    this.mode.onDblClick.onEnter.subscribe(() => {
      this.setMode(EVT_NAMES.DEFAULT);
    });

    // Linking mode events
    this.mode.linking.onEnter.subscribe(this.onLinkingEnter);
    this.mode.linking.onExit.subscribe(this.onLinkingExit);

    // Canvas events (not modes)
    // toggle warnings
    this.canvas.events
      .pipe(filter((event) => event.name === EVT_NAMES.ON_TOGGLE_WARNINGS))
      .subscribe(this.onToggleWarnings);

    return this;
  };

  //========================================================================================
  /*                                                                                      *
   *                                    Helper Methods                                    *
   *                                                                                      */
  //========================================================================================

  hideLinks = (node, visitedLinks) => {
    node.links.forEach((linkId) => {
      const link = this.graph.links.get(linkId);
      if (
        // link was not yet visited or is visible
        !visitedLinks.has(linkId) ||
        link.visible
      ) {
        link.visibility = node.obj.visible;
      }
      visitedLinks.add(linkId);
    });
  };

  //========================================================================================
  /*                                                                                      *
   *                                    Event Handlers                                    *
   *                                                                                      */
  //========================================================================================

  onDefault = () => {
    this.selectedNodes.length = 0;
  };

  onDragEnd = (draggedNode) => {
    const selectedNodesSet = new Set([draggedNode].concat(this.selectedNodes));
    const nodes = Array.from(selectedNodesSet).filter((obj) => obj);

    nodes.forEach((node) => {
      const { id } = node.data;
      const nodeName = getNodeNameFromId(id);
      const [x, y] = node.data.Visualization;

      const items =
        node.data.type === TYPES.CONTAINER
          ? this.modelView.current.getSubFlows()
          : this.modelView.current.getNodeInstances();

      items.getItem(nodeName).setPosition(x, y);
    });
  };

  onLinking = (data) => {
    this.graph.nodes.forEach((node) => node.obj.linking(data));
  };

  onLinkingEnter = () => {
    const { data } = this.mode.current.props.src;
    this.onLinking(data);
  };

  onLinkingExit = () => {
    this.onLinking();
    this.addLink();
  };

  getUpdatedVersionOfNode = async (oldNode) => {
    const newModel = this.modelView.current.serializeToDB();
    const newNodes =
      oldNode.nodeType === NODE_TYPES.NODE
        ? newModel.NodeInst
        : newModel.Container;
    const currentNode = {
      id: oldNode.data.id ?? oldNode.name,
      ...newNodes[oldNode.name],
    };

    try {
      const newNode = await Factory.create(
        this.docManager,
        Factory.OUTPUT[oldNode.nodeType],
        { canvas: this.canvas, node: currentNode, events: oldNode.events },
      );

      return newNode;
    } catch (err) {
      console.warn(err);
      return oldNode;
    }
  };

  onSelectNode = (data) => {
    const { nodes, shiftKey } = data;
    const { selectedNodes } = this;
    const filterNodes = nodes.filter((n) => n.data.model !== StartNode.model);

    this.selectedLink = null;

    if (!shiftKey) selectedNodes.length = 0;

    filterNodes.forEach((node) => {
      if (node.selected) {
        selectedNodes.push(node);
      } else {
        const nodesWithoutThisNode = selectedNodes.filter(
          (n) => n.name !== node.name,
        );

        selectedNodes.length = 0;
        selectedNodes.push(...nodesWithoutThisNode);
      }
    });
  };

  onToggleWarnings = (event) => {
    // show/hide warnings
    this.graph.updateWarningsVisibility(event.data);
  };

  onStateChange = (fn) => {
    return this.stateSub.subscribe(fn);
  };

  /**
   * Resets all Node status (Turns of the center)
   */
  resetAllNodeStatus = () => {
    this.graph.resetStatus?.();
  };

  onResetZoom = () => {
    this.canvas.onResetZoom();
  };

  onMoveNode = (event) => {
    const currentZoom = this.canvas.currentZoom?.k ?? 1;
    const step = 2 / currentZoom + 1;
    const delta = {
      ArrowRight: [1 * step, 0],
      ArrowLeft: [-1 * step, 0],
      ArrowUp: [0, -1 * step],
      ArrowDown: [0, 1 * step],
    };
    const [dx, dy] = delta[event.code];
    const [x, y] = [50, 50]; // skip boundaries validation used when dragging a node
    this.graph.onNodeDrag(null, { x, y, dx, dy });
    this.onDragEnd();
  };

  onFocusNode = (node) => {
    const { xCenter, yCenter } = node.getCenter();
    this.setMode(EVT_NAMES.DEFAULT, null, true);
    node.selected = true;
    if (node.data.id !== "start") {
      this.setMode(
        EVT_NAMES.SELECT_NODE,
        { nodes: [node], shiftKey: false },
        true,
      );
    }
    this.canvas.zoomToCoordinates(xCenter, yCenter);
  };

  destroy = () => {
    // Nothing to do
  };
}

export { _set, _marks, ensureParents };
