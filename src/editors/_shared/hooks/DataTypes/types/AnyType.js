import { DATA_TYPES } from "../../../../../utils/Constants";
import DataType from "../AbstractDataType";

class AnyType extends DataType {
  // Any type properties definition
  key = DATA_TYPES.ANY;
  label = "Any";

  /**
   * Validate value
   * @param {*} value
   * @returns
   */
  _validate(value) {
    return true;
  }
}

export default AnyType;
