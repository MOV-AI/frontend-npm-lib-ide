import { DATA_TYPES } from "../../../../../utils/Constants";
import DataType from "../AbstractDataType";
import { checkIfDefaultOrDisabled } from "./utils";

class ObjectType extends DataType {
  // Object type properties definition
  key = DATA_TYPES.OBJECT;
  label = "Object";
  default = {};

  editComponent = (props, mode = "row") => {
    const editor = {
      row: _props => this.stringEditComponent(_props, this.default, undefined, {
        parse: a => JSON.parse(a),
        unparse: a => JSON.stringify(a),
      }),
      dialog: this.codeEditComponent
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
