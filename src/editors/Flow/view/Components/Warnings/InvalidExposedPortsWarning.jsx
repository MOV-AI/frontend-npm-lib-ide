import React from "react";
import { i18n } from "@mov-ai/mov-fe-lib-react";
import PropTypes from "prop-types";
import ExposedPortLine from "./components/ExposedPortLine";

import { invalidExposedPortsWarningStyles } from "./styles";

const InvalidExposedPortsWarning = props => {
  const { invalidExposedPorts, call, closeModal } = props;

  // Style hooks
  const classes = invalidExposedPortsWarningStyles();

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <div
      className={classes.root}
      data-testid="section_invalid-exposed-ports-warning"
    >
      <p>{i18n.t("InvalidExposedPortsMessagePre")}</p>
      <div className={classes.invalidExposedPortsHeader}>
        <h5>{i18n.t("InvalidExposedPorts")}</h5>
        <h5>{i18n.t("NodeTemplate")}</h5>
      </div>
      <div className={classes.invalidExposedPortsMessageHolder}>
        {invalidExposedPorts.map(exposedPortInfo => (
          <ExposedPortLine
            key={exposedPortInfo.nodeInst.data.id}
            closeModal={closeModal}
            exposedPortInfo={exposedPortInfo}
            call={call}
          />
        ))}
      </div>
      <p className={classes.postMessage}>
        {i18n.t("InvalidExposedPortsMessagePost")}
      </p>
    </div>
  );
};

InvalidExposedPortsWarning.propTypes = {
  invalidExposedPorts: PropTypes.array.isRequired
};

export default InvalidExposedPortsWarning;
