import React, { useCallback } from "react";
import { i18n } from "@mov-ai/mov-fe-lib-react";
import PropTypes from "prop-types";
import { Utils } from "@mov-ai/mov-fe-lib-core";
import Tooltip from "@material-ui/core/Tooltip";
import Button from "@material-ui/core/Button";
import { SCOPES, PLUGINS } from "../../../../../../utils/Constants";

import { parameterLineStyles } from "../styles";

const ParameterLine = (props) => {
  const { subFlowInfo, call, closeModal } = props;

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
        <strong>{i18n.t("FlowTemplate-Colon")}</strong> {template}
        <br />
        <strong>{i18n.t("SubFlow-Colon")}</strong> {node}
        <br />
        <strong>{i18n.t("Parameters-Colon")}</strong>
        <ul className={classes.paramsList}>
          {params.map((param) => (
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
    const name = subFlowInfo.containerNode.templateName;
    const scope = SCOPES.FLOW;
    const id = Utils.buildDocPath({ name, scope });

    closeModal();

    const template = {
      id,
      name,
      scope,
    };

    call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.OPEN_EDITOR, template);
  }, [subFlowInfo.containerNode.templateName, closeModal, call]);

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <Tooltip
      title={buildTooltipTitle(
        subFlowInfo.containerNode.templateName,
        subFlowInfo.name,
        subFlowInfo.invalidParams,
      )}
    >
      <div
        data-testid="section_invalid-parameter"
        className={classes.invalidParameterHolder}
      >
        <div>
          <strong>{subFlowInfo.name}</strong>
          <ul className={classes.paramsList}>
            {subFlowInfo.invalidParams.map((param) => (
              <li key={`${subFlowInfo.id}_${param}`}>
                <strong>{param}</strong>
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
                templateName: subFlowInfo.containerNode.templateName,
              })}
            >
              <strong>{subFlowInfo.containerNode.templateName}</strong>
            </Tooltip>
          </Button>
        </div>
      </div>
    </Tooltip>
  );
};

ParameterLine.propTypes = {
  subFlowInfo: PropTypes.object.isRequired,
  call: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export default ParameterLine;
