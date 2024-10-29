import { Utils } from "@mov-ai/mov-fe-lib-core";
import { Model, Manager } from "../../../models";
import { Parameter } from "../../../models/subModels"; // from shared subModels
import {
  ExposedPorts,
  ExposedPortsManager,
  Link,
  NodeInstance,
  SubFlow,
} from "./subModels"; // from internal subModels
import schema from "./schema";

class Flow extends Model {
  constructor() {
    // inject imported schema and forward constructor arguments
    super({ schema, ...arguments[0] });

    //========================================================================================
    /*                                                                                      *
     *                                        Events                                        *
     *                                                                                      */
    //========================================================================================

    this.propEvents = {
      onAny: (event, name, value) => this.propsUpdate(event, name, value),
    };

    //========================================================================================
    /*                                                                                      *
     *                                   Model Properties                                   *
     *                                                                                      */
    //========================================================================================

    this.description = "";
    this.exposedPorts = new ExposedPortsManager(
      "exposedPorts",
      ExposedPorts,
      this.propEvents,
    );
    this.links = new Manager("links", Link, this.propEvents);
    this.nodeInstances = new Manager(
      "nodeInstances",
      NodeInstance,
      this.propEvents,
    );
    this.parameters = new Manager("parameters", Parameter, this.propEvents);
    this.subFlows = new Manager("subFlows", SubFlow, this.propEvents);

    // Define observable properties
    this.observables = Object.values(Flow.OBSERVABLE_KEYS);
  }

  //========================================================================================
  /*                                                                                      *
   *                                     Data Handlers                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Returns the description property
   * @returns {string}
   */
  getDescription() {
    return this.description;
  }

  /**
   * Sets the description property
   * @param {string} value : The new value
   * @returns {Flow}
   */
  setDescription(value) {
    this.description = value;
    return this;
  }

  /**
   * Returns the node instances manager
   * @returns {Manager}
   */
  getNodeInstances() {
    return this.nodeInstances;
  }

  /**
   * Returns the node instance item requested
   * @param {String} nodeId : the id of the item we're getting
   * @returns {Manager}
   */
  getNodeInstanceItem(nodeId) {
    return this.nodeInstances.getItem(nodeId);
  }

  /**
   * Returns the sub-flows manager
   * @returns {Manager}
   */
  getSubFlows() {
    return this.subFlows;
  }

  /**
   * Returns the sub flow item requested
   * @param {String} flowId : the id of the item we're getting
   * @returns {Manager}
   */
  getSubFlowItem(flowId) {
    return this.subFlows.getItem(flowId);
  }

  /**
   * Returns the exposed ports manager
   * @returns {Manager}
   */
  getExposedPorts() {
    return this.exposedPorts;
  }

  /**
   * Returns the links manager
   * @returns {Manager}
   */
  getLinks() {
    return this.links;
  }

  /**
   * Returns the parameters manager
   * @returns {Manager}
   */
  getParameters() {
    return this.parameters;
  }

  /**
   * Returns the parameter
   * @param {String} paramId : The id of the parameter to retrieve
   * @returns {Parameter}
   */
  getParameter(paramId) {
    return this.parameters.getItem(paramId);
  }

  /**
   * Adds a new Parameter
   * @returns {Manager}
   */
  addParameter(name, content) {
    this.parameters.setItem({ name, content });
    return this;
  }

  /**
   * Deletes a parameter
   * @param {string} paramId : The id of the parameter to be deleted
   * @returns {Flow}
   */
  deleteParameter(paramId) {
    this.parameters.deleteItem(paramId);
    return this;
  }

  /**
   * Updates an instance of a managed property
   * Can only be used with managed properties
   * @param {string} propName : The name of the property
   * @param {object} content : The data to update the item
   * @param {string} prevName : Previous item name
   * @returns {Node} : The instance
   */
  updateKeyValueItem(propName, content, prevName) {
    const name = content.name;
    if (prevName !== name) {
      this[propName].renameItem({ prevName, name }, true);
    }

    this[propName].updateItem({ name, content });
    return this;
  }

