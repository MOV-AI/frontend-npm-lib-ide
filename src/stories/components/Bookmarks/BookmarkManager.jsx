import React from "react";
import { Utils } from "@mov-ai/mov-fe-lib-core";
import { Button } from "@mov-ai/mov-fe-lib-react";
import { useTheme } from "@mov-ai/mov-fe-lib-react";
import { PLUGINS } from "../../../utils/Constants";
import { drawerSub } from "../../../plugins/hosts/DrawerPanel/DrawerPanel";
import { withToolPlugin } from "../../../engine";
// Icons
import {
  AccessAlarmIcon,
  AccessibilityIcon,
  AccountBalanceIcon,
  AcUnitIcon,
  AdbIcon,
  AddIcCallIcon,
  AirplanemodeActiveIcon,
  AssignmentIndIcon,
} from "@mov-ai/mov-fe-lib-react";

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

  /**
   * Add bookmark menu in left/right drawer
   *    Always set newly added menu as active and make it visible (open drawer if necessary)
   * @param {*} position : Either "leftDrawer" or "rightDrawer"
   */
  const localAddBookmark = position => () => {
    if (!position) return;
    const id = Utils.randomId();
    const bookmark = {
      icon: getIcon(),
      name: id,
      title: `Random ${id} Bookmark`,
      view: <h2>{id}</h2>
    };
    drawerSub.add(id, bookmark);
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
        onClick={localAddBookmark(PLUGINS.LEFT_DRAWER.NAME)}
        style={{ float: "left" }}
      >
        Add bookmark to Left Drawer
      </Button>
      <Button
        color="primary"
        onClick={localAddBookmark(PLUGINS.RIGHT_DRAWER.NAME)}
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
