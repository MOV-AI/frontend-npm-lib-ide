import { useRef, useMemo, useCallback } from "react";
import { useTheme } from "@material-ui/styles";
import DataTypeManager from "./DataTypes/DataTypeManager";

const useDataTypes = (options = {}) => {
  const { onlyStrings } = options;

  // Hooks
  const theme = useTheme();
  const dataTypeManager = useMemo(
    () => new DataTypeManager({ theme, onlyStrings }),
    []
  );

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
  const getDataTypes = useCallback((excluded = []) => {
    return dataTypeManager
      .getTypeKeys()
      .filter(type => !excluded.includes(type));
  }, [dataTypeManager]);

  /**
   * Get data type label
   * @param {string} dataType
   * @returns {string} Type Label
   */
  const getLabel = useCallback(dataType => {
    return dataTypeManager.getType(dataType)?.getLabel();
  }, [dataTypeManager]);

  /**
   * Get edit component
   * @param {string} dataType : Data type
   * @returns {ReactElement} Data Type Editor Component
   */
  const getEditComponent = useCallback(dataType => {
    return dataTypeManager.getType(dataType ?? "any")?.getEditComponent();
  }, [dataTypeManager]);

  /**
   * Return a type
   */
  const getType = useCallback(
    type => dataTypeManager.getType(type ?? "any"),
    [dataTypeManager]
  );

  /**
   * Validation method of data
   * @param {{type: string, value: *}} data : Data to be validated
   * @param {{object | undefined}} options : Validation options object
   * @returns {Promise} Async validation of data
   */
  const validate = useCallback((data, options) => {
    const dataType = dataTypeManager.getType(data.type);
    if (!dataType) return Promise.resolve({ success: true, data });
    return dataType.validate(data.value, options);
  }, [dataTypeManager]);

  return useMemo(() => ({
    getLabel,
    getDataTypes,
    getEditComponent,
    getType,
    validate
  }), [getLabel, getDataTypes, getEditComponent, getType, validate]);
};

export default useDataTypes;
