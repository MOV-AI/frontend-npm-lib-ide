import { DATA_TYPES } from "../../../../../utils/Constants";
import DataType from "../AbstractDataType";

class ArrayType extends DataType {
  key = DATA_TYPES.ARRAY;
  label = "Array";
  default = [];

  parse(value) {
    if (value === "") return undefined;
    try {
      // Substitute all single quotes with double quotes before parsing
      const normalizedValue = value.replace(/'/g, '"');
      return JSON.parse(normalizedValue);
    } catch (e) {
      console.error("Failed to parse array value:", e);
      return null; // null is invalid
    }
  }

  _validate(value) {
    return value === undefined || Array.isArray(value);
  }
}

export default ArrayType;
