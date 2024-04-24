import React, { useState, useEffect, useContext, useRef } from "react";
import { i18n } from "@mov-ai/mov-fe-lib-react";
import PropTypes from "prop-types";
import {
  VerticalBar,
  ProfileMenu,
  ContextMenu,
  HomeMenuPopper
} from "@mov-ai/mov-fe-lib-react";
import { DescriptionIcon, AddBoxIcon } from "@mov-ai/mov-fe-lib-react";
import { Tooltip } from "@mov-ai/mov-fe-lib-react";
import { useTheme } from "@mov-ai/mov-fe-lib-react";
import { withViewPlugin } from "../../../engine/ReactPlugin/ViewReactPlugin";
import { drawerSub } from "../../../plugins/hosts/DrawerPanel/DrawerPanel";
import { MainContext } from "../../../main-context";
import AppSettings from "../../../App/AppSettings";
import { getMainMenuTools } from "../../../tools";
import { PLUGINS } from "../../../utils/Constants";
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
      icon: getIconFn(DescriptionIcon),
      title: "Explorer",
      isActive: true,
      getOnClick: () => { 
        drawerSub.suffix = "left"; 
        if (drawerSub.plugin) {
          drawerSub.open = !drawerSub.open;
        } else {
          drawerSub.plugin = true; 
          drawerSub.open = true; 
        }
       
      },
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
                <HomeMenuPopper />
                <hr />
              </div>
            )}
            <ContextMenu
              element={
                <Tooltip title={i18n.t("CreateNewDoc")} placement="right" arrow>
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
        navigationList={MENUS.map((menu, index) => (
          <Tooltip key={menu.name + index} title={menu.title} placement="right" arrow>
            <span>
              {menu.icon({
                className: classes.icon,
                onClick: () => menu.getOnClick()
              })}
            </span>
          </Tooltip>
        ))}
        lowerElement={[
          <ProfileMenu
            key={"profileMenu"}
            version={globalThis.version ?? AppSettings.APP_INFORMATION.VERSION}
            isDarkTheme={isDarkTheme}
            handleLogout={handleLogOut}
            handleToggleTheme={
              AppSettings.APP_PROPS.SHOW_TOGGLE_THEME ? handleToggleTheme : null
            }
            isMenuOpen={isMenuOpen}
            onClose={onCloseMenu}
          />,
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
