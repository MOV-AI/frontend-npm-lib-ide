import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { Typography } from "@material-ui/core";
import TableKeyValue from "../TableKeyValue";
import { EMPTY_MESSAGE } from "../../../../../../../../utils/Constants";

import { keyValueSectionStyles } from "../../styles";

const KeyValuesSection = props => {
  const {
    editable,
    handleTableKeyEdit,
    instanceValues,
    templateValues,
    varName
  } = props;
  // State hooks
  const [keyValues, setKeyValues] = useState([]);
  // Other hooks
  const classes = keyValueSectionStyles();
  const { t } = useTranslation();

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * @private Get values for Env. Variables and Command Lines
   * @returns {array} Formatted values to render in right menu
   */
  const getTableValues = useCallback(() => {
    const output = [];
    const allValues = [
      ...new Set([
        ...Object.keys(templateValues),
        ...Object.keys(instanceValues)
      ])
    ];
    allValues.forEach(key => {
      const value = instanceValues[key]?.value;
      const type = templateValues[key]?.type;
      const defaultValue = templateValues[key]?.value;
      const description = templateValues[key]?.description || "";
      output.push({
        key,
        value,
        description,
        defaultValue,
        type
      });
    });

    // Set state
    setKeyValues(output);
  }, [instanceValues, templateValues]);

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  useEffect(() => {
    getTableValues();
  }, [getTableValues]);

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return keyValues.length > 0 ? (
    <Typography component="div" className={classes.parametersContainer}>
      <TableKeyValue
        list={keyValues}
        allowEdit={editable}
        handleParameterEditModal={handleTableKeyEdit}
        type={varName}
        allowSearch
      />
    </Typography>
  ) : (
    <Typography className={`${classes.itemValue} ${classes.disabled}`}>
      {t(EMPTY_MESSAGE[varName.toUpperCase()])}
    </Typography>
  );
};

KeyValuesSection.propTypes = {
  varName: PropTypes.string.isRequired,
  handleTableKeyEdit: PropTypes.func.isRequired,
  instanceValues: PropTypes.object.isRequired,
  templateValues: PropTypes.object,
  editable: PropTypes.bool
};

KeyValuesSection.defaultProps = {
  editable: false
};

export default KeyValuesSection;
