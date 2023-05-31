import React, { useState, useEffect, useMemo, useContext } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import {
  VerticalBar,
  ProfileMenu,
  ContextMenu,
  HomeMenuPopper
} from "@mov-ai/mov-fe-lib-react";
import TextSnippetIcon from "@material-ui/icons/Description";
import AddBoxIcon from "@material-ui/icons/AddBox";
import { Tooltip } from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import { withViewPlugin } from "./../../../engine/ReactPlugin/ViewReactPlugin";
import { MainContext } from "../../../main-context";
import AppSettings from "../../../App/AppSettings";
import { getMainMenuTools } from "../../../tools";
import { PLUGINS, HOSTS } from "../../../utils/Constants";
import { getIconByScope, getIconFn } from "../../../utils/Utils";
import { openTool } from "../../../utils/generalFunctions";
import movaiIcon from "../../../Branding/movai-logo-transparent.png";

import { mainMenuStyles } from "./styles";

const MainMenu = props => {
  const { call } = props;
  // State hooks
  const [docTypes, setDocTypes] = useState([]);
  // Other hooks
  const classes = mainMenuStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  const {
    isDarkTheme,
    isMenuOpen,
    onCloseMenu,
    handleLogOut,
    handleToggleTheme
  } = useContext(MainContext);
  // Refs
  const MENUS = [
    {
      name: PLUGINS.EXPLORER.NAME,
      icon: getIconFn(TextSnippetIcon),
      title: "Explorer",
      isActive: true,
      getOnClick: () => {
        // Toggle left drawer
        call(
          HOSTS.LEFT_DRAWER.NAME,
          HOSTS.LEFT_DRAWER.CALL.ACTIVATE_PLUGIN_VIEW
        );
      }
    },
    ...getMainMenuTools().map(tool => {
      return {
        name: tool.id,
        icon: getIconFn(tool.icon),
        title: tool.profile.title,
        isActive: true,
        getOnClick: () => {
          // Open tool
          openTool(call, tool.profile.name);
        }
      };
    })
  ];

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  // To run when component is initiated
  useEffect(() => {
    call(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.CALL.GET_DOC_TYPES).then(
      _docTypes => {
        setDocTypes(_docTypes);
      }
    );
  }, [call]);

  const profileMenu = useMemo(() => (
    <ProfileMenu
      key={"profileMenu"}
      version={AppSettings.APP_INFORMATION.VERSION}
      isDarkTheme={isDarkTheme}
      handleLogout={handleLogOut}
      handleToggleTheme={
        AppSettings.APP_PROPS.SHOW_TOGGLE_THEME ? handleToggleTheme : null
      }
    />
  ), []);

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <div className={classes.mainMenuHolder} data-testid="section_main-menu">
      <VerticalBar
        unsetAccountAreaPadding={true}
        backgroundColor={theme.palette.background.default}
        upperElement={
          <>
            {AppSettings.APP_PROPS.SHOW_APP_SELECTION && (
              <div className={classes.appsHolder}>
                <Tooltip title={t("Home")}>
                  <HomeMenuPopper />
                </Tooltip>
                <hr />
              </div>
            )}
            <ContextMenu
              element={
                <Tooltip title={t("CreateNewDoc")} placement="right" arrow>
                  <AddBoxIcon
                    id="mainMenuCreateNewDocument"
                    className={classes.icon}
                  ></AddBoxIcon>
                </Tooltip>
              }
              menuList={docTypes.map(docType => ({
                onClick: () =>
                  call(
                    PLUGINS.DOC_MANAGER.NAME,
                    PLUGINS.DOC_MANAGER.CALL.CREATE,
                    {
                      scope: docType.scope
                    }
                  ).then(document => {
                    call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.OPEN_EDITOR, {
                      id: document.getUrl(),
                      name: document.getName(),
                      scope: docType.scope,
                      isNew: true
                    });
                  }),
                element: docType.name || docType.scope,
                icon: getIconByScope(docType.scope),
                onClose: true
              }))}
            />
          </>
        }
        navigationList={MENUS.map(menu => (
          <Tooltip key={menu.name} title={menu.title} placement="right" arrow>
            <span>
              {menu.icon({
                className: classes.icon,
                onClick: () => menu.getOnClick()
              })}
            </span>
          </Tooltip>
        ))}
        lowerElement={[
          profileMenu,
          <img
            key={"movaiIcon"}
            src={movaiIcon}
            className={classes.movaiIcon}
            alt="MOV.AI"
          />
        ]}
      ></VerticalBar>
    </div>
  );
};

MainMenu.propTypes = {
  call: PropTypes.func.isRequired,
  emit: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired
};

export default withViewPlugin(MainMenu);
