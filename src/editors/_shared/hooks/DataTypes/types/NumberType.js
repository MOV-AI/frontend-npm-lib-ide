import React from "react";
import { TextField } from "@material-ui/core";
import { DATA_TYPES } from "../../../../../utils/Constants";
import DataType from "../AbstractDataType";
import { checkIfDefaultOrDisabled } from "./utils";

class NumberType extends DataType {
  key = DATA_TYPES.NUMBER;
  inputType = DATA_TYPES.NUMBER;
  label = "Number";
  default = 0;

  _validate(value) {
    return value === undefined
      || (value !== null && typeof value === this.key
      && !isNaN(value) && !Array.isArray(value));
  }

  editComponent(props) {
    return this.stringEditComponent(props);
  }
}

export default NumberType;
