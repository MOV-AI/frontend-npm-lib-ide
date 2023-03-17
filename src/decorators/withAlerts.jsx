import React from "react";
import { getRefComponent } from "../utils/Utils";
import { PLUGINS } from "../utils/Constants";

/**
 * Pass snackbar alerts to components
 * @param {*} Component
 * @returns
 */
const withAlerts = Component => {
  const RefComponent = getRefComponent(Component);

  return (props, ref) => {
    // Props
    const { call } = props;

    /**
     * Create snackbar alert
     * @param {{title: String, message: String, location: String, severity: String}} alertData
     */
    const alert = options => {
      call(PLUGINS.ALERT.NAME, PLUGINS.ALERT.CALL.SHOW, options);
    };

    /**
     * Show Confirmation before action
     * @param {{title: string, message: string, submitText: string, onSubmit: function}} confirmationData
     */
    const confirmationAlert = ({
      title,
      message,
      onSubmit,
      onClose,
      submitText
    }) => {
      call(PLUGINS.DIALOG.NAME, PLUGINS.DIALOG.CALL.CONFIRMATION, {
        title,
        message,
        onSubmit,
        onClose,
        submitText
      });
    };

    return (
      <RefComponent
        {...props}
        ref={ref}
        alert={alert}
        confirmationAlert={confirmationAlert}
      />
    );
  };
};

export default withAlerts;
