import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import {
  MenuItem,
  Select,
  FormControl,
  FormControlLabel,
  InputLabel,
  Radio,
  RadioGroup
} from "@material-ui/core";
import { withTheme } from "../../../decorators/withTheme";
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
    alert,
    form = {
      name: { label: t("Name") },
      value: { label: t("Value") },
      description: { label: t("Value") },
    },
    name,
    value,
    type = DATA_TYPES.ANY,
    description,
  } = props;

  const errors = Object.values(form).reduce((a, b) => a.concat(b.errors ?? []), []);
  const errorCount = errors.length;

  // Hooks
  const [data, setData] = useState({ name, value, description, type });
  const [valueOption, setValueOption] = useState(VALUE_OPTIONS.DEFAULT);
  const { t } = useTranslation();
  const classes = parametersDialogStyles();
  const { getDataTypes, getLabel, getEditComponent, getValidValue, validate } =
    useDataTypes();

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methdos                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Renders a value related to to it's type
   * @param {*} value : value to be rendered
   */
  const renderValue = useCallback(
    value => {
      if (data.type === DATA_TYPES.STRING) {
        return `"${value}"`;
      }

      return value;
    },
    [data.type]
  );

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

  /**
   * @private Stringify value if type string
   * @param {{type: string, value: *}} formData
   * @returns {*} Formatted value
   */
  const valueToRender = useCallback(formData => {
    const formValue = formData.value ?? formData.defaultValue;
    return formData?.type === DATA_TYPES.STRING
      ? JSON.stringify(formValue)
      : formValue;
  }, []);

  /**
   * @private Parse value if type string
   * @param {{type: string, value: *}} formData
   * @returns {*} Formatted value
   */
  const valueToSave = useCallback(
    formData => {
      const type = formData.type;

      if (showValueOptions) {
        if (valueOption === VALUE_OPTIONS.DEFAULT) {
          return DEFAULT_VALUE;
        }
        if (valueOption === VALUE_OPTIONS.DISABLED) {
          return DISABLED_VALUE;
        }
      }

      return type === DATA_TYPES.STRING
        ? JSON.parse(formData.value)
        : formData.value;
    },
    [showValueOptions, valueOption]
  );

  /**
   * On change value editor (refactored to its own method to reduce cognitivity complexity)
   * @param {*} _value
   */
  const onChangeValueEditor = useCallback(
    (value, options) => {
      if (
        valueOption !== VALUE_OPTIONS.CUSTOM &&
        renderValue(options.defaultValue) !== value
      )
        setValueOption(VALUE_OPTIONS.CUSTOM);
      setData(prevState => ({ ...prevState, value: value }));
    },
    [valueOption]
  );

  /**
   * Format Value Editor (used to format the configurations)
   * @returns {string} Method used to format value
   */
  const getFormatterValueEditor = useCallback(() => {
    return data.type === DATA_TYPES.CONFIGURATION
      ? ConfigurationType.format2Parameter
      : s => s;
  }, [data]);

  /**
   * Get Validation options for each type
   * @returns {Object} Validation options
   */
  const getValidationOptions = useCallback(() => {
    return data.type === DATA_TYPES.CONFIGURATION
      ? { isConfigFromParameter: true }
      : {};
  }, [data]);

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
  const onValidation = useCallback(async formData => {
    const dataToValidate = {
      ...formData,
      value: (
        showValueOptions && valueOption === VALUE_OPTIONS.DEFAULT
        ? DEFAULT_VALUE
        : data.value
      ) ?? form.value.defaultValue,
      type: data.type
    };

    if (customValidation) return customValidation(dataToValidate);

    // If value is DEFAULT_VALUE, the parameter should be removed
    //  Therefore we can by-pass the validation in that case
    if (dataToValidate.value === DEFAULT_VALUE)
      return { value: [] };

    const res = await validate(dataToValidate, getValidationOptions());

    if (!res.success)
      return [t(res.error ?? ERROR_MESSAGES.DATA_VALIDATION_FAILED)]; 

    return [];
  }, [
    showValueOptions,
    valueOption,
    data,
    form,
    alert,
    validate,
    customValidation,
    t
  ]);

  useEffect(() => {
    if (errorCount)
      alert({ message: errors[0], severity: ALERT_SEVERITIES.ERROR });
  }, [errorCount, alert, errors]);

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
      const options = { isPythonValue: true };

      getValidValue(type, data.value, options).then(newValue => {
        setData(prevState => ({
          ...prevState,
          type,
          value: newValue ?? prevState.value
        }));
      });
    },
    [data, getValidValue]
  );

  /**
   * Handle Value Option onChange Event
   * @param {*} evt
   */
  const handleChangeValueOption = useCallback(
    evt => {
      const opt = evt.target.value;
      setData(prevState => {
        if (opt === VALUE_OPTIONS.DISABLED)
          return { ...prevState, value: DISABLED_VALUE };
        if (opt === VALUE_OPTIONS.DEFAULT || opt === VALUE_OPTIONS.CUSTOM)
          return { ...prevState, value: renderValue(value) };
        return prevState;
      });

      setValueOption(opt);
    },
    [value, renderValue]
  );

  //========================================================================================
  /*                                                                                      *
   *                                    React lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  useEffect(() => {
    if (showValueOptions)
      setValueOption(getValueOption(value));
    setData(data => ({ ...data, value: valueToRender(props) }));
  }, [showValueOptions, value, valueToRender, getValueOption, setValueOption, setData]);

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
        <InputLabel>{`${t("Type")} *`}</InputLabel>
        <Select
          fullWidth
          name="type"
          value={data.type || DATA_TYPES.ANY}
          onChange={handleTypeChange}
          disabled={disableType || disabled}
          inputProps={{ "data-testid": "input_type" }}
        >
          {getDataTypes().map(key => (
            <MenuItem key={key} value={key}>
              {getLabel(key)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }, [
    disabled,
    classes,
    data,
    preventRenderType,
    disableType,
    getDataTypes,
    getLabel,
    handleTypeChange,
    t
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
            label={t("UseCustomValue")}
          />
          <FormControlLabel
            value={VALUE_OPTIONS.DEFAULT}
            disabled={disabled}
            control={<Radio inputProps={{ "data-testid": "input_default" }} />}
            label={t("UseDefaultValue")}
          />
          <FormControlLabel
            value={VALUE_OPTIONS.DISABLED}
            disabled={disabled}
            control={<Radio inputProps={{ "data-testid": "input_disabled" }} />}
            label={t("DisableParamType", {
              paramType: data.paramType || t("Value")
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
    t,
    disabled
  ]);

  /**
   * Render Value Editor Component
   */
  const renderValueEditor = useCallback(
    (defaultValue, options) => {
      const editComponent = getEditComponent(data.type);
      if (!editComponent) return <></>;
      return (
        <>
          <input type="hidden" name="value" value={data.value} />
          {!options.isDefault && showValueOptions && renderValueOptions()}
          {!options.isDefault && valueOption === VALUE_OPTIONS.DISABLED ? (
            <p className={classes.disabledValue}>
              {t("DisabledParamType", {
                paramType: data.paramType || t("Value")
              })}
            </p>
          ) : (
            editComponent(
              {
                rowData: {
                  value: options.isDefault
                    ? renderValue(defaultValue)
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
      data,
      isNew,
      classes,
      renderValueOptions,
      renderValue,
      getEditComponent,
      t
    ]
  );

  return (
    <KeyValueEditorDialog
      {...props}
      onValidation={onValidation}
      renderValueEditor={renderValueEditor}
      renderCustomContent={renderTypeSelector}
    />
  );
};

ParameterEditorDialog.propTypes = {
  isNew: PropTypes.bool,
  disableType: PropTypes.bool,
  disabled: PropTypes.bool,
  preventRenderType: PropTypes.bool,
  showValueOptions: PropTypes.bool,
  customValidation: PropTypes.func,
  alert: PropTypes.func
};

export default withAlerts(withTheme(ParameterEditorDialog));
