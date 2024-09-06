import React from "react";
import { TextField } from "@material-ui/core";
import { DATA_TYPES } from "../../../../../utils/Constants";
import DataType from "../AbstractDataType";
import { checkIfDefaultOrDisabled } from "./utils";

class NumberType extends DataType {
  // Number type properties definition
  key = DATA_TYPES.NUMBER;
  inputType = DATA_TYPES.NUMBER;
  label = "Number";
  default = 0;
}

export default NumberType;
