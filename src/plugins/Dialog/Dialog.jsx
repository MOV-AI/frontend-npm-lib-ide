import React, { useEffect, useMemo, useCallback } from "react";
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
import { easySub, useSub } from "./../../utils/noremix";
import formJson from "./../../utils/form";

const dialogSub = easySub({});

export
const dialogSet = dialogSub.easyEmit();

export
const dialogOpen = function (newDialog) {
  const oldState = dialogSub.data.value;
  const newState = { ...newDialog, open: true };

  dialogSub.update(oldState.open ? {
      ...oldState,
      next: (oldState.next ?? []).concat(newState),
  } : newState);
};

export
const dialogClose = function () {
  const current = dialogSub.data.value;

  dialogSub.update(current.next?.length ? {
    ...current.next[0],
    open: true,
    next: current.next.splice(1),
  } : {
    ...current,
    open: false,
  });
};

export function dialog(newDialog) {
  return new Promise(resolve => dialogOpen({
    ...newDialog,
    resolve,
  }));
}

export
function Dialog() {
  const data = useSub(dialogSub);
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
    key = "",
    showForm = true,
    form,
    children,
    Dialog,
    resolve,
    ...rest
  } = data;

  const reform = useMemo(
    () => message ? (form ?? {}) : (form ?? { name: { label: "Name", placeholder: "Name" } }),
    [message, form]
  );

  const handleClose = useCallback((_, reason) => {
    if (!closeOnBackdrop && reason === "backdropClick") return;
    dialogClose();
    onClose();
    if (_)
      resolve([null, null]);
  }, [closeOnBackdrop, onClose, resolve]);

  const submit = useCallback(async (json, key) => {
    const errors = await onValidation(json);
    const current = dialogSub.data.value;

    if (Object.values(errors ?? {}).reduce((a, b) => a.concat(b), []).length) {
      dialogSet({
        ...current,
        form: Object.entries(reform).reduce((a, [key, value]) => Object.assign(a, {
          [key]: {
            ...value,
            errors: errors[key] ?? [],
          },
        }), {}),
      });
      return;
    }

    onSubmit(json, key, rest);
    resolve([json, key]);
    handleClose();
  }, [handleClose, onSubmit, reform, resolve, rest]);

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

  const actionsEl = useMemo(() => actions ? Object.entries(actions).map(([key, action]) => (
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
  </>), [actions, handleSubmit, handleClose, onSubmit, submitText]);

  const childrenEl = useMemo(() => Component ? <Component { ...data } /> : (<>
    { message && (
      <Typography className="styles-horizontal">
        <input autoFocus type="checkbox" name="dummy" style={{ position: "absolute", opacity: 0 }}></input>
        { showAlertIcon && <WarningIcon fontSize={"large"} /> }
        { message }
      </Typography>
    ) }

    { Object.entries(reform).map(([key, { label = "Value", placeholder = "", multiline, maxLength, errors = [], defaultValue = data[key] ?? "", ...rest }], index) => (
      <TextField
        autoFocus={index === 0} key={key + "-" + defaultValue} name={key} error={errors.length !== 0}
        helperText={errors}
        label={label}
        InputLabelProps={{ shrink: true }}
        defaultValue={defaultValue ?? data[key]}
        placeholder={placeholder}
        multiline={multiline}
        inputProps={{
          "data-testid": "input_" + key,
          maxLength: multiline ? "" : maxLength,
        }} // limit of characters here
        { ...rest }
      />
    )) }
  </>), [Component, showAlertIcon, message, reform, data]);

  if (Dialog)
    return (<Dialog
      onClose={handleClose}
      handleSubmit={handleSubmit}
      form={reform}
      actionsEl={actionsEl}
      { ...data }
    >
      { childrenEl }
    </Dialog>);

  return (<BaseDialog key={key} open={open} onClose={handleClose}>
    <form onSubmit={handleSubmit} style={{ position: "relative" }}>
      <DialogTitle disableTypography>
        <Typography variant="h6">{ title }</Typography>
        { data.hasCloseButton ? (
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
