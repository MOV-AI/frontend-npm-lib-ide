import { Rest } from "@mov-ai/mov-fe-lib-core";
import { SCOPES } from "../../../../../utils/Constants";
import ConfigurationSelector from "../../../ConfigurationSelector/ConfigurationSelector";
import DataType from "../AbstractDataType";

class ConfigurationType extends DataType {
  // Configuration type properties definition
  key = "config";
  label = SCOPES.CONFIGURATION;

  editComponent = props => {
    const { alert, ...otherProps } = props;
    return <ConfigurationSelector rowProps={otherProps} alert={alert} />;
  };

  /**
   * Validate configuration value
   * @param {*} value
   * @returns
   */
  validate(value) {
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
}

export default ConfigurationType;
