import { makeStyles } from "@mov-ai/mov-fe-lib-react";

export const bookmarkStyles = (side, oppositeSide) =>
  makeStyles(theme => ({
    bookmarksContainer: { position: "relative" },
    bookmarkHolder: { height: "100%" },
    panel: {
      position: "absolute",
      [oppositeSide]: -40,
      background: "#fff0",
      top: "60px",
      width: "40px",
      zIndex: "1",
    },
    bookmark: {
      width: "40px",
      height: "40px",
      margin: "3px 0 !important",
      border: `solid 1px ${theme.palette.background.primary} !important`,
      [`border-${side}`]: "none !important",
      borderRadius: "0px !important",
      background: `${theme.palette.background.secondary} !important`,
      "& p": {
        marginTop: "10px"
      }
    },
    unselectedBookmark: {
      color: theme.palette.text.primary,
    }
  }));

export const loaderStyles = makeStyles(_theme => ({
  root: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    "& > div[class^='container-']": {
      height: "100%"
    },
    "& > div.container-Node": {
      overflow: "auto"
    }
  }
}));
