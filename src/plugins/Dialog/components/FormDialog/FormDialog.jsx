import React, { useCallback, useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContentText from "@material-ui/core/DialogContentText";
import { CircularProgress } from "@material-ui/core";
import { withTheme } from "@mov-ai/mov-fe-lib-react";
import ApplicationTheme from "../../../../themes";
import AppDialog from "../AppDialog/AppDialog";

import { appDialogStyles } from "./styles";

const DEFAULT_VALIDATION = () => ({ result: true, error: "" });

const FormDialog = props => {
  // Translation hook
  const { t } = useTranslation();
  // Props
  const {
    size,
    onClose,
    title,
    message,
    onSubmit,
    onPostValidation,
    placeholder,
    multiline,
    loadingMessage,
    defaultValue,
    maxLength,
    closeOnBackdrop,
    onValidation = DEFAULT_VALIDATION,
    inputLabel = t("Name"),
    submitText = t("Submit")
  } = props;
  // State hook
  const [open, setOpen] = useState(true);
  const [isLoading, setLoading] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [validation, setValidation] = useState({
    error: false,
    message: ""
  });
  // Style hook
  const classes = appDialogStyles();
  // Ref
  const inputRef = useRef();

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  // Trigger input focus in first render
  useEffect(() => {
    validateValue(defaultValue);
    setTimeout(() => {
      inputRef.current?.querySelector("input")?.focus();
    });
  }, [defaultValue, validateValue]);

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Validate value
   * @param {String} _value : New value
   * @returns {ValidationResult}
   */
  const validateValue = useCallback(
    _value => {
      const res = onValidation(_value);
      // Set state
      setValidation({ error: !res.result, message: res.error });
      setValue(_value);
      if (onPostValidation && res.result) {
        onPostValidation(_value).then(result => {
          setValidation(result);
        });
      }
      // Return validation result
      return res;
    },
    [onPostValidation, onValidation]
  );

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

  /**
   * Handle dialog close
   * @param {Event} closeEvent : Close Event
   * @param {String} reason : close reason
   * @returns
   */
  const handleClose = (_closeEvent, reason) => {
    if (reason === "backdropClick") return;
    setOpen(false);
    if (onClose) onClose();
  };

  /**
   * Handle form submit
   */
  const handleSubmit = () => {
    const _validation = validateValue(value);
    if (_validation.error) return;
    const result = onSubmit(value);
    if (result instanceof Promise) {
      setLoading(true);
      result.then(() => {
        setLoading(false);
        handleClose();
      });
    } else handleClose();
  };

  /**
   * Handle the onChange event of Textfield
   * @param {event} evt
   */
  const handleOnChange = evt => {
    validateValue(evt.target.value);
  };

  /**
   * Handle paste on Textfield
   * @param {event} event : event to be captured
   * @returns {ValidationResult}
   */
  const handlePaste = event => {
    event.preventDefault();
    // Get current value and current cursor position
    const oldValue = event.target.value;
    const position = event.target.selectionStart;
    // Trim pasted text
    const pastedText = event.clipboardData
      .getData("text/plain")
      .trim()
      .replace(/(\r\n|\n|\r)/gm, "");
    // Set new value
    const newValue = [
      oldValue?.slice(0, position),
      pastedText,
      oldValue?.slice(position)
    ].join("");
    // Validate pasted text
    validateValue(newValue);
    // Set text in input field
    event.target.value = newValue;
  };

  return (
    <AppDialog
      open={open}
      maxWidth={size}
      fullWidth={!!size}
      onClose={handleClose}
      onSubmit={handleSubmit}
      allowSubmit={!validation.error}
      closeOnBackdrop={closeOnBackdrop}
      title={loadingMessage && isLoading ? loadingMessage : title}
      actions={
        <DialogActions data-testid="section_dialog-actions">
          <Button
            data-testid="input_close"
            onClick={handleClose}
            color="secondary"
          >
            {t("Cancel")}
          </Button>
          <Button
            data-testid="input_confirm"
            onClick={handleSubmit}
            disabled={validation.error}
            color="primary"
          >
            {submitText}
          </Button>
        </DialogActions>
      }
    >
      <div data-testid="section_form-dialog">
        {message && <DialogContentText>{message}</DialogContentText>}
        {isLoading ? (
          <div className={classes.loadingContainer}>
            <CircularProgress />
          </div>
        ) : (
          <TextField
            ref={inputRef}
            autoFocus={true}
            error={validation.error}
            helperText={validation.message}
            className={classes.textfield}
            label={t(inputLabel)}
            InputLabelProps={{ shrink: true }}
            defaultValue={value}
            placeholder={placeholder}
            multiline={multiline}
            onPaste={handlePaste}
            onChange={handleOnChange}
            inputProps={{
              "data-testid": "input_value",
              maxLength: multiline ? "" : maxLength
            }} // limit of characters here
            margin="normal"
          />
        )}
      </div>
    </AppDialog>
  );
};

FormDialog.propTypes = {
  onValidation: PropTypes.func,
  onPostValidation: PropTypes.func,
  inputLabel: PropTypes.string,
  submitText: PropTypes.string,
  placeholder: PropTypes.string,
  defaultValue: PropTypes.string,
  maxLength: PropTypes.number,
  multiline: PropTypes.bool,
  size: PropTypes.string
};

FormDialog.defaultProps = {
  onValidation: () => ({ result: true, error: "" }),
  defaultValue: "",
  multiline: false,
  maxLength: 40
};

export default withTheme(FormDialog, ApplicationTheme);
