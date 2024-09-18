import React, { useState, useEffect, useMemo, useCallback } from "react";
import _toString from "lodash/toString";
import { TextField, Typography } from "@material-ui/core";
import { MonacoCodeEditor } from "@mov-ai/mov-fe-lib-code-editor";
import { DATA_TYPES } from "../../../../utils/Constants";

const identity = a => a;

export function useEdit(props) {
  const {
    defaultValue,
    parse,
    unparse,
    onChange: innerOnChange,
    setInitial = true,
    ...rest
  } = props;

  const initialValue = useMemo(() => unparse(defaultValue), [defaultValue]);
  const [value, setValue] = useState(initialValue);

  const changeValue = useCallback((newValue) => {
    innerOnChange(parse(newValue));
  }, [innerOnChange]);

  useEffect(() => {
    if (setInitial)
      changeValue(initialValue);
    setValue(initialValue);
  }, [initialValue, changeValue, setInitial]);

  const onChange = useCallback((value) => {
    changeValue(value);
    setValue(value);
  }, [changeValue, setValue]); 

  return {
    ...rest,
    onChange,
    value,
  };
}

function StringEdit(props) {
  const { onChange, ...rest } = useEdit(props);

  return (<TextField
    inputProps={{ "data-testid": "input_value" }}
    fullWidth
    onChange={evt => onChange(evt.target.value)}
    { ...rest }
  />);
}

function CodeEdit(props) {
  const { disabled, isNew, onLoadEditor, ...rest } = useEdit({
    ...props,
    setInitial: false,
  });

  return (<Typography
    data-testid="section_data-type-code-editor"
    component="div"
    style={{ height: "100px", width: "100%" }}
  >
    <MonacoCodeEditor
      onLoad={editor => {
        if (!isNew) editor.focus();
        onLoadEditor && onLoadEditor(editor);
      }}
      language="python"
      disableMinimap={true}
      options={{ readOnly: disabled }}
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

  constructor({ theme, onlyStrings, reverse }) {
    // Set hooks to be used in abstract renders
    this._theme = theme;

    this.parsing = (onlyStrings ? !reverse : reverse)
      ? { parse: identity, unparse: identity } : {
        parse: this.parse.bind(this),
        unparse: this.unparse.bind(this)
      };

    // validation occurs on real objects
    this.getParsed = onlyStrings
      ? this.parse.bind(this)
      : identity;

    // might save strings or real objects
    this.getSaveable = onlyStrings
      ? this.unparse.bind(this)
      : identity;

  }

  // parsing strings into real objects
  parse(value) {
    try {
      return JSON.parse(value);
    } catch (e) {
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
   * Get data type edit component
   * @returns
   */
  getEditComponent() {
    return (...args) => this.editComponent(...args);
  }

  /**
   * Abstract validation : validation for simple types
   * @returns
   */
  _validate(value) {
    return typeof value === this.key;
  }

  /**
   * Abstract validation : validation for simple types
   * @returns
   */
  validate(value) {
    try {
      const parsed = this.getParsed(value);
      return Promise.resolve({
        success: this._validate(parsed),
        parsed,
      });
    } catch (_e) {
      return Promise.resolve({ success: false });
    }
  }

  /**
   * Get Default data type value
   * @param {*} options
   * @returns {any} Default value
   */
  getDefault(options) {
    return this.parsing.unparse(this.default);
  }

  /**
   *
   * @param {*} props
   * @param {*} mode
   * @returns
   */
  editComponent(props, mode = "row") {
    const editor = {
      row: _props => this.stringEditComponent(_props, undefined),
      dialog: _props => this.codeEditComponent(_props)
    };
    return editor[mode](props);
  }

  /**
   * @private Gets common text editor for regular inputs (strings, arrays, objects, any, default)
   * @param {*} props : Material table row props
   * @param {*} parsedValue : Parsed value (can be a string, array, or object)
   * @returns {ReactComponent} Text input for editing common strings
   */
  stringEditComponent(props) {
    const { rowData, ...rest } = props;
    return (
      <StringEdit
        type={this.inputType}
        placeholder={this.parsing.unparse(this.default)}
        defaultValue={rowData.value}
        parse={this.parsing.parse}
        unparse={this.parsing.unparse}
        { ...rest }
      />
    );
  }

  /**
   * @private Render code editor
   * @param {{rowData: {value: string}}, onChange: function, isNew: boolean} props : input props
   * @returns {ReactComponent} Code Editor Component
   */
  codeEditComponent = (props) => {
    const { rowData, ...rest } = props;
    return (<CodeEdit
      defaultValue={rowData.value}
      parse={this.parsing.parse}
      unparse={this.parsing.unparse}
      placeholder={this.parsing.unparse(this.default)}
      theme={this._theme?.codeEditor?.theme ?? "dark"}
      { ...rest }
    />);
  };
}

export default AbstractDataType;
