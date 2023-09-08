import { IconButton, Typography } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import CloseIcon from "@material-ui/icons/Close";
import PropTypes from "prop-types";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { withTheme } from "@mov-ai/mov-fe-lib-react";
import ApplicationTheme from "../../../../themes";
import { defaultFunction } from "../../../../utils/Utils";

import { appDialogStyles, appDialogTitleStyles } from "./styles";

/**
 * Custom Dialog Title : Render close icon button
 * @param {*} props : Component props
 * @returns {ReactComponent} DialogTitle Component
 */
export const DialogTitle = props => {
  const {
    children,
    onClose,
    hasCloseButton,
    testId = "section_dialog-title"
  } = props;
  const classes = appDialogTitleStyles();
  return (
    <MuiDialogTitle
      data-testid={testId}
      disableTypography
      className={classes.root}
    >
      <Typography variant="h6">{children}</Typography>
      {hasCloseButton ? (
        <IconButton
          data-testid="input_close"
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
};

/**
 * App Dialog wrapper
 * @param {*} props
 * @returns {ReactComponent} AppDialog component wrapper
 */
const AppDialog = props => {
  const { t } = useTranslation();
  const {
    allowSubmit = true,
    actions,
    onSubmit,
    onClose,
    closeOnBackdrop = true,
    title = t("DefaultDialogTitle"),
    submitText = t("Submit"),
    testId = "section_app-dialog"
  } = props;
  const [open, setOpen] = useState(true);
  const classes = appDialogStyles();

  /**
   * Handle Dialog close
   */
  const handleClose = useCallback(
    (_, reason) => {
      if (!closeOnBackdrop && reason === "backdropClick") return;
      setOpen(false);
      onClose();
    },
    [setOpen, onClose]
  );

  /**
   * Handle Dialog Submit and close
   */
  const handleSubmit = () => {
    if (!allowSubmit) return;

    onSubmit && onSubmit();
    handleClose();
  };

  const handleKeyUp = event => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  const getDefaultActions = () => {
    return (
      <DialogActions data-testid="section_dialog-actions">
        <Button data-testid="input_close" onClick={handleClose} color="default">
          {onSubmit ? t("Cancel") : t("Ok")}
        </Button>
        {onSubmit && (
          <Button
            data-testid="input_confirm"
            onClick={handleSubmit}
            color="primary"
          >
            {submitText}
          </Button>
        )}
      </DialogActions>
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} onKeyUp={handleKeyUp}>
      <div data-testid={testId}>
        <DialogTitle onClose={handleClose} {...props}>
          {title}
        </DialogTitle>
        <DialogContent dividers className={classes.dialogContent}>
          {props.children}
        </DialogContent>
        {actions ?? getDefaultActions()}
      </div>
    </Dialog>
  );
};

AppDialog.propTypes = {
  title: PropTypes.string,
  submitText: PropTypes.string,
  onSubmit: PropTypes.func,
  onClose: PropTypes.func,
  actions: PropTypes.element,
  hasCloseButton: PropTypes.bool,
  closeOnBackdrop: PropTypes.bool
};

AppDialog.defaultProps = {
  onClose: () => defaultFunction("onClose"),
  hasCloseButton: true,
  closeOnBackdrop: false
};

export default withTheme(AppDialog, ApplicationTheme);
