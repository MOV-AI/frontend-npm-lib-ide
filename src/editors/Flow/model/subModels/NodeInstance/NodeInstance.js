import PluginManagerIDE from "../../../../../engine/PluginManagerIDE/PluginManagerIDE";
import { PLUGINS } from "../../../../../utils/Constants";
import { Command, EnvVar, Parameter } from "../../../../../models/subModels";
import { Model, Manager } from "../../../../../models";
import Position from "../Position/Position";
import schema from "./schema";

class NodeInstance extends Model {
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

    this.persistent = undefined;
    this.launch = undefined;
    this.remappable = undefined;
    this.template = "";
    this.templateDoc = {};
    this.position = new Position();
    this.parameters = new Manager("parameters", Parameter, this.propEvents);
    this.envVars = new Manager("envVars", EnvVar, this.propEvents);
    this.commands = new Manager("commands", Command, this.propEvents);

    // Define observable properties
    this.observables = Object.values(NodeInstance.OBSERVABLE_KEYS);
  }

  //========================================================================================
  /*                                                                                      *
   *                                     Data Handlers                                    *
   *                                                                                      */
  //========================================================================================

  async setTemplateDoc() {
    if (this.templateDoc && this.templateDoc.id === this.template) return this;

    const manager = PluginManagerIDE.getInstance().manager;

    const templateDoc = await manager.call(
      PLUGINS.DOC_MANAGER.NAME,
      PLUGINS.DOC_MANAGER.CALL.READ,
      {
        scope: "Node",
        name: this.template,
      },
    );

    this.templateDoc = templateDoc ?? {};
    return this;
  }

  /**
   * Returns the template property
   * @returns {string}
   */
  getTemplate() {
    return this.template;
  }

  /**
   * Sets the template property
   * @param {string} value : The new value
   * @returns {NodeInstance}
   */
  setTemplate(value) {
    this.template = value;
    this.setTemplateDoc();
    return this;
  }

  /**
   * Returns the persistent property
   * @returns {boolena}
   */
  getPersistent() {
    return this.persistent;
  }

  /**
   * Sets the persistent property
   * @param {boolean} value : The new value
   * @returns {NodeInstance}
   */
  setPersistent(value) {
    this.persistent = value;
    return this;
  }

  /**
   * Returns the launch property
   * @returns {boolean}
   */
  getLaunch() {
    return this.launch;
  }

  /**
   * Sets the launch property
   * @param {boolean} value : The new value
   * @returns {NodeInstance}
   */
  setLaunch(value) {
    this.launch = value;
    return this;
  }

  /**
   * Returns the remappable property
   * @returns {string}
   */
  getRemappable() {
    return this.remappable;
  }

  /**
   * Sets the remappable property
   * @param {boolean} value : The new value
   * @returns {NodeInstance}
   */
  setRemappable(value) {
    this.remappable = value;
    return this;
  }

  /**
   * Returns the node's position object
   * @returns {Position}
   */
  getPosition() {
    return this.position;
  }

  /**
   * Sets the node's position
   * @param {number} x : Coordinate x
   * @param {number} y : Coordinate y
   * @returns
   */
  setPosition(x, y) {
    this.position.setData({ x, y });

    this.dispatch(
      NodeInstance.OBSERVABLE_KEYS.POSITION,
      this.getPosition().serialize(),
    );

    return this;
  }

  /**
   * Updates an instance of a managed property
   * Can only be used with managed properties
   * @param {string} propName : The name of the property
   * @param {*} content : The data to update the item
   * @returns {Node} : The instance
   */
  updateKeyValueItem(propName, content) {
    const name = content.name;
    this[propName]?.updateItem({ name, content });

    return this;
  }

  /**
   * Updates an instance of a managed property
   * Can only be used with managed properties
   * @param {string} propName : The name of the property
   * @param {boolean} value : The value to update the prop
   * @returns {Node} : The instance
   */
  updateKeyValueProp(propName, value) {
    this[propName] = value;

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
    this[varName]?.deleteItem(key);
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
    return this[varName]?.getItem(key);
  }

  /**
   * Sets an instance of a managed property
   * Can only be used with managed properties
   * @param {string} varName : The name of the property
   * @param {any} content : The content of the item
   * @returns {Node} : The instance
   */
  addKeyValue(varName, content) {
    const name = content.name;
    this[varName]?.setItem({ name, content });
    return this;
  }

  /**
   * Returns the parameters manager
   * @returns {Manager}
   */
  getParameters() {
    return this.parameters;
  }

  /**
   * Returns the env. vars manager
   * @returns {Manager}
   */
  getEnvVars() {
    return this.envVars;
  }

  /**
   * Returns the commands mnager
   * @returns {Manager}
   */
  getCommands() {
    return this.commands;
  }

  /**
   * Updates the properties of the instance
   * @param {object} json : The data to update the instance
   * @returns {NodeInstance} : The instance
   */
  setData(json) {
    const {
      name,
      template,
      persistent,
      launch,
      remappable,
      position,
      parameters,
      envVars,
      commands,
    } = json;

    super.setData({
      name,
      template,
      persistent,
      launch,
      remappable,
    });

    this.position.setData(position);
    this.parameters.setData(parameters);
    this.envVars.setData(envVars);
    this.commands.setData(commands);

    this.setTemplateDoc();

    return this;
  }

  //========================================================================================
  /*                                                                                      *
   *                                    Event Handlers                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * @private
   * Forces the events dispatcher
   * @param {string} event : The name of the event
   * @param {string} prop : The of the property updated
   * @param {any} value : The new value of the property
   */
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
      name: this.getName(),
      template: this.getTemplate(),
      persistent: this.getPersistent(),
      launch: this.getLaunch(),
      remappable: this.getRemappable(),
      position: this.getPosition().serialize(),
      parameters: this.getParameters().serialize(),
      envVars: this.getEnvVars().serialize(),
      commands: this.getCommands().serialize(),
    };
  }

  /**
   * Returns the instance properties serialized to
   * the database format
   * @returns {object}
   */
  serializeToDB() {
    const { name, template, persistent, launch, remappable } = this.serialize();

    return {
      NodeLabel: name,
      Template: template,
      // I don't love this hack, but we need it for the backend to fetch
      // The template values in case the user sets a default on a nodeInstance
      Persistent:
        persistent === this.templateDoc.persistent ? undefined : persistent,
      Launch: launch === this.templateDoc.launch ? undefined : launch,
      Remappable:
        remappable === this.templateDoc.remappable ? undefined : remappable,
      Visualization: {
        ...this.getPosition().serializeToDB(),
      },
      Parameter: this.getParameters().serializeToDB(),
      EnvVar: this.getEnvVars().serializeToDB(),
      CmdLine: this.getCommands().serializeToDB(),
    };
  }

  //========================================================================================
  /*                                                                                      *
   *                                        Static                                        *
   *                                                                                      */
  //========================================================================================

  /**
   * Returns properties serialized from the database format
   * @param {object} json : The data received from the database
   * @returns {object}
   */
  static serializeOfDB(json) {
    const name = Object.keys(json)[0];
    const content = Object.values(json)[0];

    const {
      Template: template,
      Persistent: persistent,
      Launch: launch,
      Remappable: remappable,
      Visualization: position,
      Parameter: parameters,
      EnvVar: envVars,
      CmdLine: commands,
    } = content;

    return {
      name,
      template,
      persistent,
      launch,
      remappable,
      position: Position.serializeOfDB(position),
      parameters: Manager.serializeOfDB(parameters, Parameter),
      envVars: Manager.serializeOfDB(envVars, EnvVar),
      commands: Manager.serializeOfDB(commands, Command),
    };
  }

  static OBSERVABLE_KEYS = {
    NAME: "name",
    TEMPLATE: "template",
    LAUNCH: "launch",
    PERSISTENT: "persistent",
    REMAPPABLE: "remappable",
    POSITION: "position",
  };
}

export default NodeInstance;
