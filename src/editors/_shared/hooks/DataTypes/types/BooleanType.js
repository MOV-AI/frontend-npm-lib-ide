import React from "react";
import { Checkbox } from "@material-ui/core";
import { DATA_TYPES } from "../../../../../utils/Constants";
import { pythonToBool, boolToPython } from "../../../../../utils/Utils";
import DataType from "../AbstractDataType";

class BooleanType extends DataType {
  key = DATA_TYPES.BOOLEAN;
  label = "Boolean";
  default = false;

  constructor(opts) {
    super({ ...opts, reverse: true });
  }

  parse(value) {
    return value === "True";
  }

  unparse(value) {
    return value ? "True" : "False";
  }

  editComponent(props) {
    return (
      <Checkbox
        data-testid={"Type=boolean-" + (props.label ?? this.label)}
        color={"primary"}
        style={{ width: "fit-content" }}
        checked={this.parsing.parse(props.rowData.value) === true}
        onChange={evt => props.onChange(
          evt.target.checked
        )}
        disabled={props.disabled}
      />
    );
  }
}

export default BooleanType;
