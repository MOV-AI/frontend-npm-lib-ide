import { DATA_TYPES } from "../../../../../utils/Constants";
import DataType from "../AbstractDataType";

class AnyType extends DataType {
  key = DATA_TYPES.ANY;
  label = "Any";

  _validate(value) {
    return true;
  }

  parse(value) {
    return value;
  }

  unparse(value) {
    return value;
  }
}

export default AnyType;
