import React, { useCallback } from "react";
import { differenceWith, isEqual } from "lodash";
import PropTypes from "prop-types";
import { Drawer, Typography, Tooltip, IconButton } from "@material-ui/core";
import { makeSub, useSub } from "@mov-ai/mov-fe-lib-react";
import { DRAWER, PLUGINS } from "../../../utils/Constants";
import { activateKeyBind } from "../../../utils/Utils";
import { withHostReactPlugin } from "../../../engine/ReactPlugin/HostReactPlugin";
import { usePluginMethods } from "../../../engine/ReactPlugin/ViewReactPlugin";
import { bookmarkStyles } from "./../../../decorators/styles";
import { drawerPanelStyles } from "./styles";

function makeEcho(debug, fileDesc) {
  if (debug)
    return function (text, ...args) {
      console.log(fileDesc, text, ...args);
      return args[0];
    };
  else
    return function (_text, firstArg) {
      return firstArg;
    };
}

const debugDrawer = false;
const shared = true;
window.sharedBookmarks = shared;

const echo = makeEcho(debugDrawer, "DrawerPanel");

const MODE = {
  PLUGIN: 0,
  BOOKMARK: 1,
};

const bookmarkSub = makeSub({
  url: "initial",
});

function setActive(side, active) {
  if (!side.bookmarks[active])
    return side;

  else return  {
    ...side,
    mode: MODE.BOOKMARK,
    active,
  };
}

/**
 * Small extract method to return a valid bookmark from the bookmarks list
 * @param {Array} bookmarks : the bookmarks list
 * @param {String} name : name to search
 * @returns a valid bookmark
 */
function getValidBookmark(bookmarks, name) {
  if (bookmarks[name]) return name;

  return Object.keys(bookmarks)[0];
}

export
const setUrl = bookmarkSub.makeEmitNow((current, url) => ({
  ...current,
  url,
}));

function getOpen(current, url, side) {
  return window.sharedBookmarks ? current[side] : current[url][side].open;
}

/**
 * Register a bookmark if necessary without affecting other state.
 */
export
const registerBookmark = bookmarkSub.makeEmitNow((current, side = "right", name, value, open, deps = []) => {
  let url = current.url;

  if (typeof side === "object") {
    url = side.url ?? current.url;
    side = side.side;
  }

  const cur = current[url]?.[side] ?? {};

  if (cur.bookmarks?.[name])
    return open && (cur.active !== name || cur.mode !== MODE.BOOKMARK || !getOpen(current, url, side)) ? { // must open
      ...current,
      [url]: {
        ...current[url],
        [side]: {
          ...cur,
          mode: MODE.BOOKMARK,
          active: name,
          open,
          deps,
        },
      },
      [side]: open,
    } : cur.deps.length !== deps.length || differenceWith(cur.deps, deps, isEqual).length ? { // deps changed
      ...current,
      [url]: {
        ...current[url],
        [side]: {
          ...cur,
          bookmarks: {
            ...(cur.bookmarks ?? {}),
            [name]: { name, ...value },
          },
          deps,
        },
      },
    } : current; // no change

  // never registered
  return echo("registerBookmark", {
    ...current,
    [url]: {
      ...(current[url] ?? {}),
      [side]: {
        ...cur,
        bookmarks: {
          ...(cur.bookmarks ?? {}),
          [name]: { name, ...value },
        },
        open: open || cur.open,
        mode: open ? MODE.BOOKMARK : cur.mode,
        active: open ? name : cur.active,
        deps,
      },
    },
    [side]: open || current[side],
  });
});

/**
 * Remove bookmark by name
 * @param {string} name : bookmark name
 * @param {string} activeBookmark : bookmark to make active
 */
export
const removeBookmark = bookmarkSub.makeEmitNow((current, side = "right", name, activeBookmark) => {
  const url = current.url;

  let bookmarks = { ...current[url][side].bookmarks };

  delete bookmarks[name];

  return echo("removeBookmark", {
    ...current,
    [url]: {
      ...(current[url] ?? {}),
      [side]: setActive({
        ...current[url][side],
        bookmarks,
      }, current[url][side].active !== name ? current[url][side].active : (
        getValidBookmark(bookmarks, activeBookmark)
      )),
    },
  });
});

export
const openDrawer = bookmarkSub.makeEmitNow((current, side) => echo("openDrawer", {
  ...current,
  [current.url]: {
    ...current[current.url],
    [side]: { ...current[current.url][side], open: true },
  },
  [side]: true,
}));

export
const closeDrawer = bookmarkSub.makeEmitNow((current, side) => echo("closeDrawer", {
  ...current,
  [current.url]: {
    ...current[current.url],
    [side]: { ...current[current.url][side], open: false },
  },
  [side]: false,
}));

export
const toggleDrawer = bookmarkSub.makeEmitNow((current, side) => echo("toggleDrawer", {
  ...current,
  [current.url]: {
    ...current[current.url],
    [side]: {
      ...current[current.url][side],
      open: !current[current.url][side].open,
    },
  },
  [side]: !current[side],
}));

