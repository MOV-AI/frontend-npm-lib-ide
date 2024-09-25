import { DATA_TYPES } from "../../../../../utils/Constants";
import DataType from "../AbstractDataType";
import { checkIfDefaultOrDisabled } from "./utils";

class ArrayType extends DataType {
  key = DATA_TYPES.ARRAY;
  label = "Array";
  default = [];

  _validate(value) {
    return value === undefined || Array.isArray(value);
  }
}

export default ArrayType;
