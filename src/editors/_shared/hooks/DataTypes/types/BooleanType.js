import React from "react";
import { Checkbox } from "@material-ui/core";
import { DATA_TYPES } from "../../../../../utils/Constants";
import { pythonToBool, boolToPython } from "../../../../../utils/Utils";
import DataType from "../AbstractDataType";

class BooleanType extends DataType {
  key = DATA_TYPES.BOOLEAN;
  label = "Boolean";
  default = false;

  // boolType does parsing in reverse, since it only
  // wants to parse values when we're in onlyStrings.
  // it also uses a non-text input

  constructor(opts) {
    super({ ...opts, textInput: false });
  }

  parse(value) {
    switch (value) {
      case "": return undefined;
      case "True": return true;
      case "False": return false;
      default: return null;
    }
  }

  unparse(value) {
    return value ? "True" : "False";
  }

  editComponent(props) {
    const { label, disabled, onChange, rowData = {} } = props;
    return (
      <Checkbox
        inputProps={{ "data-testid": "bool-checkbox" }}
        data-testid={"Type=boolean-" + (label ?? this.label)}
        color={"primary"}
        style={{ width: "fit-content" }}
        checked={this.parsing.parse(rowData.value) === true}
        onChange={evt => onChange(
          evt.target.checked
        )}
        disabled={disabled}
      />
    );
  }
}

export default BooleanType;
