import React from "react";
import { Rest } from "@mov-ai/mov-fe-lib-core";
import { DATA_TYPES, SCOPES } from "../../../../../utils/Constants";
import ConfigurationSelector from "../../../ConfigurationSelector/ConfigurationSelector";
import { useEdit } from "../AbstractDataType";
import StringType from "./StringType";

function ConfigurationEdit(props) {
  const { alert, ...rest } = useEdit(props);

  return (
    <ConfigurationSelector
      alert={alert}
      rowProps={rest}
    />
  );
}

class ConfigurationType extends StringType {
  // Configuration type properties definition
  key = DATA_TYPES.CONFIGURATION;
  label = SCOPES.CONFIGURATION;

  editComponent = props => {
    return <ConfigurationEdit dataType={this} { ...props } />;
  };

  /**
   * Validate configuration value
   * @param {*} value
   * @returns
   */
  validate(value, options) {
    if (value === "None")
      return Promise.resolve({ success: true });

    // Callback to validate value
    return Rest.cloudFunction({
      cbName: "backend.DataValidation",
      func: "validateConfiguration",
      args: value
    })
      .then(res => {
        const isValid = res.success && res.result;
        return { success: isValid, error: "ConfigurationNotFound" };
      })
      .catch(err => {
        console.log("Configuration validation err", err);
        return { success: false };
      });
  }

  /**
   * Temporary Hack to format configuration for parameter containing the $(config ) syntax
   * @param {string} configurationName : Configuration selected
   * @returns {string} Formatted Configuration Value
   */
  static format2Parameter = configurationName => {
    return `$(config ${configurationName})`;
  };
}

export default ConfigurationType;
