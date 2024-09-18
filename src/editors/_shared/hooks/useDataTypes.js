import { useRef } from "react";
import { useTheme } from "@material-ui/styles";
import DataTypeManager from "./DataTypes/DataTypeManager";

const useDataTypes = (options = {}) => {
  const { onlyStrings } = options;

  // Hooks
  const theme = useTheme();
  const dataTypeManager = new DataTypeManager({ theme, onlyStrings });

  //========================================================================================
  /*                                                                                      *
   *                                    Exposed Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Get list of valid data types to be displayed in the select box
   * @param {Array} excluded : Excluded keys
   * @returns {Array} List of valid data types to be displayed in the select box
   */
  const getDataTypes = (excluded = []) => {
    return dataTypeManager
      .getTypeKeys()
      .filter(type => !excluded.includes(type));
  };

  /**
   * Get data type label
   * @param {string} dataType
   * @returns {string} Type Label
   */
  const getLabel = dataType => {
    return dataTypeManager.getType(dataType)?.getLabel();
  };

  /**
   * Get edit component
   * @param {string} dataType : Data type
   * @returns {ReactElement} Data Type Editor Component
   */
  const getEditComponent = dataType => {
    return dataTypeManager.getType(dataType ?? "any")?.getEditComponent();
  };

  /**
   * Return a type
   */
  const getType = type => dataTypeManager.getType(type ?? "any");

  /**
   * Return the value if valid otherwise returns
   * the default value ot the type
   * @param {string} type : The type to convert to
   * @param {string} value : The value to validate
   * @returns {string}
   */
  const getValidValue = async (type, value, options) => {
    const typeInst = dataTypeManager.getType(type);
    const res = await typeInst.validate(value);
    return res.success ? value : typeInst.getDefault(options);
  };

  /**
   * Validation method of data
   * @param {{type: string, value: *}} data : Data to be validated
   * @param {{object | undefined}} options : Validation options object
   * @returns {Promise} Async validation of data
   */
  const validate = (data, options) => {
    const dataType = dataTypeManager.getType(data.type);
    if (!dataType) return Promise.resolve({ success: true, data });
    return dataType.validate(data.value, options);
  };

  return {
    getLabel,
    getDataTypes,
    getEditComponent,
    getValidValue,
    getType,
    validate
  };
};

export default useDataTypes;
