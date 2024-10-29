import React from "react";
import { i18n } from "@mov-ai/mov-fe-lib-react";
import { LinearProgress } from "@mov-ai/mov-fe-lib-react";
import loader from "../../../Branding/movai-logo-transparent.png";

import { loaderStyles } from "./styles";

const Loader = (_props) => {
  // Style hook
  const classes = loaderStyles();
  // Render
  return (
    <div className={classes.root}>
      <div id="loader" className={classes.loaderContainer}>
        <div className={classes.loaderImage}>
          <img src={loader} alt={i18n.t("Loading")} width={200}></img>
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
