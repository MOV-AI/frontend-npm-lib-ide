import React from "react";
import { Rest } from "@mov-ai/mov-fe-lib-core";
import { DATA_TYPES, SCOPES } from "../../../../../utils/Constants";
import ConfigurationSelector from "../../../ConfigurationSelector/ConfigurationSelector";
import { useTextEdit } from "../AbstractDataType";
import StringType from "./StringType";

function ConfigurationEdit(props) {
  const { alert, ...rest } = useTextEdit(props);
  return <ConfigurationSelector alert={alert} rowProps={rest} />;
}

class ConfigurationType extends StringType {
  key = DATA_TYPES.CONFIGURATION;
  label = SCOPES.CONFIGURATION;

  editComponent = props => {
    return <ConfigurationEdit dataType={this} { ...props } />;
  };

  async _validate(value) {
    if (value === '')
      return true;

    const res = await Rest.cloudFunction({
      cbName: "backend.DataValidation",
      func: "validateConfiguration",
      args: value
    });

    return res.success && res.result;
  }
}

export default ConfigurationType;
