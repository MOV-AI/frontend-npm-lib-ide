import React, { useCallback, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { i18n } from "@mov-ai/mov-fe-lib-react";
import { MonacoCodeEditor } from "@mov-ai/mov-fe-lib-code-editor";
import { AppBar, Toolbar } from "@material-ui/core";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";
import { useTheme } from "@material-ui/styles";
import InfoIcon from "@material-ui/icons/Info";
import Model from "../model/Configuration";
import { defaultFunction } from "../../../utils/Utils";
import { PLUGINS } from "../../../utils/Constants";
import { usePluginMethods } from "../../../engine/ReactPlugin/ViewReactPlugin";
import { withEditorPlugin } from "../../../engine/ReactPlugin/EditorReactPlugin";
import useDataSubscriber from "../../../plugins/DocManager/useDataSubscriber";
import Menu from "./Menu";

import { configurationStyles } from "./styles";

export const Configuration = (props, ref) => {
  const {
    id,
    name,
    call,
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
  const [extension, setExtension] = useState("yaml");
  // Style Hooks

  const classes = configurationStyles();
  const theme = useTheme();

  //========================================================================================
  /*                                                                                      *
   *                                   React callbacks                                    *
   *                                                                                      */
  //========================================================================================

  const renderMenus = useCallback(() => {
    const details = props.data?.details || {};
    const menuName = `${id}-detail-menu`;
    const menuTitle = i18n.t("ConfigurationDetailsMenuTitle");
    // add bookmark
    call(PLUGINS.RIGHT_DRAWER.NAME, PLUGINS.RIGHT_DRAWER.CALL.SET_BOOKMARK, {
      [menuName]: {
        icon: <InfoIcon></InfoIcon>,
        name: menuName,
        title: menuTitle,
        view: (
          <Menu id={id} name={name} details={details} model={instance}></Menu>
        ),
      },
    });
  }, [call, id, name, instance, props.data]);

  usePluginMethods(ref, {
    renderMenus,
  });

  //========================================================================================
  /*                                                                                      *
   *                                 Document Functions                                   *
   *                                                                                      */
  //========================================================================================

  const isXML = (code) => {
    const xmlPattern = /^\s*<(\?xml|[\w-]+)(\s|>)/;
    return xmlPattern.test(code);
  };

  const isYAML = (code) => {
    const yamlPattern = /^[\w\s-]+:\s*.+/m;
    return yamlPattern.test(code) && !isXML(code);
  };

  const detectLanguage = (code) => {
    if (isXML(code)) return "xml";
    if (isYAML(code)) return "yaml";
    return "plaintext";
  };

  /**
   * Updates the config extension
   * @param {String} value
   */
  const updateConfigExtension = (value) => {
    if (instance.current) instance.current.setExtension(value);
    console.log("setExtension ", instance.current.setExtension(value));
  };

  /**
   * Updates the config code
   * @param {String} value
   * @returns
   */
  const updateConfigCode = (value) => {
    if (value === instance.current.getCode()) return;
    if (instance.current) instance.current.setCode(value);
    console.log("value ", instance.current.setCode(value));
    const checkLanguage = detectLanguage(value);
    console.log("checkLanguage ", checkLanguage);
    updateConfigExtension(checkLanguage);
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
    setExtension(newExtension);
    updateConfigExtension(newExtension);
    console.log("newExtension ", newExtension);
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

  const editorEl = useMemo(() => {
    return (
      <div
        data-testid="section_configuration-editor"
        className={classes.codeContainer}
      >
        <MonacoCodeEditor
          value={data.code}
          language={extension}
          theme={theme.codeEditor?.theme}
          options={{ readOnly: !editable }}
          onChange={updateConfigCode}
          onSave={saveDocument}
          onLoad={onLoadEditor}
        />
      </div>
    );
  }, [extension, classes.codeContainer, data.code]);

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
      {editorEl}
    </div>
  );
};

Configuration.scope = "Configuration";

Configuration.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  call: PropTypes.func.isRequired,
  instance: PropTypes.object,
  data: PropTypes.object,
  editable: PropTypes.bool,
  saveDocument: PropTypes.func,
};

export default withEditorPlugin(Configuration);
