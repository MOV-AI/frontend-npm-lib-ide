import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { i18n } from "@mov-ai/mov-fe-lib-react";
import { makeStyles, useTheme } from "@mov-ai/mov-fe-lib-react";
import { MonacoCodeEditor } from "@mov-ai/mov-fe-lib-code-editor";
import { withEditorPlugin } from "../../../engine/ReactPlugin/EditorReactPlugin";
import { usePluginMethods } from "../../../engine/ReactPlugin/ViewReactPlugin";
import { InfoIcon } from "@mov-ai/mov-fe-lib-react";
import { drawerSub } from "../../../plugins/hosts/DrawerPanel/DrawerPanel";
import Menu from "./Menu";

const useStyles = makeStyles((_theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    height: "100%",
    maxHeight: "100%",
  },
}));

export const Callback = (props, ref) => {
  const {
    id,
    name,
    call,
    scope,
    instance,
    data = {},
    saveDocument,
    editable = true,
    useLanguageServer = false,
  } = props;

  const { pyLibs = {} } = data;

  // Style Hooks
  const classes = useStyles();
  const theme = useTheme();

  //========================================================================================
  /*                                                                                      *
   *                                   React callbacks                                    *
   *                                                                                      */
  //========================================================================================

  const renderRightMenu = useCallback(() => {
    const menuName = `detail-menu`;
    const menuTitle = i18n.t("CallbackDetailsMenuTitle");
    // add bookmark
    drawerSub.add(
      menuName,
      {
        icon: <InfoIcon />,
        name: menuName,
        url: "global/Callback/" + name,
        suffix: "right",
        select: true,
        title: menuTitle,
        view: <Menu id={id} call={call} name={name} scope={scope} />,
      },
      [name],
    );
  }, [call, id, name, scope]);

  usePluginMethods(ref, {
    renderRightMenu,
  });

  //========================================================================================
  /*                                                                                      *
   *                                 Document Functions                                   *
   *                                                                                      */
  //========================================================================================

  const updateCallbackCode = (value) => {
    if (value === instance.current.getCode()) return;
    if (instance.current) instance.current.setCode(value);
  };

  const onEditorLoad = (editor) => {
    if (!id) editor.focus();
  };

  //========================================================================================
  /*                                                                                      *
   *                                   Render Functions                                   *
   *                                                                                      */
  //========================================================================================
  return (
    <div data-testid="section_callback-editor" className={classes.container}>
      <MonacoCodeEditor
        value={data?.code}
        language={"python"}
        theme={theme?.codeEditor?.theme ?? "dark"}
        options={{ readOnly: !editable }}
        onChange={updateCallbackCode}
        onSave={saveDocument}
        onLoad={onEditorLoad}
        useLanguageServer={useLanguageServer}
        builtins={Object.values(pyLibs).map((libs) => libs.name)}
      />
    </div>
  );
};

Callback.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  scope: PropTypes.string.isRequired,
  call: PropTypes.func.isRequired,
  data: PropTypes.object,
  instance: PropTypes.object,
  editable: PropTypes.bool,
  useLanguageServer: PropTypes.bool,
  saveDocument: PropTypes.func,
};

export default withEditorPlugin(Callback);
