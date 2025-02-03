import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { i18n } from "@mov-ai/mov-fe-lib-react";
import { Features } from "@mov-ai/mov-fe-lib-core";
import { Typography } from "@mov-ai/mov-fe-lib-react";
import { InfoIcon } from "@mov-ai/mov-fe-lib-react";
import Model from "../model/Node";
import CallbackModel from "../../Callback/model/Callback";
import { usePluginMethods } from "../../../engine/ReactPlugin/ViewReactPlugin";
import { withEditorPlugin } from "../../../engine/ReactPlugin/EditorReactPlugin";
import { drawerSub } from "../../../plugins/hosts/DrawerPanel/DrawerPanel";
import {
  DEFAULT_KEY_VALUE_DATA,
  TABLE_KEYS_NAMES,
  DIALOG_TITLE,
  DATA_TYPES,
  ROS_VALID_NAMES,
  ROS_VALID_NAMES_VARIATION,
  PLUGINS,
  SCOPES,
  ALERT_SEVERITIES,
} from "../../../utils/Constants";
import { ERROR_MESSAGES } from "../../../utils/Messages";
import ParameterEditorDialog from "../../_shared/KeyValueTable/ParametersEditorDialog";
import KeyValueTable from "../../_shared/KeyValueTable/KeyValueTable";
import useDataSubscriber from "../../../plugins/DocManager/useDataSubscriber";
import Description from "./components/Description/Description";
import ExecutionParameters from "./components/ExecutionParameters/ExecutionParameters";
import ParametersTable from "./components/ParametersTable/ParametersTable";
import IOConfig from "./components/IOConfig/IOConfig";
import useKeyValueMethods from "./components/hooks/useKeyValueMethods";
import Menu from "./Menu";

import { nodeStyles } from "./styles";

