import BaseModel from "../Model/Model";
import schema from "./schema";

export default class Configuration extends BaseModel {
  /**
   * This should be private
   * @param {*} name
   * @param {*} extension
   * @param {*} code
   * @param {*} details
   */
  constructor(name, extension, code, details) {
    super({ schema, name, details });

    this.toDecorate = ["setCode", "setExtension"];

    this.extension = extension || "yaml";
    this.code = code || "";
  }

  getCode() {
    return this.code;
  }

  setCode(code) {
    this.code = code;
    return this;
  }

  getExtension() {
    return this.extension;
  }

  setExtension(extension) {
    this.extension = extension;
    return this;
  }

  getScope() {
    return Configuration.SCOPE;
  }

  serialize() {
    return {
      Label: this.getName(),
      Yaml: this.getCode(),
      Type: this.getExtension(),
      LastUpdate: this.getDetails()
    };
  }

  setData(data) {
    this.code = data.Yaml;
    this.extension = data.Type;
  }

  getFileExtension() {
    return ".conf";
  }

  static SCOPE = "Configuration";

  static ofJSON(json) {
    const {
      Label: name,
      Yaml: code,
      Type: extension,
      LastUpdate: details
    } = json;
    return new Configuration(name, extension, code, details);
  }

  static EMPTY = new Configuration();

  static serialize() {
    return {
      Label: null,
      Yaml: "",
      Type: "yaml",
      LastUpdate: { user: "N/A", lastUpdate: "N/A" }
    };
  }
}
