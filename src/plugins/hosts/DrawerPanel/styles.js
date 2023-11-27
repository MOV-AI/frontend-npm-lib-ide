import { makeStyles } from "@mui/styles";

export const drawerPanelStyles = (isLeft, isOpen) =>
  makeStyles(theme => ({
    content: {
      background: theme.palette.background.primary,
      color: theme.backdrop?.color,
      height: "100%",
      display: "flex",
      flexDirection: "column"
    },
    drawer: {
      overflow: "hidden",
      [isLeft ? "marginRight" : "marginLeft"]: "auto",
      width: isOpen ? 340 : "auto",
      height: "100%",
      position: "unset !important",
      "& > *": {
        position: "unset !important",
        width: 340,
        transition: "none !important"
      }
    }
  }));
