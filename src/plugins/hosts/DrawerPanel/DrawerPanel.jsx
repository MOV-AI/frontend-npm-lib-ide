// live configurable debug and behavior
// accissible in devTools via window.drawer

import React, { useCallback, useMemo } from "react";
import { unstable_batchedUpdates } from 'react-dom' // or 'react-native'
import PropTypes from "prop-types";
import { withTheme } from "@mov-ai/mov-fe-lib-react";
import { Drawer, Typography, Tooltip, IconButton } from "@material-ui/core";
import { DRAWER, PLUGINS } from "../../../utils/Constants";
import { activateKeyBind } from "../../../utils/Utils";
import { useUseful, makeUsefulOpen, getIndex, getOpen } from "../../../utils/useful";
import { withHostReactPlugin } from "../../../engine/ReactPlugin/HostReactPlugin";
import { bookmarkStyles } from "./../../../decorators/styles";
import { drawerPanelStyles } from "./styles";
import { create } from "zustand";

export
const useDrawer = create((set) => {
  const useful = makeUsefulOpen(set);

  return {
    ...useful,

    // setters and getters
    setPlugin: plugin => useful.siteSet("plugin", () => ({ plugin })),
    setActive: active => useful.siteSet("", (current, state) => active === current && state.plugin === false ? state : { active, plugin: false }),

    // emits

    add: (name = "", value, openArg = false, props = {}, argIndex) => set(state => {
      const stateIndex = getIndex(state);
      const index = argIndex ?? stateIndex;
      const current = state[index] ?? {};
      const oldOpen = getOpen(state);
      const open = oldOpen || openArg;
      console.log("add", state, name, value, openArg, props, argIndex);
      name = name.replace(".", "/");

      if (current.bookmarks?.[name] && !(Object.entries(props)).filter(
        ([key, value]) => value !== current.bookmarks[name].props[key]
      ).length && (name !== current.active && (!open || stateIndex !== index)))
        return state;

      let plugin = current.plugin;
      let active = current.active;

      if (open) {
        plugin = false;
        active = name;
      }

      return {
        [index]: {
          ...current,
          open, plugin, active,
          bookmarks: {
            ...(current.bookmarks ?? {}),
            [name]: { ...value, props },
          }
        },
        [state.suffix]: open,
      };
    }),

    remove: (name, argIndex) => set(state => {
      const stateIndex = getIndex(state);
      const index = argIndex ?? stateIndex;
      const current = state[index];
      let bookmarks = { ...current.bookmarks };
      delete bookmarks[name];
      console.log("remove", name, argIndex, current.bookmarks, bookmarks);
      return {
        [index]: {
          ...current,
          bookmarks,
        },
      };
    }),
  };
})

function selectBookmark(anchor, name) {
  unstable_batchedUpdates(() => {
    let state = useDrawer.getState();
    state.setSuffix(anchor);
    state = useDrawer.getState();
    state.setOpen(name !== state[getIndex(state)]?.active ? true : !getOpen(state));
    state.setActive(name);
  });
}

unstable_batchedUpdates(() => {
  let state = useDrawer.getState();
  state.setSuffix("left");
  state.setOpen(true);
  state.setSuffix("right");
});

window.drawer = useDrawer;

function BookmarkTab(props) {
  const { active, name, bookmark, anchor, classes } = props;

  const handleOnClick = useCallback(() => {
    selectBookmark(anchor, name);
  }, [name, anchor]);

  return (
    <Tooltip title={bookmark.title || name} placement="left">
      <IconButton
        data-testid="input_bookmark-tab"
        onClick={handleOnClick}
        aria-label={bookmark.title}
        className={classes.bookmark}
        size="small"
      >
        <p
          className={active !== name ? classes.unselectedBookmark : ""}
        >
          {bookmark.icon}
        </p>
      </IconButton>
    </Tooltip>
  );
}

function DrawerPanel(props) {
  const {
    anchor,
    emit,
    call,
    viewPlugins,
    hostName,
    style,
    className,
  } = props;

  const { side, sharedOpen, state } = useUseful(useDrawer, anchor);
  const {
    plugin = anchor === "left" ? true : false,
    bookmarks = {}, open = sharedOpen,
  } = side;
  const active = side.active ?? Object.keys(bookmarks)[0];
  const renderedView = bookmarks[active]?.view ?? <></>;
  const realOpen = open && (plugin || bookmarks?.[active]);
  const oppositeSide = anchor === "left" ? "right" : "left";
  const classes = bookmarkStyles(anchor, oppositeSide)();
  const drawerClasses = drawerPanelStyles(anchor === "left", realOpen)();

  const activateActiveTabEditor = async () => {
    const tab = await call(
      PLUGINS.TABS.NAME,
      PLUGINS.TABS.CALL.GET_ACTIVE_TAB
    );
    activateKeyBind(tab.id);
  };

  const selectBookmarkCallback = useCallback(
    name => {
      activateActiveTabEditor();
      selectBookmark(anchor, name);
    },
    [anchor, active, emit]
  );

  const viewProps = bookmarks[active]?.props;

  const realView = useMemo(() => {
    if (typeof renderedView === "object")
      return renderedView;

    return renderedView(viewProps)
  }, [viewProps]);

  const renderBookmarks = useCallback(() => (
    <div className={classes.panel}>
      {Object.entries(bookmarks).map(([name, bookmark]) => (
        <BookmarkTab
          data-testid="section_bookmark-tab"
          key={name}
          name={name}
          anchor={anchor}
          classes={classes}
          bookmark={bookmark}
          active={active}
          selectBookmark={selectBookmarkCallback}
        />
      ))}
    </div>
  ), [active, anchor, bookmarks, classes, selectBookmarkCallback]);
  console.log("Drawer", anchor, state);

  return (
    <div className={classes.bookmarksContainer}>
      {anchor === "left" ? renderBookmarks() : null }
      <Drawer
        id={hostName}
        open={realOpen}
        anchor={anchor}
        variant="persistent"
        style={style}
        className={`${drawerClasses.drawer} ${className}`}
      >
        <Typography component="div" className={drawerClasses.content}>
          {plugin ? viewPlugins : (
            <div className={classes.bookmarkHolder}>{realView}</div>
          )}
        </Typography>
      </Drawer>
      {anchor === "right" ? renderBookmarks() : null }
    </div>
  );
};

DrawerPanel.pluginMethods = [
  ...Object.values(PLUGINS.RIGHT_DRAWER.CALL),
  ...Object.values(DRAWER.METHODS)
];

export default withTheme(withHostReactPlugin(
  DrawerPanel,
  DrawerPanel.pluginMethods
));

DrawerPanel.propTypes = {
  hostName: PropTypes.string.isRequired,
};
