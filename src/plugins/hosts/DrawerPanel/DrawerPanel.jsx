// live configurable debug and behavior
// accissible in devTools via window.drawer

import React, { useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { withTheme } from "@mov-ai/mov-fe-lib-react";
import { Drawer, Typography, Tooltip, IconButton } from "@material-ui/core";
import { DRAWER, PLUGINS } from "../../../utils/Constants";
import { activateKeyBind } from "../../../utils/Utils";
import { withHostReactPlugin } from "../../../engine/ReactPlugin/HostReactPlugin";
import { bookmarkStyles } from "./../../../decorators/styles";
import { drawerPanelStyles } from "./styles";
import { Sub, reflect } from "@tty-pt/sub";

class DrawerSub extends Sub {
  shared = true;

  constructor() {
    super({ url: "initial" }, "DrawerSub");
    this._suffix = "right";
  }

  isValidSuffix(suffix) {
    return suffix === "left" || suffix === "right";
  }

  @reflect("$url")
  set plugin(value) {
    this._target = value;
  }

  @reflect("$url")
  set active(active) {
    this.plugin = false;
    this._target = active;
  }

  @reflect("$url", true)
  set open(value) {
    if (value === this.open) {
      this._target = this._value;
      return;
    }
    this._target = this.set({
      ...this._value,
      [this.index]: { ...this._value[this.index] ?? {}, open: value },
      [this._suffix]: value,
      url: this._url,
    });
  }

  get open() {
    return this.shared ? this._value[this._suffix] : this._value[this.index]?.open;
  }

  @reflect("$url.bookmarks")
  add(name = "", value, open = false, props = {}) {
    const bookmarks = this.get();
    if (bookmarks?.[name] && !(Object.entries(props)).filter(
      ([key, value]) => value !== bookmarks[name].props[key]
    ).length)
      return bookmarks;
    name = name.replace(".", "/");
    this.open = this.open || open;
    if (this.open) {
      this.plugin = false;
      this.active = name;
    }
    return {
      ...(bookmarks ?? {}),
      [name]: { ...value, props },
    };
  }

  @reflect("$url.bookmarks")
  remove(name) {
    let bookmarks = { ...this.get() };
    delete bookmarks[name];
    return bookmarks;
  }
}

function selectBookmark(anchor, name) {
  drawerSub.suffix = anchor;
  drawerSub.open = name !== drawerSub._value[drawerSub.index]?.active ? true : !drawerSub.open;
  drawerSub.active = name;
}

export
const drawerSub = new DrawerSub();
window.drawer = drawerSub;
drawerSub._suffix = "left";
drawerSub.open = true;
drawerSub._suffix = "right";

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

  const cur = drawerSub.use("");
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
  drawerSub.echo("DrawerPanel", cur, sharedOpen, realOpen);
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
