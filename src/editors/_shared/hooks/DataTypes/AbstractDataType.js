import React from "react";
import _toString from "lodash/toString";
import { TextField, Typography } from "@material-ui/core";
import { MonacoCodeEditor } from "@mov-ai/mov-fe-lib-code-editor";
import { DATA_TYPES } from "../../../../utils/Constants";

const identity = a => a;

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

  constructor({ theme, onlyStrings }) {
    // Set hooks to be used in abstract renders
    this._theme = theme;
    this.onlyStrings = onlyStrings;
    this.parsing = onlyStrings
      ? { parse: identity, unparse: identity } : {
        parse: this.parse.bind(this),
        unparse: this.unparse.bind(this)
      };
    this.getSaveable = onlyStrings ? this.unparse.bind(this) : identity;
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

  // ensure a parsed value. runs only for validation
  getParsed(value) {
    return this.onlyStrings ? this.parse(value) : value;
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

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Expose lodash toString method
   * @param {*} value
   * @returns {string} String value
   */
  toString(value) {
    return this.parsing.unparse(value);
  }

  /**
   * @private Check if value is already parsed, or if it still needs to be parsed to return
   * @param {*} value : Value to be parsed
   * @returns parsed value
   */
  getParsedValue(value) {
    return this.parsing.parse(value);
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
  stringEditComponent(props, parsedValue) {
    const value = (parsedValue !== undefined ? parsedValue : props.rowData.value) ?? "";

    return (
      <TextField
        inputProps={{ "data-testid": "input_value" }}
        fullWidth
        type={this.inputType}
        placeholder={this.getDefault()}
        defaultValue={this.parsing.unparse(value)}
        disabled={props.disabled}
        onChange={evt => props.onChange(this.parsing.parse(evt.target.value))}
      ></TextField>
    );
  }

  /**
   * @private Render code editor
   * @param {{rowData: {value: string}}, onChange: function, isNew: boolean} props : input props
   * @returns {ReactComponent} Code Editor Component
   */
  codeEditComponent = (props) => {
    return (
      <Typography
        data-testid="section_data-type-code-editor"
        component="div"
        style={{ height: "100px", width: "100%" }}
      >
        <MonacoCodeEditor
          value={this.parsing.unparse(props.rowData.value)}
          onLoad={editor => {
            if (!props.isNew) editor.focus();
            props.onLoadEditor && props.onLoadEditor(editor);
          }}
          language="python"
          disableMinimap={true}
          theme={this._theme?.codeEditor?.theme ?? "dark"}
          options={{ readOnly: props.disabled }}
          onChange={value => props.onChange(this.parsing.parse(value))}
        />
      </Typography>
    );
  };
}

export default AbstractDataType;
