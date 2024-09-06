import { DATA_TYPES } from "../../../../../utils/Constants";
import DataType from "../AbstractDataType";
import { checkIfDefaultOrDisabled } from "./utils";

class ArrayType extends DataType {
  // Array type properties definition
  key = DATA_TYPES.ARRAY;
  label = "Array";
  default = [];

  /**
   * Validate array value
   * @param {*} value
   * @returns
   */
  _validate(value) {
    return Array.isArray(value);
  }
}

export default ArrayType;
