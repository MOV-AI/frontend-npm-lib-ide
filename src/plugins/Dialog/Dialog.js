import React, { useState, useEffect, useCallback } from "react";
import i18n from "../../i18n/i18n";
import { IconButton, Typography } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import BaseDialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import CloseIcon from "@material-ui/icons/Close";
import WarningIcon from "@material-ui/icons/Warning";
import { PLUGINS } from "../../utils/Constants";
import { withViewPlugin } from "./../../engine/ReactPlugin/ViewReactPlugin";
import { withHostReactPlugin } from "./../../engine/ReactPlugin/HostReactPlugin";
import { subscribe, useRemix } from "./../../utils/noremix";
import formJson from "./../../utils/form";

function OtherDialogBase(props, ref) {
  const [ dialog, setDialog ] = useState({});
  const {
    onSubmit = () => {},
    onClose = () => {},
    onValidation = () => ({}),
    open = false,
    closeOnBackdrop = true,
    allowSubmit = true,
    showAlertIcon = false,
    actions = false, // can be an object
    submitText = "Submit",
    message,
    Component = null,
    title = "",
    showForm = true,
    form,
    children,
    Dialog,
    ...rest
  } = dialog;

  const reform = message
    ? (form ?? {})
    : (form ?? { name: { label: "Name", placeholder: "Name" } });

  useRemix(props);
  useEffect(() => subscribe(PLUGINS.DIALOG_2.NAME, PLUGINS.DIALOG_2.CALL.OPEN, setDialog), [setDialog]);

  const dialogOpen = useCallback(dialog => setDialog({
    ...dialog,
    open: true,
  }), [setDialog]);

  useEffect(() => { ref.current = { open: dialogOpen }; }, [open]);

  const handleClose = useCallback((_, reason) => {
    if (!closeOnBackdrop && reason === "backdropClick") return;
    setDialog(dialog => ({ ...dialog, open: false }));
    onClose();
  }, [closeOnBackdrop, setDialog, onClose]);

  const submit = useCallback(async (json, key) => {
    const errors = await onValidation(json);
    const errorCount = Object.values(errors).reduce((a, b) => a.concat(b), []).length;
    if (errorCount)
      return setDialog(dialog => ({
        ...dialog,
        form: Object.entries(reform).reduce((a, [key, value]) => Object.assign(a, {
          [key]: {
            ...value,
            errors: errors[key],
          },
        }), {}),
      }));
    onSubmit(json, key);
    handleClose();
  }, [handleClose, onSubmit, setDialog, reform]);

  const handleSubmit = useCallback((e, key) => {
    e.preventDefault();
    if (!allowSubmit) return;
    const json = formJson(e.target.tagName === "FORM" ? e.target : e.target.form);
    submit(json, key);
  }, [allowSubmit, submit]);

  if (Dialog)
    return (<Dialog
      onClose={handleClose}
      { ...dialog }
    />);

  const actionsEl = actions ? Object.entries(actions).map(([key, action]) => (
    <Button data-testid={"action_" + key} onClick={e => handleSubmit(e, key)} color={ action.color ?? "default" }>
      { i18n.t(action.label ?? key) }
    </Button>
  )) : (<>
    <Button data-testid="input_close" onClick={handleClose} color="secondary">
      { onSubmit ? "Cancel" : "Ok" }
    </Button>
    { onSubmit && (
      <Button
        data-testid="input_confirm"
        type="submit"
        color="primary"
      >
        { submitText }
      </Button>
    ) }
  </>);

  const childrenEl = Component ? <Component { ...dialog } /> : (<>
    { message && (
      <Typography className="styles-horizontal">
        { showAlertIcon && <WarningIcon fontSize={"large"} /> }
        { message }
      </Typography>
    ) }

    { Object.entries(reform).map(([key, { label = "Value", placeholder = "", multiline, maxLength, errors = [], defaultValue, ...rest }]) => (
      <TextField
        autoFocus={rest.autoFocus} key={key} name={key} error={errors.length !== 0}
        helperText={errors}
        label={label}
        InputLabelProps={{ shrink: true }}
        defaultValue={defaultValue ?? dialog[key] ?? ""}
        placeholder={placeholder}
        multiline={multiline}
        inputProps={{
          "data-testid": "input_" + key,
          maxLength: multiline ? "" : maxLength,
        }} // limit of characters here
        { ...rest }
      />
    )) }
  </>);

  return (<BaseDialog open={open} onClose={handleClose}>
    <form onSubmit={handleSubmit}>
      <DialogTitle disableTypography>
        <Typography variant="h6">{ title }</Typography>
        { dialog.hasCloseButton ? (
          <IconButton
            data-testid="input_close"
            aria-label="close"
            onClick={onClose}
          >
            <CloseIcon />
          </IconButton>
        ) : null }
      </DialogTitle>
      <DialogContent dividers className="styles-verticalSmall" style={{ minWidth: "450px" }}>
        { childrenEl }
      </DialogContent>
      <DialogActions data-testid="section_dialog-actions">
        { actionsEl }
      </DialogActions>
    </form>
  </BaseDialog>);
}

export
const OtherDialog = withViewPlugin(OtherDialogBase, Object.values(PLUGINS.DIALOG_2.CALL));

export
const OtherDialogHost = withHostReactPlugin(function (props) {
  const { hostName, viewPlugins } = props;

  return <div id={hostName}>{ viewPlugins }</div>;
});
