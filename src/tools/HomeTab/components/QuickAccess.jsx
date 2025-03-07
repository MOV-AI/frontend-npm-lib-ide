import React, { useEffect, useState } from "react";
import { i18n } from "@mov-ai/mov-fe-lib-react";
import PropTypes from "prop-types";
import { ContextMenu } from "@mov-ai/mov-fe-lib-react";
import Paper from "@material-ui/core/Paper";
import Divider from "@material-ui/core/Divider";
import AddIcon from "@material-ui/icons/Add";
import ChromeReaderModeIcon from "@material-ui/icons/ChromeReaderMode";
import AppSettings from "../../../App/AppSettings";
import { PLUGINS } from "../../../utils/Constants";
import { getIconByScope } from "../../../utils/Utils";
import { openTool } from "../../../utils/generalFunctions";
import { getQuickAccessTools } from "../../";
import { quickAccessStyles } from "../styles";

const QuickAccess = (props) => {
  const { call } = props;
  const classes = quickAccessStyles();

  // State
  const [docTypes, setDocTypes] = useState([]);

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

  // This is already working - just leaving this here for posteriority
  // const handleOpenAppConfig = useCallback(() => {
  //   const name = APP_CUSTOM_CONFIG;
  //   const scope = Configuration.SCOPE;

  //   call(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.CALL.CHECK_DOCUMENT_EXISTS, {
  //     name,
  //     scope
  //   }).then(fileExists => {
  //     if (!fileExists) {
  //       call(
  //         PLUGINS.DOC_MANAGER.NAME,
  //         PLUGINS.DOC_MANAGER.CALL.COPY,
  //         {
  //           name: APP_DEFAULT_CONFIG,
  //           scope
  //         },
  //         name
  //       );
  //     }

  //     call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.OPEN_EDITOR, {
  //       id: `global/${scope}/${name}`,
  //       name,
  //       scope
  //     });
  //   });
  // }, [call]);

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Component Did Mount
   */
  useEffect(() => {
    call(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.CALL.GET_DOC_TYPES).then(
      (_docTypes) => {
        setDocTypes(_docTypes);
      },
    );
  }, [call]);

  return (
    <Paper data-testid="section_quick-access" className={classes.paper}>
      <div className={classes.columnTitle}>{i18n.t("QuickAccess")}</div>
      <Divider />
      <div className={classes.columnBody}>
        <ContextMenu
          element={
            <div className={classes.link}>
              <AddIcon className={classes.linkIcon} />
              {i18n.t("CreateNewDoc")}
            </div>
          }
          menuList={docTypes.map((docType) => ({
            onClick: () =>
              call(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.CALL.CREATE, {
                scope: docType.scope,
              }).then((document) => {
                call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.OPEN_EDITOR, {
                  id: document.getUrl(),
                  name: document.getName(),
                  scope: docType.scope,
                  isNew: true,
                });
              }),
            element: docType.name || docType.scope,
            icon: getIconByScope(docType.scope),
            onClose: true,
          }))}
        ></ContextMenu>
        {AppSettings.HELP.DOCUMENTATION ? (
          <a
            data-testid="input_documentation"
            href={AppSettings.HELP.DOCUMENTATION}
            target="_blank"
            rel="noreferrer"
            className={classes.link}
          >
            <ChromeReaderModeIcon className={classes.linkIcon} />

            {i18n.t("Documentation")}
          </a>
        ) : (
          <></>
        )}

        {/* <div data-testid="input_app-config" className={classes.link} onClick={handleOpenAppConfig}>
          <BuildIcon className={classes.linkIcon} />
          {i18n.t("App Configuration")}
        </div> */}
        {getQuickAccessTools().map((tool) => {
          const Icon = tool.icon;
          const { name, title } = tool.profile;
          return (
            <div
              key={`input_tool_${name}`}
              data-testid={`input_tool_${name}`}
              className={classes.link}
              onClick={() => openTool(call, name)}
            >
              <Icon className={classes.linkIcon} />
              {title}
            </div>
          );
        })}
      </div>
    </Paper>
  );
};

QuickAccess.propTypes = {
  call: PropTypes.func,
};

export default QuickAccess;
