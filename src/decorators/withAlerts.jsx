import React from "react";
import { getRefComponent } from "../utils/Utils";
import { PLUGINS } from "../utils/Constants";
import { dialog } from "../utils/noremix";

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

    return (
      <RefComponent
        {...props}
        ref={ref}
        alert={alert}
        confirmationAlert={dialog}
      />
    );
  };
};

export default withAlerts;
