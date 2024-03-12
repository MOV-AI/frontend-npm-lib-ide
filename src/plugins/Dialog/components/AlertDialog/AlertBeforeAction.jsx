import React from "react";
import PropTypes from "prop-types";
import { i18n } from "@mov-ai/mov-fe-lib-react";
import AppDialog from "../AppDialog/AppDialog";
import { WarningIcon }  from "@mov-ai/mov-fe-lib-react";
import { DialogActions, BaseButton, DialogContentText } from "@mov-ai/mov-fe-lib-react";

import { alertBeforeActionStyles } from "./styles";

const AlertBeforeAction = props => {
  const classes = alertBeforeActionStyles();
  const { onSubmit, onClose, actions, message, showAlertIcon, title } = props;

  const handleConfirmation = action => {
    onSubmit(action);
    onClose();
  };

  const getActions = () => {
    return (
      <DialogActions data-testid="section_dialog-actions">
        {Object.keys(actions).map(key => (
          <BaseButton
            data-testid={actions[key].testId ?? "input_confirm"}
            key={key}
            onClick={() => handleConfirmation(key)}
            color="default"
          >
            {i18n.t(actions[key].label)}
          </BaseButton>
        ))}
      </DialogActions>
    );
  };

  return (
    <AppDialog
      testId="section_alert-before-action-dialog"
      hasCloseButton={false}
      title={title}
      onClose={onClose}
      actions={getActions()}
    >
      {showAlertIcon && (
        <WarningIcon fontSize={"large"} className={classes.icon} />
      )}
      <DialogContentText className={classes.message}>
        {message}
      </DialogContentText>
    </AppDialog>
  );
};

AlertBeforeAction.propTypes = {
  message: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  actions: PropTypes.object,
  showAlertIcon: PropTypes.bool,
  onClose: PropTypes.func
};

AlertBeforeAction.defaultProps = {
  message: "",
  actions: {},
  showAlertIcon: true,
  onClose: () => console.log("not implemented")
};

export default AlertBeforeAction;
