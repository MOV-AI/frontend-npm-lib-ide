import React, { useCallback, useRef } from "react";
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

const debugDrawer = true;

const echo = makeEcho(debugDrawer, "DrawerPanel");

const bookmarkSub = makeSub({
  left: {
    open: true,
    activeView: DRAWER.VIEWS.PLUGIN,
    renderedView: <></>,
    bookmarks: {},
    active: null,
  },
  right: {
    open: false,
    activeView: DRAWER.VIEWS.PLUGIN,
    renderedView: <></>,
    bookmarks: {},
    active: null,
  }
});

// const setBookmarks = bookmarkSub.makeEmitNow((current, bookmarks) => ({ ...current, bookmarks }));

function setActive(side, active) {
  if (!side.bookmarks[active])
    return side;

  else {
    const renderedView = side.bookmarks[active].view;

    return  {
      ...side,
      renderedView,
      activeView: DRAWER.VIEWS.BOOKMARK,
      active,
    }
  }
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

/**
 * Set bookmarks
 * @param {*} newBookmarks
 * @param {String} activeBookmark bookmark to make active
 */
export
const setBookmark = bookmarkSub.makeEmitNow((current, side = "right", bookmarks, activeBookmark) => {
  if (!bookmarks)
    return current;

  const active = getValidBookmark(bookmarks, activeBookmark);

  return echo("setBookmark", {
    ...current,
    [side]: setActive({
      ...current[side],
      bookmarks,
      active,
    }, active),
  });
});

export
const resetBookmarks = bookmarkSub.makeEmitNow((current, side = "right") => {
  return echo("resetBookmarks", {
    ...current,
    [side]: {
      ...current[side],
      bookmarks: {},
      activeView: DRAWER.VIEWS.PLUGIN,
      active: null,
      open: side === "left" ? true : current[side].open,
    },
  });
});

/**
 * Add bookmark to drawer
 * @param data : {
 *    {Element} icon : Bookmark icon
 *    {String} name : Title
 *    {Element} view : Element to be rendered in menu container
 *  }
 *  @param {Boolean} isDefault : Set bookmark as active if true
 *  @param {string} activeBookmark : bookmark to make active
 */
export
const addBookmark = bookmarkSub.makeEmitNow((current, side = "right", data, activeBookmark, shouldOpen = true) => {
  const name = data.name;
  const bookmarks = {
    ...current[side].bookmarks,
    [name]: data,
  };

  // let newActive = isDefault && name;
  const active = getValidBookmark(bookmarks, activeBookmark);

  return echo("addBookmark", {
    ...current,
    [side]: setActive({
      ...current[side],
      open: current[side].open || shouldOpen,
      bookmarks,
    }, active),
  });
});

/**
 * Remove bookmark by name
 * @param {string} name : bookmark name
 * @param {string} activeBookmark : bookmark to make active
 */
export
const removeBookmark = bookmarkSub.makeEmitNow((current, side = "right", name, activeBookmark) => {
  let bookmarks = { ...current[side].bookmarks };

  delete bookmarks[name];

  const active = getValidBookmark(bookmarks, activeBookmark);

  return echo("removeBookmark", {
    ...current,
    [side]: setActive({
      ...current[side],
      bookmarks,
    }, current[side].active !== name ? current[side].active : (
      active
    )),
  });
});

export
const openDrawer = bookmarkSub.makeEmitNow((current, side) => echo("openDrawer", {
  ...current,
  [side]: { ...current[side], open: true },
}));

export
const closeDrawer = bookmarkSub.makeEmitNow((current, side) => echo("closeDrawer", {
  ...current,
  [side]: { ...current[side], open: false },
}));

export
const toggleDrawer = bookmarkSub.makeEmitNow((current, side) => echo("toggleDrawer", {
  ...current,
  [side]: { ...current[side], open: !current[side].open },
}));

export
const resetDrawer = bookmarkSub.makeEmitNow((current, side, open = false) => echo("resetDrawer", {
  ...current,
  [side]: {
    ...current[side],
    activeView: DRAWER.VIEWS.PLUGIN,
    renderedView: <></>,
    open,
  },
}));

export
const activateBookmarkView = bookmarkSub.makeEmitNow((current, side = "right") => echo("activateBookmarkView", {
  ...current,
  [side]: {
    ...current[side],
    activeView: DRAWER.VIEWS.BOOKMARK,
  }
}));

export
const activatePluginView = bookmarkSub.makeEmitNow((current, side = "left") => {
  let open = !current[side].open;

  if (current[side].activeView !== DRAWER.VIEWS.PLUGIN)
    open = true;

  return echo("activatePluginView", {
    ...current,
    [side]: {
      ...current[side],
      activeView: DRAWER.VIEWS.PLUGIN,
      open,
    }
  });
});

/**
 * Select bookmark
 * @param {String} name : Bookmark name
 */
export
const selectBookmark = bookmarkSub.makeEmitNow((current, side = "right", name) => {
  const drawerView = current[side].activeView;

  if (current.active === name && drawerView === DRAWER.VIEWS.BOOKMARK)
    return { ...current, [side]: { ...current[side], open: !current[side].open } };

  return echo("selectBookmark", {
    ...current,
    [side]: setActive({
      ...current[side],
      open: current[side].active === name ? !current[side].open : true,
    }, name),
  });
});

function BookmarkTab(props) {
  const { active, bookmark, anchor, classes } = props;

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

  const handleOnClick = useCallback(() => {
    selectBookmark(anchor, bookmark.name);
  }, [bookmark.name, anchor]);

  return (
    <Tooltip title={bookmark.title || bookmark.name} placement="left">
      <IconButton
        data-testid="input_bookmark-tab"
        onClick={handleOnClick}
        aria-label={bookmark.title}
        className={classes.bookmark}
        size="small"
      >
        <p
          className={active !== bookmark.name ? classes.unselectedBookmark : ""}
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

  const { right, left } = useSub(bookmarkSub);

  const side = anchor === "left" ? left : right;

  const {
    renderedView,
    activeView,
    open,
    active,
    bookmarks,
  } = side;

  console.log("DrawerPanel", active, bookmarks, right, left, anchor, side);

  // Refs
  const oppositeSide = anchor === "left" ? "right" : "left";
  // Style hooks
  const classes = bookmarkStyles(anchor, oppositeSide)();
  const drawerClasses = drawerPanelStyles(anchor === "left", open)();

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
    // ...(anchor === "right" ? {
      setBookmark: setBookmark.bind(null, anchor),
      addBookmark: addBookmark.bind(null, anchor),
      resetBookmarks: resetBookmarks.bind(null, anchor),
      removeBookmark: removeBookmark.bind(null, anchor),
      activateBookmarkView: activateBookmarkView.bind(null, anchor),
    // } : {
      activatePluginView,
    // }),
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
          {Object.values(bookmarks).map(bookmark => (
            <BookmarkTab
              data-testid="section_bookmark-tab"
              key={bookmark.name}
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

  return (
    <div className={classes.bookmarksContainer}>
      {anchor === "left" ? renderBookmarks() : null }
      <Drawer
        id={hostName}
        open={open}
        anchor={anchor}
        variant="persistent"
        style={style}
        className={`${drawerClasses.drawer} ${className}`}
      >
        <Typography component="div" className={drawerClasses.content}>
          {activeView === DRAWER.VIEWS.PLUGIN ? viewPlugins : (
            <div className={drawerClasses.bookmarkHolder}>{renderedView}</div>
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
