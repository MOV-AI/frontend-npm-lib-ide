import React, { forwardRef, useState } from "react";
import PropTypes from "prop-types";
import Drawer from "@mui/material/Drawer";
import Typography  from "@mui/material/Typography";
import { DRAWER } from "../../../utils/Constants";
import { withHostReactPlugin } from "../../../engine/ReactPlugin/HostReactPlugin";
import { usePluginMethods } from "../../../engine/ReactPlugin/ViewReactPlugin";
import withBookmarks, {
  exposedMethods
} from "../../../decorators/withBookmarks";

import { drawerPanelStyles } from "./styles";

const DrawerPanel = forwardRef((props, ref) => {
  const {
    viewPlugins,
    hostName,
    style,
    anchor,
    initialOpenState,
    className,
    length,
    children: bookmarkView
  } = props;
  const [open, setOpen] = useState(initialOpenState);
  const [activeView, setActiveView] = useState(DRAWER.VIEWS.PLUGIN);
  const realOpen = open && (anchor === "left" || length);
  const classes = drawerPanelStyles(anchor === "left", realOpen)();

  //========================================================================================
  /*                                                                                      *
   *                                   Component's methods                                *
   *                                                                                      */
  //========================================================================================

  /**
   * Toggle drawer
   */
  const toggleDrawer = () => {
    setOpen(prevState => {
      return !prevState;
    });
  };

  /**
   * Open Drawer
   */
  const openDrawer = () => {
    setOpen(true);
  };

  /**
   * Close Drawer
   */
  const closeDrawer = () => {
    setOpen(false);
  };

  /**
   * Activate Plugin View
   */
  const activatePluginView = () => {
    if (activeView === DRAWER.VIEWS.PLUGIN) toggleDrawer();
    else openDrawer();
    setActiveView(DRAWER.VIEWS.PLUGIN);
  };

  /**
   * Activate Bookmark view
   */
  const activateBookmarkView = () => {
    setActiveView(DRAWER.VIEWS.BOOKMARK);
  };

  /**
   * Get active view
   * @returns {string} Return current active view in drawer
   */
  const getActiveView = () => {
    return activeView;
  };

  /**
   * Reset state of active view
   */
  const resetDrawer = () => {
    setActiveView(DRAWER.VIEWS.PLUGIN);
    setOpen(initialOpenState);
  };

  //========================================================================================
  /*                                                                                      *
   *                                   React lifecycles                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Expose methods
   */
  usePluginMethods(ref, {
    activateBookmarkView,
    activatePluginView,
    getActiveView,
    toggleDrawer,
    resetDrawer,
    openDrawer,
    closeDrawer
  });

  //========================================================================================
  /*                                                                                      *
   *                                         Render                                       *
   *                                                                                      */
  //========================================================================================

  if (!realOpen)
    return null;

  return (
    <Drawer
      id={hostName}
      open={realOpen}
      anchor={anchor}
      variant="persistent"
      style={{ ...style }}
      className={`${classes.drawer} ${className}`}
    >
      <Typography component="div" className={classes.content}>
        {activeView === DRAWER.VIEWS.PLUGIN ? viewPlugins : bookmarkView}
      </Typography>
    </Drawer>
  );
});

DrawerPanel.pluginMethods = [
  ...exposedMethods,
  ...Object.values(DRAWER.METHODS)
];

export default withHostReactPlugin(
  withBookmarks(DrawerPanel),
  DrawerPanel.pluginMethods
);

DrawerPanel.propTypes = {
  hostName: PropTypes.string.isRequired,
  initialOpenState: PropTypes.bool
};

DrawerPanel.defaultProps = {
  initialOpenState: false
};
