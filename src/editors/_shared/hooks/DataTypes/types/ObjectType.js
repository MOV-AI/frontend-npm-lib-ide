import { DATA_TYPES } from "../../../../../utils/Constants";
import DataType from "../AbstractDataType";
import { checkIfDefaultOrDisabled } from "./utils";

const objectOptions = {
  parse: a => JSON.parse(a),
  // Check if value is a string since there are instances where objects were saved as strings
  unparse: a => typeof(a) === "string" ? a : JSON.stringify(a),
};

class ObjectType extends DataType {
  // Object type properties definition
  key = DATA_TYPES.OBJECT;
  label = "Object";
  default = {};

  editComponent = (props, mode = "row") => {
    const editor = {
      row: _props => this.stringEditComponent(_props, this.default, undefined, objectOptions),
      dialog: props => this.codeEditComponent(props, objectOptions),
    };
    return editor[mode](props);
  };

  /**
   * Validate object value
   * @param {*} value
   * @returns
   */
  validate(value) {
    return Promise.resolve({ success: typeof(value) === "object" });
  }
}

export default ObjectType;
