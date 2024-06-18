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

  editComponent = (props, mode = "row") => {
    this.label = props.label ?? this.label;
    let pyValue = this.toString(props.rowData.value).toLowerCase();
    const editor = {
      row: () => this.booleanEditComponent(props, pyValue),
      dialog: () => this.booleanEditComponent(props, pyValue, true)
    };
    return editor[mode]();
  };

  /**
   * Validate Boolean value
   * @param {*} value
   * @returns
   */
  validate(value) {
    return new Promise(resolve => {
      try {
        const isValid =
          typeof value === DATA_TYPES.BOOLEAN ||
          typeof pythonToBool(value) === DATA_TYPES.BOOLEAN;

        resolve({ success: isValid });
      } catch (e) {
        resolve({ success: false });
      }
    });
  }

  /**
   * @override Get boolean default value
   * @param {*} options
   * @returns {string | boolean}
   *  Returns Python Boolean as string if isPythonValue is set to true
   *  Or js boolean otherwise
   */
  getDefault(options = { isPythonValue: false }) {
    const { isPythonValue } = options;
    return isPythonValue ? boolToPython(false) : false;
  }

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Render Boolean Type edit component
   * @param {*} props
   * @param {*} pyValue
   * @param {*} usePythonValue
   * @returns
   */
  booleanEditComponent(props, pyValue, usePythonValue) {
    let parsedValue = false;
    try {
      parsedValue = JSON.parse(pyValue);
      if (typeof parsedValue === DATA_TYPES.STRING)
        parsedValue = JSON.parse(parsedValue);
    } catch (e) {
      parsedValue = false;
    }

    // On change checkbox value
    const onChangeCheckbox = event => {
      const boolValue = event.target.checked;
      const value = usePythonValue ? boolToPython(boolValue) : boolValue;
      props.onChange(value);
    };

    return (
      <Checkbox
        data-testid={"Type=boolean-" + this.label}
        color={"primary"}
        style={{ width: "fit-content" }}
        checked={parsedValue}
        onChange={onChangeCheckbox}
        disabled={props.disabled}
      />
    );
  }
}

export default BooleanType;
