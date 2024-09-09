import React from "react";
import { Checkbox } from "@material-ui/core";
import { DATA_TYPES } from "../../../../../utils/Constants";
import { pythonToBool, boolToPython } from "../../../../../utils/Utils";
import DataType from "../AbstractDataType";

class BooleanType extends DataType {
  // Boolean type properties definition
  key = DATA_TYPES.BOOLEAN;
  label = "Boolean";
  default = false;

  parse(value) {
    if (!this.onlyStrings)
      return value; // the value is already real

    const trimmed = value.trim();

    if (trimmed === "True")
      return true;

    if (trimmed === "False")
      return false;

    throw new Error("Invalid boolean string");
  }

  unparse(value) {
    return this.onlyStrings
      ? (value ? "True" : "False")
    // in this case, we want to parse, since we need
    // a real object for the checkbox component and not a string
      : super.parse(value);
  }

  getParsed(value) {
    return value;
  }

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Render Boolean Type edit component
   * @param {*} props
   * @returns
   */
  editComponent(props) {
    return (
      <Checkbox
        data-testid={"Type=boolean-" + (props.label ?? this.label)}
        color={"primary"}
        style={{ width: "fit-content" }}
        checked={this.parsing.unparse(props.rowData.value)}
        onChange={evt => props.onChange(
          this.parsing.parse(evt.target.checked)
        )}
        disabled={props.disabled}
      />
    );
  }
}

export default BooleanType;
