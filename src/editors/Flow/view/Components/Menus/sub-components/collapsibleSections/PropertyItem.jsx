import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { i18n } from "@mov-ai/mov-fe-lib-react";
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select
} from "@mui/material";
import { convertToValidString } from "../../../../../../../utils/Utils";

import { propertiesStyles } from "../../styles";

const PropertyItem = ({
  name,
  title,
  options,
  value,
  templateValue,
  editable,
  onChangeProperties
}) => {
  // Other hooks
  const classes = propertiesStyles();

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

  /**
   * Handle On Change Event
   * @param {object} evt : Event
   */
  const handleOnChange = useCallback(
    evt => {
      const prop = evt.currentTarget.dataset.prop;
      onChangeProperties(prop, evt.target.value);
    },
    [onChangeProperties]
  );

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * @private Get default text for properties template value
   * @param {boolean} isDefault : If option is default value
   * @returns {string} string to concatenate with label
   */
  const getDefaultText = useCallback(
    isDefault => (isDefault ? `(${i18n.t("Default")})` : ""),
    []
  );

  return (
    <Grid item xs={12} className={classes.gridAlign}>
      <FormControl fullWidth={true}>
        <InputLabel>{title}</InputLabel>
        <Select
          value={value ?? templateValue}
          onChange={handleOnChange}
          disabled={!editable}
        >
          {options.map(option => (
            <MenuItem
              key={`properties-options-${convertToValidString(
                option.text
              )}_${convertToValidString(option.value)}`}
              value={option.value}
              data-prop={name}
            >
              {`${option.text} ${getDefaultText(
                option.value === templateValue
              )}`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>
  );
};

PropertyItem.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.any.isRequired,
  onChangeProperties: PropTypes.func.isRequired,
  name: PropTypes.string,
  options: PropTypes.array,
  templateValue: PropTypes.any,
  editable: PropTypes.bool
};

export default PropertyItem;
