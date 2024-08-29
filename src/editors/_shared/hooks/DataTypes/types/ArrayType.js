import { DATA_TYPES } from "../../../../../utils/Constants";
import DataType from "../AbstractDataType";
import { checkIfDefaultOrDisabled } from "./utils";

class ArrayType extends DataType {
  // Array type properties definition
  key = DATA_TYPES.ARRAY;
  label = "Array";
  default = [];

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
   * Validate array value
   * @param {*} value
   * @returns
   */
  validate(value) {
    return Promise.resolve({ success: Array.isArray(value) });
  }
}

export default ArrayType;
