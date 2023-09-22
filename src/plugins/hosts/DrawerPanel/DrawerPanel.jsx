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
  bookmarks: {},
  active: null,
  left: {
    open: true,
    activeView: DRAWER.VIEWS.PLUGIN,
    renderedView: <></>,
  },
  right: {
    open: false,
    activeView: DRAWER.VIEWS.PLUGIN,
    renderedView: <></>,
  }
});

// const setBookmarks = bookmarkSub.makeEmitNow((current, bookmarks) => ({ ...current, bookmarks }));

function setActive(bookmarks, side, active) {
  if (!bookmarks[active])
    return side;

  else {
    const renderedView = bookmarks[active].view;

    return  {
      ...side,
      renderedView,
      activeView: DRAWER.VIEWS.BOOKMARK,
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
const setBookmark = bookmarkSub.makeEmitNow((current, bookmarks, activeBookmark) => {
  if (!bookmarks)
    return current;

  const active = getValidBookmark(bookmarks, activeBookmark);

  return echo("setBookmark", {
    ...current,
    bookmarks,
    active,
    right: setActive(bookmarks, current.right, active),
  });
});

export
const resetBookmarks = bookmarkSub.makeEmitNow((current) => {
  return echo("setBookmark", {
    ...current,
    bookmarks: {},
    active: null,
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
const addBookmark = bookmarkSub.makeEmitNow((current, data, activeBookmark, _isDefault, shouldOpen) => {
  const name = data.name;
  const bookmarks = {
    ...current.bookmarks,
    [name]: data,
  };

  // let newActive = isDefault && name;
  const active = getValidBookmark(bookmarks, activeBookmark);

  return echo("addBookmark", {
    ...current,
    bookmarks,
    active,
    right: setActive(bookmarks,
      { ...current.right, open: current.right.open ?? shouldOpen },
      active
    ),
  });
});

/**
 * Remove bookmark by name
 * @param {string} name : bookmark name
 * @param {string} activeBookmark : bookmark to make active
 */
export
const removeBookmark = bookmarkSub.makeEmitNow((current, name, activeBookmark) => {
  let bookmarks = { ...current.bookmarks };

  delete bookmarks[name];

  const active = getValidBookmark(bookmarks, activeBookmark);

  return echo("removeBookmark", {
    ...current,
    bookmarks,
    active,
    right: setActive(bookmarks, current.right, current.active !== name ? current.active : (
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
const activateBookmarkView = bookmarkSub.makeEmitNow((current) => echo("activateBookmarkView", {
  ...current,
  right: {
    ...current.right,
    activeView: DRAWER.VIEWS.BOOKMARK,
  }
}));

export
const activatePluginView = bookmarkSub.makeEmitNow((current, activeView) => {
  let open = !current.left.open;

  if (current.left.activeView !== DRAWER.VIEWS.PLUGIN)
    open = true;

  return echo("activatePluginView", {
    ...current,
    left: {
      ...current.left,
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
const selectBookmark = bookmarkSub.makeEmitNow((current, name) => {
  const drawerView = current.right.activeView;

  if (current.active === name && drawerView === DRAWER.VIEWS.BOOKMARK)
    return { ...current, right: { ...current.right, open: !current.right.open } };

  return echo("selectBookmark", {
    ...current,
    active: name,
    right: {
      ...setActive(current.bookmarks, current.right, name),
      open: true,
    }
  });
});

function BookmarkTab(props) {
  const { active, bookmark, classes, selectBookmark } = props;

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

  const handleOnClick = useCallback(() => {
    selectBookmark(bookmark.name);
  }, [bookmark.name, selectBookmark]);

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

  const {
    active,
    bookmarks,
    right,
    left
  } = useSub(bookmarkSub);

  const side = anchor === "left" ? left : right;

  const {
    renderedView,
    activeView,
    open,
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
      selectBookmark(name);
      emit(PLUGINS.RIGHT_DRAWER.ON.CHANGE_BOOKMARK, { name });
    },
    [active, emit]
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
      setBookmark,
      addBookmark,
      resetBookmarks: () => resetDrawer("right"),
      removeBookmark,
      activateBookmarkView,
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
              classes={classes}
              bookmark={bookmark}
              active={active}
              selectBookmark={selectBookmarkCallback}
            />
          ))}
        </div>
      );
    },
    [active, anchor, bookmarks, classes, selectBookmark]
  );

  return (
    <div className={classes.bookmarksContainer}>
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