export const Node = (props, ref) => {
  const { id, name, call, alert, instance, editable = true } = props;

  // Hooks
  const [protectedCallbacks, setProtectedCallbacks] = useState([]);
  const classes = nodeStyles();
  const { getColumns } = useKeyValueMethods();
  const { data } = useDataSubscriber({
    instance,
    propsData: props.data,
    keysToDisconsider: Model.KEYS_TO_DISCONSIDER,
  });
  const defaultColumns = getColumns();

  //========================================================================================
  /*                                                                                      *
   *                                      Validation                                      *
   *                                                                                      */
  //========================================================================================

  /**
   * @summary: Validate document name against invalid characters. It accept ROS valid names
   * and can't accept two consecutive underscores.
   * @param {string} paramName : name of the document
   * @param {string} type : one of options "port" or "keyValue"
   * @param {object} previousData : Previous data row
   * @returns {object} {result: <boolean>, error: <string>}
   **/
  const validateName = useCallback(
    (paramName, type) => {
      const typeName = DIALOG_TITLE[type.toUpperCase()] ?? type;
      const newName = paramName.name ?? paramName;
      const re = type === "ports" ? ROS_VALID_NAMES : ROS_VALID_NAMES_VARIATION;
      try {
        if (!paramName)
          throw new Error(
            i18n.t(ERROR_MESSAGES.TYPE_NAME_IS_MANDATORY, { typeName }),
          );
        else if (!re.test(newName)) {
          throw new Error(
            i18n.t(ERROR_MESSAGES.INVALID_TYPE_NAME, { typeName }),
          );
        }
      } catch (error) {
        return { result: false, error: error.message };
      }
      return { result: true, error: "" };
    },
    [data],
  );

  //========================================================================================
  /*                                                                                      *
   *                                 Document Functions                                   *
   *                                                                                      */
  //========================================================================================

  const updateDescription = useCallback((value) => {
    if (instance.current) instance.current.setDescription(value);
  }, []);

  const updateExecutionParams = useCallback((param, value) => {
    if (instance.current) instance.current.setExecutionParameter(param, value);
  }, []);

  const updatePath = useCallback((value) => {
    if (instance.current) instance.current.setPath(value);
  }, []);

  const setPort = useCallback((value, resolve, reject, previousData) => {
    try {
      if (!instance.current) throw new Error("NoInstance");

      // Trim name
      value.name = value.name.trim();

      // Validate port name
      const validation = validateName(value.name, "ports", previousData);
      if (!validation.result) {
        throw new Error(validation.error);
      }

      // Check for transport/package/message
      if (!value.template)
        throw new Error(i18n.t(ERROR_MESSAGES.NO_TRANSPORT_PROTOCOL_CHOSEN));
      else if (!value.msgPackage)
        throw new Error(ERROR_MESSAGES.NO_PACKAGE_CHOSEN);
      else if (!value.message)
        throw new Error(ERROR_MESSAGES.NO_MESSAGE_CHOSEN);

      if (previousData?.template === value.template) {
        instance.current.updatePort(previousData.name, value);
        return resolve();
      } else instance.current.deletePort(value.id);

      const dataToSave = { [value.name]: value };
      instance.current.setPort(dataToSave);
      resolve();
    } catch (err) {
      // Show alert
      alert({ message: err.message, severity: ALERT_SEVERITIES.ERROR });
      // Reject promise
      reject();
    }
  }, []);

  const deletePort = useCallback((port, resolve) => {
    if (instance.current) instance.current.deletePort(port.name);
    resolve();
  }, []);

  const updatePortCallback = useCallback(
    (ioConfigId, portName, callback) => {
      instance.current.setPortCallback(ioConfigId, portName, callback);
    },
    [instance],
  );

  const updateIOPortInputs = useCallback(
    (target, ioConfigName, direction, ioPortKey, paramName) => {
      // Can be either a checkbox event or a text/number change event
      let value = target.type === "checkbox" ? target.checked : target.value;

      // Make sure if the input is a number, we save a number to Redis
      // TO improve: backend can do this type validation
      if (target.type === "number") {
        value = parseFloat(value);
      }

      instance.current.setPortParameter(
        ioConfigName,
        direction,
        ioPortKey,
        paramName,
        value,
      );
    },
    [],
  );

  const updateKeyValue = useCallback(
    (varName, newData, oldData, isNew) => {
      try {
        const keyName = newData.name;
        const dataToSave = { [keyName]: newData };
        // Validate port name
        const validation = validateName(keyName, varName, oldData.name);
        if (!validation.result) {
          throw new Error(validation.error);
        }
        if (isNew) {
          // update key value
          instance.current?.setKeyValue(varName, dataToSave);
        } else {
          // add key value
          instance.current?.updateKeyValueItem(varName, newData, oldData.name);
        }
      } catch (err) {
        if (err.message)
          alert({ message: err.message, severity: ALERT_SEVERITIES.ERROR });
      }
    },
    [instance, alert, validateName],
  );

  const deleteKeyValue = useCallback(
    (varName, key) => {
      return new Promise((resolve, reject) => {
        instance.current?.deleteKeyValue(varName, key);
        if (instance.current?.getKeyValue(varName, key)) reject();
        else resolve();
      });
    },
    [instance],
  );

  //========================================================================================
  /*                                                                                      *
   *                                   React callbacks                                    *
   *                                                                                      */
  //========================================================================================

  useEffect(() => {
    const details = props.data?.details ?? {};
    const menuName = `${id}-detail-menu`;
    const menuTitle = i18n.t("NodeDetailsMenuTitle");
    // add bookmark
    drawerSub.add(menuName, {
      icon: <InfoIcon></InfoIcon>,
      title: menuTitle,
      suffix: "right",
      url: "global/Node/" + name,
      select: true,
      view: (
        <Menu id={id} name={name} details={details} model={instance}></Menu>
      ),
    });
  }, [id, name, props.data, instance]);

  usePluginMethods(ref, {
    renderRightMenu: () => {},
  });

  //========================================================================================
  /*                                                                                      *
   *                                    Event Handlers                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Open dialog to edit/add new Parameter
   * @param {object} objData : data to construct the object
   * @param {ReactComponent} DialogComponent : Dialog component to render
   */
  const handleOpenEditDialog = useCallback(
    (param, dataId) => {
      const paramType = i18n.t(DIALOG_TITLE[param.toUpperCase()]);
      const isNew = !dataId;
      const objData = data[param][dataId] || DEFAULT_KEY_VALUE_DATA;
      const obj = {
        ...objData,
        varName: param,
        type: objData.type ?? DATA_TYPES.ANY,
        name: objData.key || dataId,
        paramType,
      };
      const args = {
        onSubmit: (formData) => {
          return updateKeyValue(param, formData, obj, isNew);
        },
        nameValidation: (newData) =>
          Promise.resolve(validateName(newData, param, obj.name)),
        title: i18n.t("EditParamType", { paramType }),
        data: obj,
        preventRenderType: param !== TABLE_KEYS_NAMES.PARAMETERS,
        call,
      };

      call(
        PLUGINS.DIALOG.NAME,
        PLUGINS.DIALOG.CALL.CUSTOM_DIALOG,
        args,
        ParameterEditorDialog,
      );
    },
    [data, validateName, updateKeyValue, call],
  );

  /**
   * Create new callback, set it in node port and open editor
   * @param {string} defaultMsg : Callback default message
   * @param {string} ioConfigName : I/O Config Name
   * @param {string} portName : Port name
   */
  const handleNewCallback = useCallback(
    async (defaultMsg, ioConfigName, portName) => {
      const scope = CallbackModel.SCOPE;
      const tempName = "new_callback";
      await call(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.CALL.CREATE, {
        scope,
        name: tempName,
      });
      await call(
        PLUGINS.DOC_MANAGER.NAME,
        PLUGINS.DOC_MANAGER.CALL.SAVE,
        {
          scope,
          name: tempName,
          data: {
            message: defaultMsg,
          },
        },
        (res) => {
          if (res.success) {
            const newTabData = {
              id: `${res.model.workspace}/${scope}/${res.name}`,
              name: res.name,
              scope,
            };
            call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.OPEN_EDITOR, newTabData);
            // Set new callback in Node Port
            updatePortCallback(ioConfigName, portName, res.name);
          }
        },
      );
    },
    [call, updatePortCallback],
  );

  /**
   * Open Callback
   * @param {string} callbackName : Callback name
   */
  const handleOpenCallback = useCallback(
    (callbackName) => {
      // If no callback name is passed -> returns
      if (!callbackName) return;
      // Open existing callback
      const scope = CallbackModel.SCOPE;
      call(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.CALL.READ, {
        scope,
        name: callbackName,
      }).then((doc) => {
        call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.OPEN_EDITOR, {
          id: doc.getUrl(),
          name: doc.getName(),
          scope,
        });
      });
    },
    [call],
  );

  /**
   * Handle Open SelectScopeModal
   * @param {object} modalData : Props to pass to SelectScopeModal
   * @param {string} ioConfigName : I/O Config Name
   * @param {string} portName : Port name
   */
  const handleOpenSelectScopeModal = useCallback(
    (modalData, ioConfigName, portName) => {
      call(PLUGINS.DIALOG.NAME, PLUGINS.DIALOG.CALL.SELECT_SCOPE_MODAL, {
        ...modalData,
        onSubmit: (selectedCallback) => {
          const splitURL = selectedCallback.split("/");
          const callback = splitURL.length > 1 ? splitURL[2] : selectedCallback;
          // Set new callback in Node Port
          updatePortCallback(ioConfigName, portName, callback);
        },
      });
    },
    [call, updatePortCallback],
  );

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  useEffect(() => {
    call(
      PLUGINS.DOC_MANAGER.NAME,
      PLUGINS.DOC_MANAGER.CALL.GET_STORE,
      SCOPES.CALLBACK,
    ).then((store) => {
      setProtectedCallbacks(store.protectedDocs);
    });
  }, [call]);

  //========================================================================================
  /*                                                                                      *
   *                                   Render Functions                                   *
   *                                                                                      */
  //========================================================================================

  return (
    <Typography
      data-testid="section_node-editor"
      component="div"
      className={classes.container}
    >
      <Description
        onChangeDescription={updateDescription}
        editable={editable}
        nodeType={data.type}
        value={data.description}
      ></Description>
      <IOConfig
        {...props}
        editable={editable}
        ioConfig={data.ports}
        protectedCallbacks={protectedCallbacks}
        onIOConfigRowSet={setPort}
        onIOConfigRowDelete={deletePort}
        handleIOPortsInputs={updateIOPortInputs}
        handleOpenSelectScopeModal={handleOpenSelectScopeModal}
        handleOpenCallback={handleOpenCallback}
        handleNewCallback={handleNewCallback}
      />
      <ExecutionParameters
        path={data.path}
        remappable={data.remappable}
        persistent={data.persistent}
        launch={data.launch}
        editable={editable}
        onChangePath={updatePath}
        onChangeExecutionParams={updateExecutionParams}
      />
      <ParametersTable
        editable={editable}
        data={data.parameters}
        defaultColumns={defaultColumns}
        openEditDialog={handleOpenEditDialog}
        onRowDelete={deleteKeyValue}
      ></ParametersTable>
      <KeyValueTable
        testId="section_env-vars"
        title={i18n.t("EnvironmentVariables")}
        editable={editable}
        data={data.envVars}
        columns={defaultColumns}
        openEditDialog={handleOpenEditDialog}
        onRowDelete={deleteKeyValue}
        varName="envVars"
      ></KeyValueTable>
      <KeyValueTable
        testId="section_command-line"
        title={i18n.t("CommandLine")}
        editable={editable}
        data={data.commands}
        columns={defaultColumns}
        openEditDialog={handleOpenEditDialog}
        onRowDelete={deleteKeyValue}
        varName="commands"
      ></KeyValueTable>
      {Features.get("ontainerConfigurations") && (
        <KeyValueTable
          testId="section_container-configuration"
          title={i18n.t("ContainerConfigurations")}
          editable={editable}
          data={data.containerConf}
          columns={defaultColumns}
          openEditDialog={handleOpenEditDialog}
          onRowDelete={deleteKeyValue}
          varName="containerConf"
        ></KeyValueTable>
      )}
    </Typography>
  );
};

Node.scope = "Node";

Node.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  call: PropTypes.func.isRequired,
  data: PropTypes.object,
  instance: PropTypes.object,
  editable: PropTypes.bool,
};

export default withEditorPlugin(Node);
export { Node as NodeComponent };
