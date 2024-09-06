import { DATA_TYPES } from "../../../../../utils/Constants";
import DataType from "../AbstractDataType";
import { checkIfDefaultOrDisabled } from "./utils";

class ObjectType extends DataType {
  // Object type properties definition
  key = DATA_TYPES.OBJECT;
  label = "Object";
  default = {};
}

export default ObjectType;
