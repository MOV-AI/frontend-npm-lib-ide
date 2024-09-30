import React, { useState, useEffect, useMemo, useCallback } from "react";
import { TextField, Typography } from "@material-ui/core";
import { MonacoCodeEditor } from "@mov-ai/mov-fe-lib-code-editor";

const identity = a => a;

/*
 * inputs that use strings as input
 * (although they might output real objects)
 * all need similar functionality
 */
export function useTextEdit(props) {
  const { rowData = {}, dataType, onChange = () => {} } = props;
  const initialValue = useMemo(
    () => dataType.parsing.unparse(rowData.value),
    [dataType]
  );
  const placeholder = useMemo(() => dataType.unparse(dataType.default), [dataType]);
  const [value, setValue] = useState(initialValue || placeholder);

  const handleOnChange = useCallback((value) => {
    onChange(dataType.parsing.parse(value));
    setValue(value);
  }, [onChange, setValue, dataType]);

  useEffect(() => {
    if (rowData.value !== null)
      setValue(dataType.parsing.unparse(rowData.value));
  }, [handleOnChange, rowData.value]);

  return { ...props, onChange: handleOnChange, value };
}

function StringEdit(props) {
  const { onChange, dataType, ...rest } = useTextEdit(props);

  return (<TextField
    type={dataType.inputType}
    inputProps={{ "data-testid": "input_value" }}
    fullWidth
    onChange={evt => onChange(evt.target.value)}
    { ...rest }
  />);
}

function CodeEdit(props) {
  const { isNew, disabled, dataType, ...rest } = useTextEdit(props);

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
  _theme = {};

  constructor({ theme, onlyStrings = false, textInput = true } = {}) {
    this._theme = theme;
    this._onlyStrings = onlyStrings;

    const doInputParsing = onlyStrings !== textInput;
    this.parsing = doInputParsing
      ? { parse: this.parse, unparse: this.unparse }
      : { parse: identity, unparse: identity };

    this._validationParse = onlyStrings ? this.parse : identity;
    this.getSaveable = onlyStrings ? this.unparse : identity;
  }

  getEditComponent() {
    return this.editComponent.bind(this);
  }

  editComponent(props) {
    if (this._onlyStrings)
      return this.stringEditComponent(props);

    return this.realEditComponent(props);
  }

  /**
   * parsing strings into real objects
   */
  parse(value) {
    if (value === '')
      return undefined;
    try {
      return JSON.parse(value);
    } catch (e) {
      return null; // null is invalid
    }
  }

  /**
   * unparsing real objects into strings
   */
  unparse(value) {
    return typeof(value) === "string" ? value : JSON.stringify(value);
  }

  /**
   * Get Data type key
   */
  getKey() {
    return this.key;
  }

  /**
   * Get data type label
   */
  getLabel() {
    return this.label;
  }

  /**
   * Abstract validation : validation for simple types
   */
  _validate(value) {
    return value === undefined || typeof value === this.key;
  }

  /**
   * Abstract validation : validation for simple types
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
   * @private Real object editor
   */
  realEditComponent(props) {
    return <StringEdit dataType={this} { ...props } />;
  }

  /**
   * @private String editor
   */
  stringEditComponent = (props) => {
    return <CodeEdit dataType={this} { ...props } />;
  };
}

export default AbstractDataType;
