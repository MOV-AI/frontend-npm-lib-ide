import React, { forwardRef, useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { useTheme } from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";
import withAlerts from "../../../decorators/withAlerts";
import { withViewPlugin } from "../../../engine/ReactPlugin/ViewReactPlugin";
import Workspace from "../../../utils/Workspace";
import { getNameFromURL } from "../../../utils/Utils";
import { HOMETAB_PROFILE, PLUGINS } from "../../../utils/Constants";
import ERROR_MESSAGES from "../../../utils/ErrorMessages";
import movaiFullLogoWhite from "../editors/_shared/Branding/movai-full-logo-red-white.png";
import movaiFullLogo from "../editors/_shared/Branding/movai-full-logo.png";
import QuickAccessComponent from "./components/QuickAccess";
import RecentDocumentsComponent from "./components/RecentDocuments";
import ExamplesComponent from "./components/Examples";

import { homeTabStyles } from "./styles";

const HomeTab = forwardRef((props, ref) => {
  const { call, on, off, alert, alertSeverities } = props;
  const workspaceManager = useMemo(() => new Workspace(), []);
  const classes = homeTabStyles();
  const { t } = useTranslation();
  const theme = useTheme();

  //========================================================================================
  /*                                                                                      *
   *                                        Methods                                       *
   *                                                                                      */
  //========================================================================================

  /**
   * Open an existing Document
   * @param {{name: string, scope: string, id: string, isDeleted: bool}} doc : Document data
   */
  const openExistingDocument = useCallback(
    doc => {
      if (!doc.name) doc.name = getNameFromURL(doc.id);

      if (doc.isDeleted) {
        alert({
          message: t(ERROR_MESSAGES.FILE_DOESNT_EXIST, {
            FILE_URL: doc.id
          }),
          severity: alertSeverities.WARNING
        });
      } else {
        call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.OPEN_EDITOR, doc);
      }
    },
    [alertSeverities, alert, call, t]
  );

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  useEffect(() => {
    call(PLUGINS.RIGHT_DRAWER.NAME, PLUGINS.RIGHT_DRAWER.CALL.RESET_BOOKMARKS);
    on(PLUGINS.TABS.NAME, PLUGINS.TABS.ON.ACTIVE_TAB_CHANGE, data => {
      if (data.id === HOMETAB_PROFILE.name) {
        call(
          PLUGINS.RIGHT_DRAWER.NAME,
          PLUGINS.RIGHT_DRAWER.CALL.RESET_BOOKMARKS
        );
      }
    });
    return () => {
      off(PLUGINS.TABS.NAME, PLUGINS.TABS.ON.ACTIVE_TAB_CHANGE);
    };
  }, [call, on, off]);

  //========================================================================================
  /*                                                                                      *
   *                                        Renders                                       *
   *                                                                                      */
  //========================================================================================

  return (
    <div className={classes.root}>
      <div className={classes.body}>
        <div className={classes.column}>
          <QuickAccessComponent call={call} />
          <RecentDocumentsComponent
            workspaceManager={workspaceManager}
            openRecentDocument={openExistingDocument}
            on={on}
          />
        </div>
        <div className={classes.column}>
          <ExamplesComponent openExistingDocument={openExistingDocument} />
        </div>
      </div>
      <div className={classes.footer}>
        <Tooltip title={t("MOV.AI")}>
          {/* <IconButton
            href="https://mov.ai"
            target="_blank"
            rel="noreferrer"
            className={classes.socialIconBadge}
          > */}
          <img
            src={theme.label === "dark" ? movaiFullLogoWhite : movaiFullLogo}
            alt="MOV.AI Logo"
            className={classes.movaiIcon}
          />
          {/* </IconButton> */}
        </Tooltip>
      </div>
    </div>
  );
});

export default withViewPlugin(withAlerts(HomeTab));

HomeTab.propTypes = {
  call: PropTypes.func.isRequired,
  on: PropTypes.func.isRequired
};
