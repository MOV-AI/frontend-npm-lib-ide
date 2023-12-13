import React from "react";
import { Utils } from "@mov-ai/mov-fe-lib-core";
import { Button } from "@mov-ai/mov-fe-lib-react";
import { useTheme } from "@mui/styles";
import { PLUGINS } from "../../../utils/Constants";
import { withToolPlugin } from "../../../engine";
// Icons
import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
import AccessibilityIcon from "@mui/icons-material/Accessibility";
import AccessibleForwardIcon from "@mui/icons-material/AccessibleForward";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import AdbIcon from "@mui/icons-material/Adb";
import AddIcCallIcon from "@mui/icons-material/AddIcCall";
import AirplanemodeActiveIcon from "@mui/icons-material/AirplanemodeActive";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";

export const BOOKMARKS_PROFILE = {
  name: "BookmarkManager",
  title: "Bookmark Manager"
};

//========================================================================================
/*                                                                                      *
 *                                 Random Icon Generator                                *
 *                                                                                      */
//========================================================================================

const getIcon = () => {
  const icons = [
    AcUnitIcon,
    AccessAlarmIcon,
    AccessibilityIcon,
    AdbIcon,
    AccountBalanceIcon,
    AccessibleForwardIcon,
    AddIcCallIcon,
    AirplanemodeActiveIcon,
    AssignmentIndIcon
  ];

  const Icon = icons[Math.floor(Math.random() * icons.length)];
  return <Icon />;
};

//========================================================================================
/*                                                                                      *
 *                                 Bookmark Manager Tool                                *
 *                                                                                      */
//========================================================================================

const BookmarkManager = props => {
  const theme = useTheme();
  const { call } = props;

  /**
   * Add bookmark menu in left/right drawer
   *    Always set newly added menu as active and make it visible (open drawer if necessary)
   * @param {*} position : Either "leftDrawer" or "rightDrawer"
   */
  const addBookmark = position => () => {
    if (!position) return;
    const id = Utils.randomId();
    const bookmark = {
      icon: getIcon(),
      name: id,
      title: `Random ${id} Bookmark`,
      view: <h2>{id}</h2>
    };
    call(
      position,
      PLUGINS.RIGHT_DRAWER.CALL.ADD_BOOKMARK,
      bookmark,
      id,
      true,
      true
    );
  };

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <>
      <h1 style={{ color: theme.palette.text.primary }}>Bookmark Manager</h1>
      <Button
        color="primary"
        onClick={addBookmark(PLUGINS.LEFT_DRAWER.NAME)}
        style={{ float: "left" }}
      >
        Add bookmark to Left Drawer
      </Button>
      <Button
        color="primary"
        onClick={addBookmark(PLUGINS.RIGHT_DRAWER.NAME)}
        style={{ float: "right" }}
      >
        Add bookmark to Right Drawer
      </Button>
    </>
  );
};

export default withToolPlugin(BookmarkManager);

export const getTabData = () => {
  return {
    id: BOOKMARKS_PROFILE.name,
    name: BOOKMARKS_PROFILE.name,
    tabTitle: BOOKMARKS_PROFILE.title,
    extension: "",
    content: <BookmarkManager />
  };
};
