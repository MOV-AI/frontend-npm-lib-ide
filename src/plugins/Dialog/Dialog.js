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
import { withViewPlugin } from "./../../engine/ReactPlugin/ViewReactPlugin";
import { withHostReactPlugin } from "./../../engine/ReactPlugin/HostReactPlugin";
import { subscribe, call, useRemix } from "./../../utils/noremix";
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
    resolve,
    ...rest
  } = dialog;

  const reform = message
    ? (form ?? {})
    : (form ?? { name: { label: "Name", placeholder: "Name" } });

  useRemix(props);

  const dialogOpen = useCallback(newDialog => new Promise(resolve => {
    const newState = { ...newDialog, resolve, open: true };

    if (dialog.open)
      return setDialog({
        ...dialog,
        next: (dialog.next ?? []).concat(newState),
      });

    setDialog(newState);
  }), [setDialog, dialog]);

  useEffect(() => subscribe("dialog", "open", dialogOpen), [dialogOpen]);

  useEffect(() => { ref.current = { open: dialogOpen }; }, [open, dialogOpen]);

  const handleClose = useCallback((_, reason) => {
    if (!closeOnBackdrop && reason === "backdropClick") return;
    setDialog(dialog => dialog.next?.length
      ? ({ ...dialog.next[0], next: dialog.next.slice(1), open: true })
      : ({ ...dialog, open: false }));
    onClose();
    if (_)
      resolve([null, null]);
  }, [closeOnBackdrop, setDialog, onClose, resolve]);

  const submit = useCallback(async (json, key) => {
    const errors = await onValidation(json);
    const errorCount = Object.values(errors ?? {}).reduce((a, b) => a.concat(b), []).length;
    if (errorCount)
      return setDialog(dialog => ({
        ...dialog,
        form: Object.entries(reform).reduce((a, [key, value]) => Object.assign(a, {
          [key]: {
            ...value,
            errors: errors[key] ?? [],
          },
        }), {}),
      }));
    onSubmit(json, key);
    resolve([json, key]);
    handleClose();
  }, [handleClose, onSubmit, setDialog, reform, resolve]);

  const handleSubmit = useCallback((e, key) => {
    e.preventDefault();
    if (!allowSubmit) return;
    const json = formJson(e.target.tagName === "FORM" ? e.target : e.target.form);
    submit(json, key);
  }, [allowSubmit, submit]);

  const onKeyDown = useCallback(e => {
    if (e.key === "Escape")
      handleClose();
  }, [handleClose]);

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  if (Dialog)
    return (<Dialog
      onClose={handleClose}
      handleSubmit={handleSubmit}
      form={reform}
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
        <input autoFocus type="checkbox" name="dummy" style={{ position: "absolute", opacity: 0 }}></input>
        { showAlertIcon && <WarningIcon fontSize={"large"} /> }
        { message }
      </Typography>
    ) }

    { Object.entries(reform).map(([key, { label = "Value", placeholder = "", multiline, maxLength, errors = [], defaultValue = dialog[key] ?? "", ...rest }], index) => (
      <TextField
        autoFocus={index === 0} key={key + "-" + defaultValue} name={key} error={errors.length !== 0}
        helperText={errors}
        label={label}
        InputLabelProps={{ shrink: true }}
        defaultValue={defaultValue}
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
    <form onSubmit={handleSubmit} style={{ position: "relative" }}>
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

export const dialogProfile = {
  name: "dialog",
  location: "dialogHost",
  call: ["open"],
};

export
const OtherDialog = withViewPlugin(OtherDialogBase, dialogProfile.call);

export
const OtherDialogHost = withHostReactPlugin(function (props) {
  const { hostName, viewPlugins } = props;

  return <div id={hostName}>{ viewPlugins }</div>;
});

export
async function dialog(arg) {
  return await call("dialog", "open", arg);
}
