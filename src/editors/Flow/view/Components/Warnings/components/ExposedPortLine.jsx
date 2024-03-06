import React, { useCallback } from "react";
import { i18n } from "@mov-ai/mov-fe-lib-react";
import PropTypes from "prop-types";
import { Utils } from "@mov-ai/mov-fe-lib-core";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import { PLUGINS } from "../../../../../../utils/Constants";

import { parameterLineStyles } from "../styles";

const ExposedPortLine = props => {
  const { exposedPortInfo, call, closeModal } = props;

  // Style hooks
  const classes = parameterLineStyles();

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
  const buildTooltipTitle = (template, node, params) => {
    return (
      <>
        <strong>{i18n.t("NodeTemplate-Colon")}</strong> {template}
        <br />
        <strong>{i18n.t("NodeInstance-Colon")}</strong> {node}
        <br />
        <strong>{i18n.t("InvalidExposedPorts-Colon")}</strong>
        <ul>
          {params.map(param => (
            <li key={`${node}_${param}`}>{param}</li>
          ))}
        </ul>
      </>
    );
  };

  //========================================================================================
  /*                                                                                      *
   *                                    Public Methods                                    *
   *                                                                                      */
  //========================================================================================

  const handleOpenDocument = useCallback(() => {
    const name = exposedPortInfo.nodeInst.templateName;
    const scope = exposedPortInfo.nodeInst.data.model;
    const id = Utils.buildDocPath({ name, scope });

    closeModal();

    const template = {
      id,
      name,
      scope
    };
    call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.OPEN_EDITOR, template);
  }, [exposedPortInfo, call, closeModal]);

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <Tooltip
      title={buildTooltipTitle(
        exposedPortInfo.nodeInst.templateName,
        exposedPortInfo.nodeInst.data.id,
        exposedPortInfo.invalidPorts
      )}
    >
      <div
        data-testid="section_invalid-parameter"
        className={classes.invalidParameterHolder}
      >
        <div>
          <strong>{exposedPortInfo.nodeInst.data.name}</strong>
          <ul>
            {exposedPortInfo.invalidPorts.map(port => (
              <li key={`${exposedPortInfo.nodeInst.data.id}_${port}`}>
                <strong>{port}</strong>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <Button
            data-testid="input_open-template"
            className={classes.linkButton}
            onClick={handleOpenDocument}
          >
            <Tooltip
              title={i18n.t("CloseModalOpenTemplate", {
                templateName: exposedPortInfo.nodeInst.templateName
              })}
            >
              <strong>{exposedPortInfo.nodeInst.templateName}</strong>
            </Tooltip>
          </Button>
        </div>
      </div>
    </Tooltip>
  );
};

ExposedPortLine.propTypes = {
  exposedPortInfo: PropTypes.object.isRequired,
  call: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired
};

export default ExposedPortLine;