  /**
   * Deletes an instance of a managed property
   * Can only be used with managed properties
   * @param {string} varName : The name of the property
   * @param {any} key : The name of the item
   * @returns {Node} : The instance
   */
  deleteKeyValue(varName, key) {
    this[varName].deleteItem(key);
    return this;
  }

  /**
   * Returns an instance of a managed property
   * Can only be used with managed properties
   * @param {string} varName : The name of the property
   * @param {any} key : The name of the item
   * @returns {any}
   */
  getKeyValue(varName, key) {
    return this[varName].getItem(key);
  }

  /**
   * Returns the scope property
   * @returns {string}
   */
  getScope() {
    return Flow.SCOPE;
  }

  /**
   * Returns the extension property
   * @returns {string}
   */
  getFileExtension() {
    return Flow.EXTENSION;
  }

  /**
   * Updates the properties of the instance
   * @param {object} json : The data to update the instance
   * @returns {Flow} : The instance
   */
  setData(json) {
    const {
      description,
      name,
      details,
      nodeInstances,
      subFlows,
      exposedPorts,
      links,
      parameters,
    } = json;

    super.setData({ description, name, details });

    this.nodeInstances.clear().setData(nodeInstances);
    this.subFlows.clear().setData(subFlows);
    this.exposedPorts.clear().setData(exposedPorts);
    this.links.clear().setData(links);
    this.parameters.clear().setData(parameters);

    return this;
  }

  addNode(node) {
    const { name } = node;
    const content = NodeInstance.serializeOfDB({ [name]: { ...node } });
    this.getNodeInstances().setItem({ name, content });
  }

  addSubFlow(node) {
    const { name } = node;
    const content = SubFlow.serializeOfDB({ [name]: { ...node } });
    this.getSubFlows().setItem({ name, content });
  }

  /**
   * Deletes a node instance and connected links
   * @param {string} nodeId : The node instance id
   * @returns {boolean} : True on success, false otherwise
   */
  deleteNode(nodeId) {
    const nodeTemplate = this.getNodeInstances().getItem(nodeId).template;
    this.deleteNodeLinks(nodeId);
    this.deleteNodeExposedPorts(nodeId, nodeTemplate);
    return this.getNodeInstances().deleteItem(nodeId);
  }

  /**
   * Deletes a sub flow and connected links
   * @param {string} subFlowId : The sub flow id
   * @returns {boolean} : True on success, false otherwise
   */
  deleteSubFlow(subFlowId) {
    const subflowTemplate = this.getSubFlows().getItem(subFlowId).template;
    this.deleteNodeLinks(subFlowId);
    this.deleteNodeExposedPorts(subFlowId, subflowTemplate);
    return this.getSubFlows().deleteItem(subFlowId);
  }

  /**
   * Deletes links connected to the node (nodeInst or subFlow)
   * @param {string} id : The node (nodeInst or subFlow) id
   * @returns {array} Deleted links array
   */
  deleteNodeLinks = (id) => {
    const deletedLinks = [];

    // delete all links connected to the node
    this.getLinks().data.forEach((item, key) => {
      // check if the link belongs to the node
      if (item.getNodes().includes(id)) {
        this.deleteLink(key);

        deletedLinks.push(key);
      }
    });

    return deletedLinks;
  };

  /**
   * Delete Exposed Ports of NodeInst or Container
   * @param {string} id : The node (nodeInst or subFlow) id
   */
  deleteNodeExposedPorts = (id, template) => {
    this.getExposedPorts().data.forEach((_, key) => {
      if (template === key) {
        this.deleteExposedPorts(id, template);
      }
    });
  };

  /**
   * Add a new link
   * @param {array} link : Link with format [<from>, <to>]
   */
  addLink(link) {
    const [from, to] = link;
    const id = Utils.randomId();

    this.getLinks().setItem({ name: id, content: { from, to } });

    const links = this.getLinks().serializeToDB();

    return { id, ...links[id] };
  }

  /**
   * Delete Link
   * @param {string} id : Link ID
   */
  deleteLink(id) {
    this.getLinks().deleteItem(id);
  }

