import { makeStyles } from "@mov-ai/mov-fe-lib-react";

const menuButtonStyles = {
  margin: "0px !important",
  padding: "0px !important",
  lineHeight: "26px !important",
  textTransform: "none !important",
  borderRadius: "0px",
  "& > .MuiTouchRipple-root": { borderRadius: "0px" }
};

export const systemBarStyles = debugMode =>
  makeStyles(theme => ({
    systemBar: {
      background: theme.topBarColor,
      height: "26px",
      borderBottom: debugMode ? "solid 5px purple" : "1px solid #000",
      width: "100%"
    },
    menuButton: {
      ...menuButtonStyles,
      padding: "0 10px !important",
      minWidth: "unset",
      borderRadius: "0px !important",
      color: theme.palette.text.primary + " !important",
      "&:first-child": {
        marginLeft: "5px !important"
      }
    },
  }));

export const systemMenuStyles = makeStyles(theme => ({
  popper: {
    zIndex: 999999
  },
  listHolder: {
    minWidth: "300px",
    borderRadius: "0px 0px 5px 5px",
    background: theme.topBarColor
  },
  list: {
    ...menuButtonStyles,
    marginTop: "1px"
  },
  menuDivider: {
    background: theme.palette.grey[200]
  }
}));

export const systemMenuItemStyles = makeStyles(theme => ({
  listItem: {
    ...menuButtonStyles,
    "& > button:hover": {
      boxShadow: "none",
    },
    "& > button": {
      display: "flex",
      textAlign: "left",
      background: "transparent",
      boxShadow: "none",
      color: theme.palette.text.primary,
      "& > span:first-child": {
        flexGrow: 1,
      },
    },
    "&:last-of-type > button": {
      borderRadius: "0px 0px 5px 5px"
    }
  },
  menuButton: {
    ...menuButtonStyles,
    fontFamily: "Open Sans",
    display: "inline-flex",
    fontSize: "0.875rem",
    width: "100%",
    justifyContent: "space-between",
    color: theme.palette.text.primary + " !important",
    "& > .MuiButton-label": { paddingLeft: "10px" },
    "&:hover": {
      "& > .MuiButton-label > ul": {
        opacity: "1",
        maxWidth: "500px"
      }
    }
  },
  icon: {
    verticalAlign: "text-top",
    marginRight: "10px",
    "& > svg": {
      fontSize: "1rem"
    }
  },
  keybind: {
    paddingRight: "10px",
    fontStyle: "italic",
    color: theme.palette.grey[400]
  },
  subMenuHolder: {
    position: "absolute",
    top: "0px",
    right: "0px",
    minWidth: "300px",
    maxWidth: "0px",
    opacity: "0",
    borderRadius: "3px",
    boxShadow: "1px 1px 2px 1px #333",
    margin: "0",
    padding: "0",
    color: theme.palette.text.primary + " !important",
    background: theme.topBarColor + " !important",
    transform: "translate(99%)",
    transition: "opacity .3s, max-width .3s"
  }
}));

export const helpDialogStyles = makeStyles(_theme => ({
  movaiIcon: {
    height: "24px",
    verticalAlign: "sub",
    marginRight: "5px"
  },
  contentHolder: {
    "& > p": {
      margin: "0px"
    }
  }
}));
