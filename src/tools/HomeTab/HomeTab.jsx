import React, { useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import {
  ALERT_SEVERITIES,
  HOMETAB_PROFILE,
  PLUGINS
} from "../../utils/Constants";
import { ERROR_MESSAGES } from "../../utils/Messages";
import { getNameFromURL } from "../../utils/Utils";
import Workspace from "../../utils/Workspace";
import ExamplesComponent from "./components/Examples";
import QuickAccessComponent from "./components/QuickAccess";
import RecentDocumentsComponent from "./components/RecentDocuments";

import { withToolPlugin } from "../../engine";
import { homeTabStyles } from "./styles";

const HomeTab = props => {
  const { call, on, off, alert } = props;
  const workspaceManager = useMemo(() => new Workspace(), []);
  const classes = homeTabStyles();
  const { t } = useTranslation();

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
          severity: ALERT_SEVERITIES.WARNING
        });
      } else {
        call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.OPEN_EDITOR, doc);
      }
    },
    [alert, call, t]
  );

  //========================================================================================
  /*                                                                                      *
   *                                        Renders                                       *
   *                                                                                      */
  //========================================================================================

  return (
    <div data-testid="section_hometab" className={classes.root}>
      <div className={classes.body}>
        <div className={classes.column}>
          <QuickAccessComponent call={call} />
          <RecentDocumentsComponent
            workspaceManager={workspaceManager}
            openRecentDocument={openExistingDocument}
            on={on}
            off={off}
          />
        </div>
        <div className={classes.column}>
          <ExamplesComponent openExistingDocument={openExistingDocument} />
        </div>
      </div>
    </div>
  );
};

const HomeTabPlugin = withToolPlugin(HomeTab);

export default HomeTabPlugin;

HomeTab.propTypes = {
  call: PropTypes.func.isRequired,
  on: PropTypes.func.isRequired
};

/**
 * Get welcome tab data
 * @returns {TabData} Data used to create tab
 */
export const getHomeTab = () => {
  return {
    ...HOMETAB_PROFILE,
    id: HOMETAB_PROFILE.name,
    name: HOMETAB_PROFILE.title,
    tabTitle: HOMETAB_PROFILE.title,
    scope: HOMETAB_PROFILE.name,
    extension: "",
    isTool: true
  };
};
