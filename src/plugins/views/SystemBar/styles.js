import { makeStyles } from "@material-ui/core/styles";
import { bindMagic } from "@tty-pt/styles";

const menuButtonStyles = {
  margin: "0px",
  padding: "0px",
  lineHeight: "26px",
  textTransform: "none",
  borderRadius: "0px",
  "& > .MuiTouchRipple-root": { borderRadius: "0px" }
};

export const systemBarStyles = bindMagic(theme => ({
  systemBar: {
    background: theme.topBarColor,
    height: "26px",
    borderBottom: "1px solid #000",
    "&.debug": {
      borderBottom: "solid 5px purple",
    },
    width: "100%",
    menuButton: {
      ...menuButtonStyles,
      padding: "0 10px",
      minWidth: "unset",
      color: theme.palette.grey[200],
      "&:hover": {
        background: theme.palette.grey[900]
      },
      "&:first-child": {
        marginLeft: "5px"
      }
    },
    activeMenu: {
      background: theme.palette.grey[900]
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
    color: theme.palette.grey[200],
    "& > .MuiButton-label": { paddingLeft: "10px" },
    "&:hover": {
      background: theme.palette.grey[900],
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
    background: theme.topBarColor,
    transform: "translate(99%)",
    transition: "opacity .3s, max-width .3s"
  }
}));

export const helpDialogStyles = bindMagic(_theme => ({
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
