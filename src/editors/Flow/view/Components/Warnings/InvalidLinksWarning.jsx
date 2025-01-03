import React from "react";
import { i18n } from "@mov-ai/mov-fe-lib-react";
import PropTypes from "prop-types";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";

import { invalidLinksWarningStyles } from "./styles";

const InvalidLinksWarning = (props) => {
  const { invalidLinks } = props;

  // Style hooks
  const classes = invalidLinksWarningStyles();
  // Translation hooks

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Builds the tooltip title
   * @param {String} node
   * @param {String} port
   * @returns {JSX} build title
   */
  const buildTooltipTitle = (node, port) => {
    return (
      <p>
        <strong>{i18n.t("Node-Colon")}</strong> {node}
        <br />
        <strong>{i18n.t("Port-Colon")}</strong> {port}
      </p>
    );
  };

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <div testid="section_invalid-links-warning">
      <div className={classes.invalidLinksHeader}>
        <Typography variant="h6">{i18n.t("SourcePort")}</Typography>
        <Typography variant="h6">{i18n.t("TargetPort")}</Typography>
      </div>
      <div className={classes.invalidLinksMessageHolder}>
        {invalidLinks.map((linkInfo) => (
          <div key={linkInfo.id} className={classes.invalidLinkHolder}>
            <Tooltip
              title={buildTooltipTitle(
                linkInfo.sourceNode,
                linkInfo.sourcePort,
              )}
            >
              <div>
                <p>
                  <strong>{linkInfo.sourceNode}</strong>:
                </p>
                {linkInfo.sourcePort}
              </div>
            </Tooltip>
            <Tooltip
              title={buildTooltipTitle(
                linkInfo.targetNode,
                linkInfo.targetPort,
              )}
            >
              <div>
                <p>
                  <strong>{linkInfo.targetNode}</strong>:
                </p>
                {linkInfo.targetPort}
              </div>
            </Tooltip>
          </div>
        ))}
      </div>
      <p className={classes.fixMessage}>{i18n.t("InvalidLinksFoundMessage")}</p>
    </div>
  );
};

InvalidLinksWarning.propTypes = {
  invalidLinks: PropTypes.array.isRequired,
};

export default InvalidLinksWarning;