export
const resetDrawer = bookmarkSub.makeEmitNow((current, side, open = false) => echo("resetDrawer", {
  ...current,
  [current.url]: {
    ...current[current.url],
    [side]: {
      ...current[current.url][side],
      mode: MODE.PLUGIN,
      open,
    },
  },
  [side]: open,
}));

export
const activateBookmarkView = bookmarkSub.makeEmitNow((current, url, side = "right") => echo("activateBookmarkView", {
  ...current,
  [url]: {
    ...current[url],
    [side]: {
      ...current[url][side],
      mode: MODE.BOOKMARK,
    },
  },
}));

export
const activatePluginView = bookmarkSub.makeEmitNow((current, side = "left") => {
  const url = current.url;
  let open = !getOpen(current, url, side) || current[url]?.[side].mode !== MODE.PLUGIN;

  return echo("activatePluginView", {
    ...current,
    [url]: {
      ...current[url],
      [side]: {
        ...(current[url]?.[side] ?? {}),
        mode: MODE.PLUGIN,
        open,
      }
    },
    [side]: open,
  });
});

function bookmarkSelected(cur, name) {
  return cur.active === name || cur.mode !== MODE.PLUGIN && Object.keys(cur.bookmarks)[0] === name;
}

/**
 * Select bookmark
 * @param {String} name : Bookmark name
 */
export
const selectBookmark = bookmarkSub.makeEmitNow((current, side = "right", name) => {
  const url = current.url;
  const cur = current[url][side];
  const open = bookmarkSelected(cur, name) ? !getOpen(current, url, side) : true;

  return echo("selectBookmark", {
    ...current,
    [url]: {
      ...current[url],
      [side]: setActive({
        ...current[url][side],
        open,
      }, name),
    },
    [side]: open,
  });
});

function BookmarkTab(props) {
  const { active, name, bookmark, anchor, classes } = props;

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

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

function DrawerPanel(props, ref) {
  const {
    anchor,
    emit,
    call,
    viewPlugins,
    hostName,
    style,
    className,
  } = props;

  const sub = useSub(bookmarkSub);
  const { url } = sub;
  const { left, right } = sub[url] ?? {};

  const side = (anchor === "left" ? left : right) ?? {};

  const {
    mode = anchor === "left" ? MODE.PLUGIN : MODE.BOOKMARK,
    bookmarks = {},
  } = side;

  const active = side.active ?? Object.keys(bookmarks)[0];

  const renderedView = bookmarks[active]?.view ?? <></>;

  const open = (window.sharedBookmarks ? sub[anchor] : side.open) ?? anchor === "left";

  // Refs
  const oppositeSide = anchor === "left" ? "right" : "left";
  // Style hooks
  const classes = bookmarkStyles(anchor, oppositeSide)();
  const realOpen = open && (anchor === "left" || mode === MODE.BOOKMARK && bookmarks[active]);
  const drawerClasses = drawerPanelStyles(anchor === "left", realOpen)();

  //========================================================================================
  /*                                                                                      *
   *                                   Component's methods                                *
   *                                                                                      */
  //========================================================================================

  const activateActiveTabEditor = async () => {
    const tab = await call(
      PLUGINS.TABS.NAME,
      PLUGINS.TABS.CALL.GET_ACTIVE_TAB
    );
    activateKeyBind(tab.id);
  };

  /**
   * Select bookmark
   * @param {String} name : Bookmark name
   */
  const selectBookmarkCallback = useCallback(
    name => {
      activateActiveTabEditor();
      selectBookmark(anchor, name);
      emit((anchor === "right" ? PLUGINS.RIGHT_DRAWER : PLUGINS.LEFT_DRAWER).ON.CHANGE_BOOKMARK, { name });
    },
    [anchor, active, emit]
  );

  //========================================================================================
  /*                                                                                      *
   *                                   React lifecycles                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Methods exposed
   */
  usePluginMethods(ref, {
    removeBookmark: removeBookmark.bind(null, anchor),
    activateBookmarkView: activateBookmarkView.bind(null, anchor),
    activatePluginView: activatePluginView.bind(null, anchor),
    open: () => openDrawer(anchor),
    close: () => closeDrawer(anchor),
    toggle: () => toggleDrawer(anchor),
  });

  //========================================================================================
  /*                                                                                      *
   *                                         Render                                       *
   *                                                                                      */
  //========================================================================================

  /**
   * Render Bookmarks
   * @param {String} side : "left" or "right"
   * @returns {Element} : Bookmark panel
   */
  const renderBookmarks = useCallback(
    () => {
      return (
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
      );
    },
    [active, anchor, bookmarks, classes, selectBookmarkCallback]
  );
  // console.log("DRAWERPANEL", sub, realOpen);

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
          {mode === MODE.PLUGIN ? viewPlugins : (
            <div className={classes.bookmarkHolder}>{renderedView}</div>
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

export default withHostReactPlugin(
  DrawerPanel,
  DrawerPanel.pluginMethods
);

DrawerPanel.propTypes = {
  hostName: PropTypes.string.isRequired,
};

DrawerPanel.defaultProps = {};
