import { makeStyles } from "@material-ui/core/styles";

export const mainMenuStyles = makeStyles(theme => ({
  mainMenuHolder: {
    height: "100%"
  },
  icon: {
    color: theme.palette.primary.main,
    cursor: "pointer",
    "& svg": {
      color: theme.palette.primary.main
    }
  },
  movaiIcon: {
    padding: "10px",
    width: "50px",
    height: "50px"
  }
}));
