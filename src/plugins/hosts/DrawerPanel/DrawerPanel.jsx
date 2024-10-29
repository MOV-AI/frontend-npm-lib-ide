// live configurable debug and behavior
// accissible in devTools via window.drawer

import React, { useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import {
  BaseDrawer,
  Typography,
  Tooltip,
  IconButton,
} from "@mov-ai/mov-fe-lib-react";
import { DRAWER, PLUGINS } from "../../../utils/Constants";
import { withTheme } from "@mov-ai/mov-fe-lib-react";
import { withHostReactPlugin } from "../../../engine/ReactPlugin/HostReactPlugin";
import { bookmarkStyles } from "./../../../decorators/styles";
import { drawerPanelStyles } from "./styles";
import { Sub } from "@mov-ai/mov-fe-lib-sub";

class DrawerSub extends Sub {
  shared = true;

  constructor() {
    super({ url: "initial" }, "DrawerSub");
    this._suffix = "right";
  }

  isValidSuffix(suffix) {
    return suffix === "left" || suffix === "right";
  }

  get active() {
    this.get("$url.active");
  }

  set active(active) {
    this.update(active, "$url.active");
  }

  setActive(active, options = {}) {
    const { suffix = this.suffix, url = this._url } = options;
    this.update(
      {
        ...this.get(url + "/" + suffix),
        active,
      },
      url + "/" + suffix,
    );
  }

  set open(value) {
    if (value === this.open) {
      this._target = this._value;
      return;
    }
    this.update(
      {
        ...this._value,
        [this.index]: {
          ...(this._value[this.index] ?? {}),
          open: this.shared ? value : undefined,
        },
        [this._suffix]: value,
        url: this._url,
      },
      "$url.open",
      true,
    );
  }

  get open() {
    return this.shared
      ? this._value[this._suffix]
      : this._value[this.index]?.open;
  }

  add(name = "", value, props = {}) {
    const url = value.url.replace(".", "/") ?? this.url;
    const suffix = value.suffix ?? this.suffix;
    const cur = this.get(url + "/" + suffix) ?? {};
    const bookmarks = cur.bookmarks ?? {};

    if (
      !value.force &&
      bookmarks?.[name] &&
      !Object.entries(props).filter(
        ([key, value]) => value !== bookmarks[name].props[key],
      ).length
    )
      return;

    name = name.replace(".", "/");

    return this.update(
      {
        ...this.get(url + "/" + suffix),
        ...(value.select ? { active: name } : {}),
        bookmarks: Object.assign(bookmarks, {
          ...(bookmarks ?? {}),
          [name]: { ...value, props },
        }),
      },
      url + "/" + suffix,
    );
  }

  remove(name, options = {}) {
    const url = options.url ?? this.url;
    const suffix = options.suffix ?? this.suffix;
    const path = url + "/" + suffix + ".bookmarks";
    let bookmarks = { ...this.get(path) };
    delete bookmarks[name];
    return this.update(bookmarks, path);
  }
}

function selectBookmark(anchor, name) {
  drawerSub.suffix = anchor;
  drawerSub.setActive(name, { suffix: anchor });
  drawerSub.open = name === drawerSub.active ? true : !drawerSub.open;
}

export const drawerSub = new DrawerSub();
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
        <p className={active !== name ? classes.unselectedBookmark : ""}>
          {bookmark.icon}
        </p>
      </IconButton>
    </Tooltip>
  );
}

function DrawerPanel(props) {
  const {
    anchor,
    // emit,
    viewPlugins,
    hostName,
    style,
    className,
  } = props;

  const url = drawerSub.use("url");
  const side = drawerSub.use(url + "/" + anchor) ?? {};
  const sharedOpen = drawerSub.use(anchor);
  const { bookmarks = {}, open = true } = side;
  const active = side.active;
  const renderedView = bookmarks[active]?.view ?? <></>;
  const realOpen =
    (open || open === undefined) && (!active || bookmarks?.[active]);
  drawerSub.echo("DrawerPanel", side, sharedOpen, realOpen);
  const oppositeSide = anchor === "left" ? "right" : "left";
  const classes = bookmarkStyles(anchor, oppositeSide)();
  const drawerClasses = drawerPanelStyles(anchor === "left", realOpen)();

  const selectBookmarkCallback = useCallback(
    (name) => {
      selectBookmark(anchor, name);
    },
    [anchor, active],
  );

  const viewProps = bookmarks[active]?.props;

  const realView = useMemo(() => {
    if (typeof renderedView === "object") return renderedView;

    return renderedView(viewProps);
  }, [viewProps]);

  const renderBookmarks = useCallback(
    () => (
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
    ),
    [active, anchor, bookmarks, classes, selectBookmarkCallback],
  );

  return (
    <div className={classes.bookmarksContainer}>
      {anchor === "left" ? renderBookmarks() : null}
      {realOpen ? (
        <BaseDrawer
          id={hostName}
          open={realOpen}
          anchor={anchor}
          variant="persistent"
          style={style}
          className={`${drawerClasses.drawer} ${className}`}
        >
          <Typography component="div" className={drawerClasses.content}>
            {active ? (
              <div className={classes.bookmarkHolder}>{realView}</div>
            ) : (
              viewPlugins
            )}
          </Typography>
        </BaseDrawer>
      ) : null}
      {anchor === "right" ? renderBookmarks() : null}
    </div>
  );
}

DrawerPanel.pluginMethods = [
  ...Object.values(PLUGINS.RIGHT_DRAWER.CALL),
  ...Object.values(DRAWER.METHODS),
];

export default withTheme(
  withHostReactPlugin(DrawerPanel, DrawerPanel.pluginMethods),
);

DrawerPanel.propTypes = {
  hostName: PropTypes.string.isRequired,
};
