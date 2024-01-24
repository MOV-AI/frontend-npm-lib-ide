import React from "react";
import { t } from "../../../i18n/i18n";
import { LinearProgress } from "@material-ui/core";
import loader from "../../../Branding/movai-logo-transparent.png";

import { loaderStyles } from "./styles";

const Loader = _props => {
  // Style hook
  const classes = loaderStyles();
  // Render
  return (
    <div className={classes.root}>
      <div id="loader" className={classes.loaderContainer}>
        <div className={classes.loaderImage}>
          <img src={loader} alt={t("Loading")} width={200}></img>
          <LinearProgress
            color="secondary"
            className={classes.linearProgress}
          />
        </div>
      </div>
    </div>
  );
};

export default Loader;