  /**
   * Delete Exposed Port
   * @param {string} id : ExposedPort ID
   */
  deleteExposedPorts(id, template) {
    const exposedPorts = this.getExposedPorts();

    if (Object.keys(exposedPorts.getItem(template)).length > 1)
      exposedPorts.deleteSubItem(template, id);
    else exposedPorts.deleteItem(id);
  }

  /**
   * Set link dependency level
   * @param {string} linkId : Link ID
   * @param {number} dependecyLevel : Dependency level
   */
  setLinkDependency(linkId, dependecyLevel) {
    this.getLinks().getItem(linkId).setDependency(dependecyLevel);
  }

  /**
   *
   * @param {*} linkId
   * @returns
   */
  getLinkDependency(linkId) {
    return this.getLinks().getItem(linkId)?.getDependency();
  }

  toggleExposedPort(templateName, nodeName, portName) {
    this.getExposedPorts().toggleExposedPort(templateName, nodeName, portName);
    return this.getExposedPorts().serializeToDB();
  }

  //========================================================================================
  /*                                                                                      *
   *                                    Event Handlers                                    *
   *                                                                                      */
  //========================================================================================

  propsUpdate(_, prop, value) {
    // force dispatch
    this.dispatch(prop, value);
  }

  //========================================================================================
  /*                                                                                      *
   *                                      Serializers                                     *
   *                                                                                      */
  //========================================================================================

  /**
   * Returns the instance properties serialized
   * @returns {object}
   */
  serialize() {
    return {
      ...super.serialize(),
      description: this.getDescription(),
      nodeInstances: this.getNodeInstances().serialize(),
      subFlows: this.getSubFlows().serialize(),
      exposedPorts: this.getExposedPorts().serialize(),
      links: this.getLinks().serialize(),
      parameters: this.getParameters().serialize(),
    };
  }

  /**
   * Returns the instance properties serialized to
   * the database format
   * @returns {object}
   */
  serializeToDB() {
    const { name, description, details } = this.serialize();

    // TODO method is just a temporary fix. https://movai.atlassian.net/browse/BP-465
    const getValueToSave = (manager) => {
      return manager.hasItems() ? manager.serializeToDB() : undefined;
    };

    return {
      Label: name,
      Description: description,
      LastUpdate: details,
      NodeInst: this.getNodeInstances().serializeToDB(),
      Container: this.getSubFlows().serializeToDB(),
      ExposedPorts: getValueToSave(this.getExposedPorts()),
      Links: getValueToSave(this.getLinks()),
      Parameter: this.getParameters().serializeToDB(),
    };
  }

  //========================================================================================
  /*                                                                                      *
   *                                        Static                                        *
   *                                                                                      */
  //========================================================================================

  /**
   * Serialize database data to model properties
   * @param {object} json : The data received from the database
   * @returns {object} Model properties
   */
  static serializeOfDB(json) {
    const {
      Label: id,
      Label: name,
      LastUpdate: details,
      workspace,
      version,
      Description: description,
      NodeInst: nodeInstances,
      Container: subFlows,
      ExposedPorts: exposedPorts,
      Links: links,
      Parameter: parameters,
    } = json;

    return {
      id,
      name,
      details,
      workspace,
      version,
      description,
      nodeInstances: Manager.serializeOfDB(nodeInstances, NodeInstance),
      subFlows: Manager.serializeOfDB(subFlows, SubFlow),
      exposedPorts: ExposedPortsManager.serializeOfDB(
        exposedPorts,
        ExposedPorts,
      ),
      links: Manager.serializeOfDB(links, Link),
      parameters: Manager.serializeOfDB(parameters, Parameter),
    };
  }

  static SCOPE = "Flow";
  static CLASSNAME = "flow-interface";

  static EXTENSION = ".flo";

  static KEYS_TO_DISCONSIDER = [
    "subFlows",
    "exposedPorts",
    "links",
    "nodeInstances",
  ];

  static OBSERVABLE_KEYS = {
    NAME: "name",
    DETAILS: "details",
    PARAMETERS: "parameters",
    DESCRIPTION: "description",
  };
}

Flow.defaults = {};

export default Flow;
