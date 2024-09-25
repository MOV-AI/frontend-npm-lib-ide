import React, { useCallback, useEffect, useState } from "react";
import { i18n } from "@mov-ai/mov-fe-lib-react";
import PropTypes from "prop-types";
import {
  MenuItem,
  BaseSelect,
  FormControl,
  FormControlLabel,
  InputLabel,
  Radio,
  RadioGroup
} from "@mov-ai/mov-fe-lib-react";
import { withTheme } from "@mov-ai/mov-fe-lib-react";
import ApplicationTheme from "../../../themes";
import { ERROR_MESSAGES } from "../../../utils/Messages";
import {
  DATA_TYPES,
  DEFAULT_VALUE,
  DISABLED_VALUE,
  ALERT_SEVERITIES
} from "../../../utils/Constants";
import withAlerts from "../../../decorators/withAlerts";
import KeyValueEditorDialog from "../KeyValueTable/KeyValueEditorDialog";
import useDataTypes from "../hooks/useDataTypes";

import { parametersDialogStyles } from "./styles";
import ConfigurationType from "../hooks/DataTypes/types/ConfigurationType";

const VALUE_OPTIONS = {
  CUSTOM: "custom",
  DEFAULT: "default",
  DISABLED: "disabled"
};

const ParameterEditorDialog = props => {
  const {
    isNew,
    disabled,
    disableType,
    customValidation,
    preventRenderType,
    showValueOptions,
    alert
  } = props;

  // Hooks
  const [data, setData] = useState(props.data);
  const classes = parametersDialogStyles();
  const { getDataTypes, getType } =
    useDataTypes({ onlyStrings: true });

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methdos                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Get Default Value Option
   * @param {*} defaultValue : Default value to check
   * @param {*} value : Value to check
   */
  const getValueOption = useCallback(value => {
    let result = VALUE_OPTIONS.CUSTOM;

    if (value === DISABLED_VALUE) {
      result = VALUE_OPTIONS.DISABLED;
    }
    if (value === DEFAULT_VALUE) {
      result = VALUE_OPTIONS.DEFAULT;
    }

    return result;
  }, []);

  const [valueOption, setValueOption] = useState(getValueOption(props.data.value));
  /**
   * @private Parse value if type string
   * @param {{type: string, value: *}} formData
   * @returns {*} Formatted value
   */
  const valueToSave = useCallback(
    formData => {
      if (showValueOptions) {
        if (valueOption === VALUE_OPTIONS.DEFAULT) {
          return DEFAULT_VALUE;
        }
        if (valueOption === VALUE_OPTIONS.DISABLED) {
          return DISABLED_VALUE;
        }
      }

      return getType(formData.type).getSaveable(formData.value);
    },
    [showValueOptions, valueOption, getType]
  );

  /**
   * On change value editor (refactored to its own method to reduce cognitive complexity)
   * @param {*} _value
   */
  const onChangeValueEditor = useCallback(
    (value, options) => {
      if (
        valueOption !== VALUE_OPTIONS.CUSTOM &&
        options.defaultValue !== value
      ) {
        setValueOption(VALUE_OPTIONS.CUSTOM);
      }
      setData(prevState => ({
        ...prevState,
        value: valueToSave({
          ...prevState,
          value
        }),
      }));
    },
    [valueOption, valueToSave, setData]
  );

  /**
   * Format Value Editor (used to format the configurations)
   * @returns {string} Method used to format value
   */
  const getFormatterValueEditor = useCallback(() => {
    return data.type === DATA_TYPES.CONFIGURATION
      ? ConfigurationType.format2Parameter
      : s => s;
  }, [data.type]);

  /**
   * Get Validation options for each type
   * @returns {Object} Validation options
   */
  const getValidationOptions = useCallback(() => {
    return data.type === DATA_TYPES.CONFIGURATION
      ? { isConfigFromParameter: true }
      : {};
  }, [data.type]);

  //========================================================================================
  /*                                                                                      *
   *                                   Component Methods                                  *
   *                                                                                      */
  //========================================================================================
  /**
   * Validate form data to submit
   * @param {*} formData
   * @returns
   */
  const onValidate = useCallback(
    formData => {
      const dataToValidate = {
        ...formData,
        value: data.value,
        type: data.type
      };

      if (customValidation) return customValidation(dataToValidate);

      // Validate data
      return getType(data.type).validate(data.value, getValidationOptions())
        .then(res => {
          if (!res.success)
            throw new Error(
              i18n.t(res.error) || i18n.t(ERROR_MESSAGES.DATA_VALIDATION_FAILED)
            );
          // Prepare data to submit
          if (res.parsed) data.value = res.parsed.toString();
          return { ...res, data: dataToValidate };
        })
        .catch(err => {
          alert({ message: err.message, severity: ALERT_SEVERITIES.ERROR });
          return err;
        });
    },
    [
      showValueOptions,
      valueOption,
      data.value,
      data.type,
      alert,
      getType,
      valueToSave,
      customValidation,
    ]
  );

  //========================================================================================
  /*                                                                                      *
   *                                   Component Handlers                                 *
   *                                                                                      */
  //========================================================================================

  /**
   * Handle Type Select onChange Event
   * @param {*} evt
   * @returns
   */
  const handleTypeChange = useCallback(
    evt => {
      const type = evt?.target?.value;
      const typeInst = getType(type);

      typeInst.validate(data.value).then(({ success }) => {
        setData(prevState => ({
          ...prevState,
          type,
          value: success ? prevState.value : typeInst.getDefault(),
        }));
      });
    }, [getType, data.value, setData]
  );

  /**
   * Handle Value Option onChange Event
   * @param {*} evt
   */
  const handleChangeValueOption = useCallback(
    evt => {
      const opt = evt.target.value;
      setData(prevState => {
        if (opt === VALUE_OPTIONS.DISABLED) {
          return { ...prevState, value: DISABLED_VALUE };
        }
        if (opt === VALUE_OPTIONS.DEFAULT || opt === VALUE_OPTIONS.CUSTOM) {
          return { ...prevState, value: props.data.defaultValue };
        }
        return prevState;
      });

      setValueOption(opt);
    },
    [props.data.defaultValue]
  );

  //========================================================================================
  /*                                                                                      *
   *                                    Render Methods                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Render Data Type Selector
   * @returns {ReactComponent} Form control with data type selector
   */
  const renderTypeSelector = useCallback(() => {
    if (preventRenderType) return null;
    return (
      <FormControl className={classes.marginTop}>
        <InputLabel>{`${i18n.t("Type")} *`}</InputLabel>
        <BaseSelect
          fullWidth
          value={data.type || DATA_TYPES.ANY}
          onChange={handleTypeChange}
          disabled={disableType || disabled}
          inputProps={{ "data-testid": "input_type" }}
        >
          {getDataTypes().map(key => (
            <MenuItem key={key} value={key}>
              {getType(key).getLabel()}
            </MenuItem>
          ))}
        </BaseSelect>
      </FormControl>
    );
  }, [
    disabled,
    classes,
    data.type,
    preventRenderType,
    disableType,
    getDataTypes,
    getType,
    handleTypeChange,
  ]);

  const renderValueOptions = useCallback(() => {
    return (
      <FormControl component="fieldset">
        <RadioGroup
          data-testid="section_value-option"
          value={valueOption}
          onChange={handleChangeValueOption}
          className={classes.valueOptions}
        >
          <FormControlLabel
            value={VALUE_OPTIONS.CUSTOM}
            disabled={disabled}
            control={<Radio inputProps={{ "data-testid": "input_custom" }} />}
            label={i18n.t("UseCustomValue")}
          />
          <FormControlLabel
            value={VALUE_OPTIONS.DEFAULT}
            disabled={disabled}
            control={<Radio inputProps={{ "data-testid": "input_default" }} />}
            label={i18n.t("UseDefaultValue")}
          />
          <FormControlLabel
            value={VALUE_OPTIONS.DISABLED}
            disabled={disabled}
            control={<Radio inputProps={{ "data-testid": "input_disabled" }} />}
            label={i18n.t("DisableParamType", {
              paramType: data.paramType || i18n.t("Value")
            })}
          />
        </RadioGroup>
      </FormControl>
    );
  }, [
    data.paramType,
    valueOption,
    classes,
    handleChangeValueOption,
    disabled
  ]);

  /**
   * Render Value Editor Component
   */
  const renderValueEditor = useCallback(
    (defaultValue, options) => {
      const editComponent = getType(data.type).getEditComponent();
      if (!editComponent) return <></>;
      return (
        <>
          {!options.isDefault && showValueOptions && renderValueOptions()}
          {!options.isDefault && valueOption === VALUE_OPTIONS.DISABLED ? (
            <p className={classes.disabledValue}>
              {i18n.t("DisabledParamType", {
                paramType: data.paramType || i18n.t("Value")
              })}
            </p>
          ) : (
            editComponent(
              {
                rowData: {
                  value: options.isDefault
                    ? defaultValue
                    : data.value
                },
                alert,
                formatValue: getFormatterValueEditor(),
                onChange: _value => onChangeValueEditor(_value, options),
                disabled: options.disabled || disabled,
                isNew: options.isNew ?? isNew
              },
              "dialog"
            )
          )}
        </>
      );
    },
    [
      valueOption,
      showValueOptions,
      disabled,
      data.value,
      data.type,
      data.paramType,
      isNew,
      classes,
      handleTypeChange,
      renderValueOptions,
      handleTypeChange,
      getType,
    ]
  );

  return (
    <KeyValueEditorDialog
      {...props}
      validate={onValidate}
      renderValueEditor={renderValueEditor}
      renderCustomContent={renderTypeSelector}
    />
  );
};

ParameterEditorDialog.propTypes = {
  data: PropTypes.object.isRequired,
  isNew: PropTypes.bool,
  disableType: PropTypes.bool,
  disabled: PropTypes.bool,
  preventRenderType: PropTypes.bool,
  showValueOptions: PropTypes.bool,
  customValidation: PropTypes.func,
  alert: PropTypes.func
};

export default withAlerts(withTheme(ParameterEditorDialog, ApplicationTheme));
