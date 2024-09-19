import { DATA_TYPES } from "../../../../../utils/Constants";
import DataType from "../AbstractDataType";

class StringType extends DataType {
  key = DATA_TYPES.STRING;
  label = "String";
  default = '';

  constructor(options) {
    super({ ...options, onlyStrings: true });
  }

  parse(string) {
    return string;
  }

  unparse(string) {
    return string;
  }
}

export default StringType;
