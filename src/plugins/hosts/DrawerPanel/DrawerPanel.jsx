// live configurable debug and behavior
// accissible in devTools via window.drawer

import React, { useCallback, useMemo } from "react";
import { unstable_batchedUpdates } from 'react-dom' // or 'react-native'
import PropTypes from "prop-types";
import { withTheme } from "@mov-ai/mov-fe-lib-react";
import { Drawer, Typography, Tooltip, IconButton } from "@material-ui/core";
import { DRAWER, PLUGINS } from "../../../utils/Constants";
import { activateKeyBind } from "../../../utils/Utils";
import { withHostReactPlugin } from "../../../engine/ReactPlugin/HostReactPlugin";
import { bookmarkStyles } from "./../../../decorators/styles";
import { drawerPanelStyles } from "./styles";
import { create } from "zustand";

function getIndex(state = {}) {
  return (state.url ?? "initial") + "/" + (state.suffix ?? "right");
}

/*
function popIndex(index) {
  const splits = index.split("/");
  const butLast = [ ...splits ];
  butLast.splice(-1, 1)
  return { url: butLast.join("/"), suffix: splits[splits.length - 1] };
}
*/

function getOpen(state = {}) {
  return state.shared ? state[state.suffix] : state[getIndex(state)]?.open;
}

function makeSiteSet(set) {
  return (path, callback = a => a) => {
    if (!path)
      return set((state = {}) => {
        const index = getIndex(state);
        const current = state[index] ?? {};
        const value = callback(current, state);

        if (value === current)
          return state;

        return {
          ...state,
          [index]: Object.assign(current, value),
        }
      });
    else
      return set((state = {}) => {
        const index = getIndex(state);
        const current = state[index] ?? {};
        const value = callback(current[path], state);

        if (current[path] === value)
          return state;

        return {
          ...state,
          [index]: Object.assign(current, { [path]: value }),
        };
      });
  };
}

export
const useDrawer = create((set) => {
  const siteSet = makeSiteSet(set);

  return {
    // state
    shared: true,
    url: "initial",
    suffix: "right",

    // setters and getters
    setPlugin: plugin => siteSet("plugin", () => ({ plugin })),
    setUrl: url => set((state) => {
      console.log("setUrl", url, state.url);
      if (url === state.url)
        return state;
      return { url };
    }),
    setSuffix: suffix => set((state) => suffix === state.suffix ? state : { suffix }),
    setActive: active => siteSet("", (current, state) => active === current && state.plugin === false ? state : { active, plugin: false }),
    setOpen: open => set(state => {
      if (open === getOpen(state))
        return state;

      const index = getIndex(state);

      return {
        ...state,
        [index]: { ...state[index] ?? {}, open },
        [state.suffix]: open,
        url: state.url,
      };
    }),

    // emits

    add: (name = "", value, openArg = false, props = {}, argIndex) => set(state => {
      const stateIndex = getIndex(state);
      const index = argIndex ?? stateIndex;
      const current = state[index] ?? {};
      console.log("add", state, name, value, openArg, props, argIndex);
      name = name.replace(".", "/");

      if (current.bookmarks?.[name] && !(Object.entries(props)).filter(
        ([key, value]) => value !== current.bookmarks[name].props[key]
      ).length && (name === current.active || !openArg || stateIndex !== index))
        return state;

      const oldOpen = getOpen(state);
      const open = oldOpen || openArg;
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

  const cur = useDrawer();
  const url = cur.url;
  const side = cur[url + "/" + anchor] ?? {};
  const sharedOpen = cur[anchor];
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
  console.log("Drawer", anchor, cur);

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
