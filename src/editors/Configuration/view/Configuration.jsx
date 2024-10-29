import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { i18n } from "@mov-ai/mov-fe-lib-react";
import { MonacoCodeEditor } from "@mov-ai/mov-fe-lib-code-editor";
import {
  AppBar,
  Toolbar,
  ToggleButton,
  ToggleButtonGroup,
} from "@mov-ai/mov-fe-lib-react";
import { InfoIcon } from "@mov-ai/mov-fe-lib-react";
import { useTheme } from "@mov-ai/mov-fe-lib-react";
import Model from "../model/Configuration";
import { defaultFunction } from "../../../utils/Utils";
import { usePluginMethods } from "../../../engine/ReactPlugin/ViewReactPlugin";
import { withEditorPlugin } from "../../../engine/ReactPlugin/EditorReactPlugin";
import useDataSubscriber from "../../../plugins/DocManager/useDataSubscriber";
import { drawerSub } from "../../../plugins/hosts/DrawerPanel/DrawerPanel";
import Menu from "./Menu";

import { configurationStyles } from "./styles";

export const Configuration = (props, ref) => {
  const {
    id,
    name,
    instance,
    saveDocument = () => defaultFunction("saveDocument"),
    editable = true,
  } = props;
  // Other Hooks
  const { data } = useDataSubscriber({
    instance,
    propsData: props.data,
    keysToDisconsider: Model.KEYS_TO_DISCONSIDER,
  });
  // Style Hooks
  const classes = configurationStyles();
  const theme = useTheme();

  //========================================================================================
  /*                                                                                      *
   *                                   React callbacks                                    *
   *                                                                                      */
  //========================================================================================

  const renderRightMenu = useCallback(() => {
    const details = props.data?.details || {};
    const menuName = `detail-menu`;
    const menuTitle = i18n.t("ConfigurationDetailsMenuTitle");
    // add bookmark
    drawerSub.add(menuName, {
      icon: <InfoIcon></InfoIcon>,
      name: menuName,
      suffix: "right",
      url: "global/Configuration/" + name,
      title: menuTitle,
      select: true,
      view: (
        <Menu id={id} name={name} details={details} model={instance}></Menu>
      ),
    });
  }, [id, name, instance, props.data]);

  usePluginMethods(ref, {
    renderRightMenu,
  });

  //========================================================================================
  /*                                                                                      *
   *                                 Document Functions                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Updates the config extension
   * @param {String} value
   */
  const updateConfigExtension = (value) => {
    if (instance.current) instance.current.setExtension(value);
  };

  /**
   * Updates the config code
   * @param {String} value
   * @returns
   */
  const updateConfigCode = (value) => {
    if (value === instance.current.getCode()) return;
    if (instance.current) instance.current.setCode(value);
  };

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

  /**
   * Handle File Type Change
   * @param {*} event
   * @param {String} newExtension
   */
  const handleChangeFileType = (event, newExtension) => {
    event.stopPropagation();
    updateConfigExtension(newExtension);
  };

  /**
   * Should be called when editor loads
   * @param {*} editor
   */
  const onLoadEditor = (editor) => {
    if (!id) editor.focus();
  };

  //========================================================================================
  /*                                                                                      *
   *                                   Render Functions                                   *
   *                                                                                      */
  //========================================================================================

  const renderEditor = () => {
    return (
      <div
        data-testid="section_configuration-editor"
        className={classes.codeContainer}
      >
        <MonacoCodeEditor
          value={data.code}
          language={data.extension}
          theme={theme.codeEditor?.theme}
          options={{ readOnly: !editable }}
          onChange={updateConfigCode}
          onSave={saveDocument}
          onLoad={onLoadEditor}
        />
      </div>
    );
  };

  return (
    <div
      data-testid="section_configuration-editor"
      className={classes.container}
    >
      <AppBar
        data-testid="section_app-bar"
        position="static"
        className={classes.appBar}
      >
        <Toolbar data-testid="input-toolbar" variant="dense">
          <ToggleButtonGroup
            size="small"
            exclusive
            value={data.extension}
            onChange={handleChangeFileType}
          >
            <ToggleButton value="xml">XML</ToggleButton>
            <ToggleButton value="yaml">YAML</ToggleButton>
          </ToggleButtonGroup>
        </Toolbar>
      </AppBar>
      {renderEditor()}
    </div>
  );
};

Configuration.scope = "Configuration";

Configuration.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  instance: PropTypes.object,
  data: PropTypes.object,
  editable: PropTypes.bool,
  saveDocument: PropTypes.func,
};

export default withEditorPlugin(Configuration);
