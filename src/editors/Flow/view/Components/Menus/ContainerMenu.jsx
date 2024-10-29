import React, { useCallback, useEffect, useState } from "react";
import { i18n } from "@mov-ai/mov-fe-lib-react";
import PropTypes from "prop-types";
import {
  BaseCollapse,
  Divider,
  ListItem,
  ListItemText,
} from "@mov-ai/mov-fe-lib-react";
import { ExpandLessIcon, ExpandMoreIcon } from "@mov-ai/mov-fe-lib-react";
import {
  DATA_TYPES,
  PLUGINS,
  TABLE_KEYS_NAMES,
  DIALOG_TITLE,
  DEFAULT_VALUE,
} from "../../../../../utils/Constants";
import ParameterEditorDialog from "../../../../_shared/KeyValueTable/ParametersEditorDialog";
import KeyValuesSection from "./sub-components/collapsibleSections/KeyValuesSection";
import MenuDetails from "./sub-components/MenuDetails";

const ContainerMenu = (props) => {
  // Props
  const { nodeInst, call, openDoc, flowModel, editable } = props;
  // State hooks
  const [templateData, setTemplateData] = useState({});
  const [flowData, setFlowData] = useState({});
  const [expanded, setExpanded] = useState(false);
  const data = nodeInst.data;

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * @private Get the node instance item
   * @param {string} id : Node instance Item Id
   * @returns {NodeInstance}
   */
  const getFlowData = useCallback(async () => {
    const containerInstance = flowModel.current.getSubFlowItem(data.name);
    if (containerInstance) {
      return containerInstance;
    }

    const subFlowInst = await call(
      PLUGINS.DOC_MANAGER.NAME,
      PLUGINS.DOC_MANAGER.CALL.READ,
      {
        scope: "Flow",
        name: nodeInst.parent.data.ContainerFlow,
      },
    );

    return subFlowInst.getSubFlowItem(data.name);
  }, [data.name, nodeInst, flowModel, call]);

  const setFlowDataInst = (containerInstance) => {
    setFlowData(containerInstance.serialize());
  };

  /**
   * @param {Object} formData : Data to Save
   */
  const handleSubmitParameter = useCallback(
    async (formData) => {
      const varName = formData.varName;
      const containerInstance = await getFlowData();

      if (containerInstance.getKeyValue(varName, formData.name)) {
        if (formData.value === DEFAULT_VALUE) {
          containerInstance.deleteKeyValue(varName, formData.name);
        } else {
          containerInstance.updateKeyValueItem(varName, formData);
        }
      } else {
        containerInstance.addKeyValue(varName, formData);
      }
      setFlowDataInst(containerInstance);
    },
    [getFlowData],
  );

  /**
   * @private Handle Delete invalid parameters
   * @param {string} paramName : Parameter name
   * @param {string} varName : keyValue type (parameters, envVars or cmdLine)
   */
  const handleDeleteParameter = useCallback(
    async (paramName, varName) => {
      const containerInstance = await getFlowData();
      containerInstance.deleteKeyValue(varName, paramName);
      setFlowDataInst(containerInstance);
    },
    [getFlowData],
  );

  //========================================================================================
  /*                                                                                      *
   *                                     Handle Events                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Toggle expanded state of Parameter collapsible section
   */
  const toggleExpanded = useCallback(() => {
    setExpanded((prevState) => !prevState);
  }, []);

  /**
   * Open dialog to edit/add new Parameter
   * @param {string} dataId : Unique identifier of item (undefined when not created yet)
   * @param {string} varName : keyValue type (parameters, envVars or cmdLine)
   * @param {boolean} viewOnly : Disable all inputs if True
   */
  const handleKeyValueDialog = useCallback(
    (keyValueData, varName, viewOnly) => {
      const paramType = i18n.t(DIALOG_TITLE[varName.toUpperCase()]);
      const obj = {
        ...keyValueData,
        varName: varName,
        type: keyValueData.type ?? DATA_TYPES.ANY,
        name: keyValueData.key,
        paramType,
      };

      const args = {
        onSubmit: handleSubmitParameter,
        title: i18n.t("EditParamType", { paramType }),
        data: obj,
        showDefault: !viewOnly,
        showValueOptions: true,
        showDescription: !viewOnly,
        disableName: true,
        disableType: true,
        disableDescription: true,
        preventRenderType: varName !== TABLE_KEYS_NAMES.PARAMETERS,
        disabled: viewOnly,
        call,
      };

      call(
        PLUGINS.DIALOG.NAME,
        PLUGINS.DIALOG.CALL.CUSTOM_DIALOG,
        args,
        ParameterEditorDialog,
      );
    },
    [call, handleSubmitParameter],
  );

  /**
   * Show confirmation dialog before deleting parameter
   * @param {{key: string}} item : Object containing a key holding the param name
   * @param {string} varName : keyValue type (parameters, envVars or cmdLine)
   */
  const handleKeyValueDelete = useCallback(
    (item, varName) => {
      const paramName = item.key;
      call(PLUGINS.DIALOG.NAME, PLUGINS.DIALOG.CALL.CONFIRMATION, {
        submitText: i18n.t("Delete"),
        title: i18n.t("DeleteDocConfirmationTitle"),
        onSubmit: () => handleDeleteParameter(paramName, varName),
        message: i18n.t("DeleteKeyConfirmationMessage", { key: paramName }),
      });
    },
    [call, handleDeleteParameter],
  );

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  // Component Did Mount
  useEffect(() => {
    // Get node data
    const fetchData = async () => {
      // get the data from the api
      const containerInstance = await getFlowData();

      // set state with the result
      setFlowDataInst(containerInstance);
    };

    fetchData();
  }, [getFlowData]);

  useEffect(() => {
    const name = data?.ContainerFlow;
    if (!name) return;
    // Read node template
    call(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.CALL.READ, {
      name,
      scope: data.model,
    }).then((doc) => {
      setTemplateData(doc.serialize());
    });
  }, [data, call]);

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <div data-testid="section_flow-container-menu">
      <MenuDetails
        id={data.id}
        name={data.name}
        model={data.model}
        template={data.ContainerFlow}
        label="TemplateName-Colon"
        type={"Sub-Flow"}
        openDoc={openDoc}
      />
      {/* =========================== PARAMETERS =========================== */}
      <ListItem
        data-testid="input_toggle-expanded-parameters"
        button
        onClick={toggleExpanded}
      >
        <ListItemText primary={i18n.t("Parameters")} />
        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </ListItem>
      <BaseCollapse in={expanded} unmountOnExit>
        <KeyValuesSection
          editable={editable}
          varName={TABLE_KEYS_NAMES.PARAMETERS}
          instanceValues={flowData[TABLE_KEYS_NAMES.PARAMETERS] || {}}
          templateValues={templateData.parameters}
          handleTableKeyEdit={handleKeyValueDialog}
          handleTableKeyDelete={handleKeyValueDelete}
        />
        <Divider />
      </BaseCollapse>
    </div>
  );
};

ContainerMenu.propTypes = {
  flowModel: PropTypes.object.isRequired,
  call: PropTypes.func.isRequired,
  openDoc: PropTypes.func.isRequired,
  nodeInst: PropTypes.object.isRequired,
  editable: PropTypes.bool,
};

ContainerMenu.defaultProps = {
  editable: false,
};

export default ContainerMenu;
