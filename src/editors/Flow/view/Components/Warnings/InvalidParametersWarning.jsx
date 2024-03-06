import React from "react";
import { i18n } from "@mov-ai/mov-fe-lib-react";
import PropTypes from "prop-types";
import Typography from "@mui/material/Typography";
import ParameterLine from "./components/ParameterLine";

import { invalidParametersWarningStyles } from "./styles";

const InvalidParametersWarning = props => {
  const { invalidContainerParams, call, closeModal } = props;

  // Style hooks
  const classes = invalidParametersWarningStyles();

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <div testid="section_invalid-parameters-warning">
      <p>{i18n.t("InvalidContainersParamMessagePre")}</p>
      <div className={classes.invalidParametersHeader}>
        <Typography variant="h6">{i18n.t("InvalidSubFlowParameters")}</Typography>
        <Typography variant="h6">{i18n.t("FlowTemplate")}</Typography>
      </div>
      <div className={classes.invalidParametersMessageHolder}>
        {invalidContainerParams.map(subFlowInfo => (
          <ParameterLine
            key={subFlowInfo.id}
            call={call}
            closeModal={closeModal}
            subFlowInfo={subFlowInfo}
          />
        ))}
      </div>
      <p className={classes.postMessage}>
        {i18n.t("InvalidContainersParamMessagePost")}
      </p>
    </div>
  );
};

InvalidParametersWarning.propTypes = {
  invalidContainerParams: PropTypes.array.isRequired
};

export default InvalidParametersWarning;
