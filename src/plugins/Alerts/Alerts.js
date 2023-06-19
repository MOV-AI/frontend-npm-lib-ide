import { snackbar } from "@mov-ai/mov-fe-lib-react";
import { ALERT_SEVERITIES } from "../../utils/Constants";
import { dialog } from "../../utils/noremix";
import IDEPlugin from "../../engine/IDEPlugin/IDEPlugin";

class Alerts extends IDEPlugin {
  constructor(profile = {}) {
    // Remove duplicated if needed
    const methods = Array.from(new Set([...(profile.methods ?? []), "show"]));
    super({ ...profile, methods });
  }

  //========================================================================================
  /*                                                                                      *
   *                                     Public Methods                                   *
   *                                                                                      */
  //========================================================================================

  show({
    title,
    message,
    severity = ALERT_SEVERITIES.SUCCESS,
    location = "snackbar"
  }) {
    const alertByLocation = {
      snackbar: () => snackbar({ message, severity }),
      modal: () => dialog({ title, message }),
    };
    // Show Alert
    alertByLocation[location]();
  }
}

export default Alerts;
