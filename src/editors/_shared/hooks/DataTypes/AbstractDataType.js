import React, { useState, useEffect, useMemo, useCallback } from "react";
import _toString from "lodash/toString";
import { TextField, Typography } from "@material-ui/core";
import { MonacoCodeEditor } from "@mov-ai/mov-fe-lib-code-editor";
import { DATA_TYPES } from "../../../../utils/Constants";

const identity = a => a;

// for inputs that use strings as input
// although they might output real things like numbers
export function useEdit(props) {
  const { rowData = {}, dataType, onChange: innerOnChange = () => {} } = props;
  const initialValue = useMemo(
    () => dataType.parsing.unparse(rowData.value),
    [dataType]
  );
  const placeholder = useMemo(() => dataType.unparse(dataType.default), [dataType]);
  const [value, setValue] = useState(initialValue || placeholder);

  const onChange = useCallback((value) => {
    innerOnChange(dataType.parsing.parse(value));
    setValue(value);
  }, [innerOnChange, setValue, dataType]);

  useEffect(() => {
    if (rowData.value !== null)
      setValue(dataType.parsing.unparse(rowData.value));
  }, [onChange, rowData.value]);

  return { ...props, onChange, value };
}

function StringEdit(props) {
  const { onChange, dataType, ...rest } = useEdit(props);

  return (<TextField
    type={dataType.inputType}
    inputProps={{ "data-testid": "input_value" }}
    fullWidth
    onChange={evt => onChange(evt.target.value)}
    { ...rest }
  />);
}

function CodeEdit(props) {
  const { isNew, disabled, dataType, ...rest } = useEdit(props);

  return (<Typography
    data-testid="section_data-type-code-editor"
    component="div"
    style={{ height: "100px", width: "100%" }}
  >
    <MonacoCodeEditor
      onLoad={editor => {
        if (!isNew)
          editor.focus();
      }}
      language="python"
      disableMinimap={true}
      options={{ readOnly: disabled }}
      theme={dataType._theme?.codeEditor?.theme ?? "dark"}
      { ...rest }
    />
  </Typography>);
}

/**
 * Abstract Data Type Class
 */
class AbstractDataType {
  key = "";
  label = "";
  default = "";
  inputType = "text";

  // hooks
  _theme = {};

  constructor({ theme, onlyStrings, textInput = true } = {}) {
    // Set hooks to be used in abstract renders
    this._theme = theme;
    this._onlyStrings = onlyStrings;

    const parsing = {
      parse: this.parse.bind(this),
      unparse: this.unparse.bind(this),
    }, noParsing = { parse: identity, unparse: identity };

    const doInputParsing = (onlyStrings ? !textInput : textInput);
    this.parsing = doInputParsing ? parsing : noParsing;
    this._validationParse = onlyStrings ? parsing.parse : identity;
    this.getSaveable = onlyStrings ? parsing.unparse : identity;
  }

  getEditComponent() {
    return this.editComponent.bind(this);
  }

  editComponent(props) {
    if (this._onlyStrings)
      return this.codeEditComponent(props);

    return this.stringEditComponent(props);
  }

  // parsing strings into real objects
  parse(value) {
    if (value === '')
      return undefined;
    try {
      return JSON.parse(value);
    } catch (e) {
      return null; // null is invalid
    }
  }

  // unparsing real objects into strings
  unparse(value) {
    return typeof(value) === "string" ? value : JSON.stringify(value);
  }

  /**
   * Get Data type key
   * @returns
   */
  getKey() {
    return this.key;
  }

  /**
   * Get data type label
   * @returns
   */
  getLabel() {
    return this.label;
  }

  /**
   * Abstract validation : validation for simple types
   * @returns
   */
  _validate(value) {
    return value === undefined || typeof value === this.key;
  }

  /**
   * Abstract validation : validation for simple types
   * @returns
   */
  async validate(value) {
    if (value === "None")
      return { success: true };

    try {
      const parsed = this._validationParse(value);
      return {
        success: await this._validate(parsed),
        parsed,
      };
    } catch (_e) {
      return { success: false };
    }
  }

  /**
   * Get Default data type value
   * @param {*} options
   * @returns {any} Default value
   */
  getDefault(options) {
    return this.unparse(this.default);
  }

  /**
   * @private Gets common text editor for regular inputs (strings, arrays, objects, any, default)
   * @param {*} props : Material table row props
   * @returns {ReactComponent} Text input for editing common strings
   */
  stringEditComponent(props) {
    return <StringEdit dataType={this} { ...props } />;
  }

  /**
   * @private Render code editor
   * @param {{rowData: {value: string}}, onChange: function, isNew: boolean} props : input props
   * @returns {ReactComponent} Code Editor Component
   */
  codeEditComponent = (props) => {
    return <CodeEdit dataType={this} { ...props } />;
  };
}

export default AbstractDataType;
